"""Authentication routes for SecureVault."""

import re
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
    get_jwt
)
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import bcrypt

from models import db, User, RevokedToken
from .jwt_handler import JWTHandler
from .totp import TOTPManager

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# Rate limiter will be initialized in app.py
limiter = Limiter(key_func=get_remote_address)


def validate_email(email: str) -> bool:
    """Validate email format."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_password(password: str) -> tuple[bool, str]:
    """Validate password requirements."""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r'\d', password):
        return False, "Password must contain at least one digit"
    return True, ""


def hash_password(password: str) -> str:
    """Hash password using bcrypt."""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash."""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))


@auth_bp.route('/register', methods=['POST'])
@limiter.limit("5 per minute")
def register():
    """
    Register a new user.
    
    Request body:
        - email: User's email address
        - password: User's password (min 8 chars, mixed case, digit)
    
    Returns:
        - 201: User created successfully
        - 400: Invalid input
        - 409: Email already exists
    """
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    # Validate email
    if not email or not validate_email(email):
        return jsonify({'error': 'Invalid email address'}), 400
    
    # Validate password
    valid, message = validate_password(password)
    if not valid:
        return jsonify({'error': message}), 400
    
    # Check if user exists
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 409
    
    # Create user
    user = User(
        email=email,
        password_hash=hash_password(password)
    )
    
    db.session.add(user)
    db.session.commit()
    
    # Create tokens
    tokens = JWTHandler.create_tokens(user.id)
    
    return jsonify({
        'message': 'User registered successfully',
        'user': user.to_dict(),
        **tokens
    }), 201


@auth_bp.route('/login', methods=['POST'])
@limiter.limit("10 per minute")
def login():
    """
    Authenticate user and return tokens.
    
    Request body:
        - email: User's email address
        - password: User's password
        - totp_code: Optional 2FA code if enabled
    
    Returns:
        - 200: Login successful
        - 400: Invalid input
        - 401: Invalid credentials
        - 403: 2FA required
    """
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    totp_code = data.get('totp_code')
    
    # Find user
    user = User.query.filter_by(email=email).first()
    
    if not user or not verify_password(password, user.password_hash):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Check 2FA
    if user.totp_enabled:
        if not totp_code:
            return jsonify({
                'error': '2FA code required',
                'requires_2fa': True
            }), 403
        
        if not TOTPManager.verify_code(user.totp_secret, totp_code):
            return jsonify({'error': 'Invalid 2FA code'}), 401
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.session.commit()
    
    # Create tokens
    additional_claims = {
        'totp_enabled': user.totp_enabled,
        'totp_verified': True if user.totp_enabled else None
    }
    tokens = JWTHandler.create_tokens(user.id, additional_claims)
    
    return jsonify({
        'message': 'Login successful',
        'user': user.to_dict(),
        **tokens
    }), 200


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    Logout user by revoking tokens.
    
    Returns:
        - 200: Logout successful
    """
    jti = get_jwt()['jti']
    JWTHandler.revoke_token(jti)
    
    return jsonify({'message': 'Logout successful'}), 200


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """
    Refresh access token.
    
    Returns:
        - 200: New access token
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    additional_claims = {
        'totp_enabled': user.totp_enabled,
        'totp_verified': True if user.totp_enabled else None
    }
    
    access_token = JWTHandler.refresh_access_token(user_id, additional_claims)
    
    return jsonify({
        'access_token': access_token
    }), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """
    Get current user info.
    
    Returns:
        - 200: User data
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({'user': user.to_dict()}), 200


@auth_bp.route('/2fa/setup', methods=['POST'])
@jwt_required()
def setup_2fa():
    """
    Setup 2FA for user account.
    
    Returns:
        - 200: 2FA setup data (secret, QR code)
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if user.totp_enabled:
        return jsonify({'error': '2FA is already enabled'}), 400
    
    # Generate 2FA secret and QR code
    secret, uri, qr_code = TOTPManager.setup_2fa(user.email)
    
    # Store secret temporarily (user must verify before enabling)
    user.totp_secret = secret
    db.session.commit()
    
    return jsonify({
        'message': '2FA setup initiated. Scan QR code with authenticator app.',
        'secret': secret,
        'qr_code': f'data:image/png;base64,{qr_code}',
        'provisioning_uri': uri
    }), 200


@auth_bp.route('/2fa/verify', methods=['POST'])
@jwt_required()
def verify_2fa():
    """
    Verify 2FA code and enable 2FA for account.
    
    Request body:
        - code: 6-digit TOTP code
    
    Returns:
        - 200: 2FA enabled
        - 400: Invalid code
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    code = data.get('code', '')
    
    if not user.totp_secret:
        return jsonify({'error': 'Please setup 2FA first'}), 400
    
    if not TOTPManager.verify_code(user.totp_secret, code):
        return jsonify({'error': 'Invalid verification code'}), 400
    
    # Enable 2FA
    user.totp_enabled = True
    db.session.commit()
    
    return jsonify({
        'message': '2FA has been enabled for your account'
    }), 200


@auth_bp.route('/2fa/disable', methods=['POST'])
@jwt_required()
def disable_2fa():
    """
    Disable 2FA for account.
    
    Request body:
        - code: 6-digit TOTP code
        - password: User's password
    
    Returns:
        - 200: 2FA disabled
        - 400: Invalid code or password
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if not user.totp_enabled:
        return jsonify({'error': '2FA is not enabled'}), 400
    
    data = request.get_json()
    code = data.get('code', '')
    password = data.get('password', '')
    
    # Verify password
    if not verify_password(password, user.password_hash):
        return jsonify({'error': 'Invalid password'}), 400
    
    # Verify TOTP code
    if not TOTPManager.verify_code(user.totp_secret, code):
        return jsonify({'error': 'Invalid 2FA code'}), 400
    
    # Disable 2FA
    user.totp_enabled = False
    user.totp_secret = None
    db.session.commit()
    
    return jsonify({
        'message': '2FA has been disabled for your account'
    }), 200


@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """
    Change user password.
    
    Request body:
        - current_password: Current password
        - new_password: New password
    
    Returns:
        - 200: Password changed
        - 400: Invalid input
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    current_password = data.get('current_password', '')
    new_password = data.get('new_password', '')
    
    # Verify current password
    if not verify_password(current_password, user.password_hash):
        return jsonify({'error': 'Current password is incorrect'}), 400
    
    # Validate new password
    valid, message = validate_password(new_password)
    if not valid:
        return jsonify({'error': message}), 400
    
    # Update password
    user.password_hash = hash_password(new_password)
    db.session.commit()
    
    return jsonify({
        'message': 'Password changed successfully'
    }), 200


@auth_bp.route('/delete-account', methods=['DELETE'])
@jwt_required()
def delete_account():
    """
    Delete user account.
    
    Request body:
        - password: User's password
    
    Returns:
        - 200: Account deleted
        - 400: Invalid password
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    password = data.get('password', '')
    
    # Verify password
    if not verify_password(password, user.password_hash):
        return jsonify({'error': 'Invalid password'}), 400
    
    # Delete user (cascade will delete vault entries)
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({
        'message': 'Account deleted successfully'
    }), 200
