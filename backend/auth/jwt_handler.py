"""JWT token management for SecureVault."""

from functools import wraps
from flask import jsonify
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    create_refresh_token,
    get_jwt_identity,
    get_jwt,
    verify_jwt_in_request
)
from models import RevokedToken, db


class JWTHandler:
    """
    JWT token management handler.
    
    Features:
    - Access and refresh token generation
    - Token revocation (logout)
    - Token blocklist checking
    """
    
    def __init__(self, app=None):
        """Initialize JWT handler."""
        self.jwt = JWTManager()
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize with Flask app."""
        self.jwt.init_app(app)
        self._register_callbacks()
    
    def _register_callbacks(self):
        """Register JWT callbacks."""
        
        @self.jwt.token_in_blocklist_loader
        def check_if_token_revoked(jwt_header, jwt_payload):
            """Check if token has been revoked."""
            jti = jwt_payload['jti']
            return RevokedToken.is_token_revoked(jti)
        
        @self.jwt.revoked_token_loader
        def revoked_token_callback(jwt_header, jwt_payload):
            """Handle revoked token access."""
            return jsonify({
                'error': 'Token has been revoked',
                'message': 'Please log in again'
            }), 401
        
        @self.jwt.expired_token_loader
        def expired_token_callback(jwt_header, jwt_payload):
            """Handle expired token."""
            return jsonify({
                'error': 'Token has expired',
                'message': 'Please log in again'
            }), 401
        
        @self.jwt.invalid_token_loader
        def invalid_token_callback(error):
            """Handle invalid token."""
            return jsonify({
                'error': 'Invalid token',
                'message': str(error)
            }), 401
        
        @self.jwt.unauthorized_loader
        def unauthorized_callback(error):
            """Handle missing token."""
            return jsonify({
                'error': 'Authorization required',
                'message': 'Please log in to access this resource'
            }), 401
    
    @staticmethod
    def create_tokens(user_id: int, additional_claims: dict = None) -> dict:
        """
        Create access and refresh tokens for a user.
        
        Args:
            user_id: User ID to embed in token
            additional_claims: Extra claims to add to token
        
        Returns:
            Dictionary with access_token and refresh_token
        """
        claims = additional_claims or {}
        
        access_token = create_access_token(
            identity=user_id,
            additional_claims=claims
        )
        refresh_token = create_refresh_token(
            identity=user_id,
            additional_claims=claims
        )
        
        return {
            'access_token': access_token,
            'refresh_token': refresh_token
        }
    
    @staticmethod
    def refresh_access_token(user_id: int, additional_claims: dict = None) -> str:
        """
        Create a new access token from refresh token.
        
        Args:
            user_id: User ID from refresh token
            additional_claims: Extra claims to add to token
        
        Returns:
            New access token
        """
        claims = additional_claims or {}
        return create_access_token(
            identity=user_id,
            additional_claims=claims
        )
    
    @staticmethod
    def revoke_token(jti: str) -> bool:
        """
        Revoke a token by adding to blocklist.
        
        Args:
            jti: JWT ID to revoke
        
        Returns:
            True if successful
        """
        revoked_token = RevokedToken(jti=jti)
        db.session.add(revoked_token)
        db.session.commit()
        return True


def jwt_required_with_2fa(fn):
    """
    Decorator that requires JWT auth and verified 2FA if enabled.
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        claims = get_jwt()
        
        # Check if 2FA is required but not verified
        if claims.get('totp_required') and not claims.get('totp_verified'):
            return jsonify({
                'error': '2FA verification required',
                'requires_2fa': True
            }), 403
        
        return fn(*args, **kwargs)
    return wrapper
