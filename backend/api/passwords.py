"""Password vault API endpoints."""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity

from models import db, VaultEntry
from security.encryption import EncryptionManager
from security.password_analyzer import PasswordAnalyzer
from security.password_generator import PasswordGenerator
from security.breach_checker import BreachChecker

passwords_bp = Blueprint('passwords', __name__, url_prefix='/api')

# Fields to encrypt in vault entries
ENCRYPTED_FIELDS = ['username', 'password', 'notes']


def get_encryption_manager():
    """Get encryption manager with app key."""
    key = current_app.config.get('ENCRYPTION_KEY')
    if key:
        if isinstance(key, str):
            key = key.encode('utf-8')[:32].ljust(32, b'\0')
        manager = EncryptionManager(key)
    else:
        # Generate a key for development (in production, use env var)
        manager = EncryptionManager(EncryptionManager.generate_key())
    return manager


@passwords_bp.route('/analyze', methods=['POST'])
def analyze_password():
    """
    Analyze password strength.
    
    Request body:
        - password: Password to analyze
    
    Returns:
        - 200: Analysis results
    """
    data = request.get_json()
    
    if not data or 'password' not in data:
        return jsonify({'error': 'Password is required'}), 400
    
    password = data['password']
    
    if not password:
        return jsonify({'error': 'Password cannot be empty'}), 400
    
    analyzer = PasswordAnalyzer(password)
    result = analyzer.analyze()
    
    return jsonify(result), 200


@passwords_bp.route('/generate', methods=['POST'])
def generate_password():
    """
    Generate a secure password.
    
    Request body (optional):
        - length: Password length (default 16)
        - use_lowercase: Include lowercase (default true)
        - use_uppercase: Include uppercase (default true)
        - use_digits: Include digits (default true)
        - use_symbols: Include symbols (default true)
        - type: 'password' or 'passphrase' (default 'password')
        - word_count: For passphrases (default 4)
    
    Returns:
        - 200: Generated password with analysis
    """
    data = request.get_json() or {}
    
    gen_type = data.get('type', 'password')
    
    if gen_type == 'passphrase':
        word_count = data.get('word_count', 4)
        separator = data.get('separator', '-')
        
        generator = PasswordGenerator()
        password = generator.generate_passphrase(
            word_count=min(10, max(3, word_count)),
            separator=separator
        )
    else:
        length = data.get('length', 16)
        length = min(128, max(8, length))
        
        generator = PasswordGenerator(
            length=length,
            use_lowercase=data.get('use_lowercase', True),
            use_uppercase=data.get('use_uppercase', True),
            use_digits=data.get('use_digits', True),
            use_symbols=data.get('use_symbols', True),
            exclude_ambiguous=data.get('exclude_ambiguous', False)
        )
        password = generator.generate()
    
    # Analyze the generated password
    analyzer = PasswordAnalyzer(password)
    analysis = analyzer.analyze()
    
    return jsonify({
        'password': password,
        'analysis': analysis
    }), 200


@passwords_bp.route('/breach/check-password', methods=['POST'])
def check_password_breach():
    """
    Check if password has been in a data breach.
    
    Request body:
        - password: Password to check
    
    Returns:
        - 200: Breach check results
    """
    data = request.get_json()
    
    if not data or 'password' not in data:
        return jsonify({'error': 'Password is required'}), 400
    
    password = data['password']
    
    try:
        checker = BreachChecker()
        result = checker.check_password(password)
        
        # Add hash info for educational purposes
        hash_info = checker.get_password_hash_info(password)
        result['hash_info'] = hash_info
        
        return jsonify(result), 200
    except Exception as e:
        current_app.logger.error(f"Password breach check error: {str(e)}")
        return jsonify({
            'breached': None,
            'count': None,
            'error': f'Service temporarily unavailable: {str(e)}'
        }), 200  # Return 200 with error in body so frontend can display it


@passwords_bp.route('/breach/check-email', methods=['POST'])
def check_email_breach():
    """
    Check if email has been in data breaches.
    
    Request body:
        - email: Email to check
    
    Returns:
        - 200: Breach check results
    """
    data = request.get_json()
    
    if not data or 'email' not in data:
        return jsonify({'error': 'Email is required'}), 400
    
    email = data['email']
    api_key = current_app.config.get('HIBP_API_KEY')
    
    checker = BreachChecker(api_key=api_key)
    result = checker.check_email(email)
    
    return jsonify(result), 200


# Vault endpoints (require authentication)

@passwords_bp.route('/vault', methods=['GET'])
@jwt_required()
def get_vault_entries():
    """
    Get all vault entries for current user.
    
    Query params:
        - category: Filter by category
        - search: Search in title
    
    Returns:
        - 200: List of vault entries
    """
    user_id = get_jwt_identity()
    encryption = get_encryption_manager()
    
    query = VaultEntry.query.filter_by(user_id=user_id)
    
    # Apply filters
    category = request.args.get('category')
    if category:
        query = query.filter_by(category=category)
    
    search = request.args.get('search')
    if search:
        query = query.filter(VaultEntry.title.ilike(f'%{search}%'))
    
    entries = query.order_by(VaultEntry.updated_at.desc()).all()
    
    # Decrypt sensitive fields
    result = []
    for entry in entries:
        entry_dict = entry.to_dict()
        entry_dict = encryption.decrypt_dict(entry_dict, ENCRYPTED_FIELDS)
        result.append(entry_dict)
    
    return jsonify({
        'entries': result,
        'count': len(result)
    }), 200


@passwords_bp.route('/vault', methods=['POST'])
@jwt_required()
def create_vault_entry():
    """
    Create a new vault entry.
    
    Request body:
        - title: Entry title (required)
        - username: Username/email (optional)
        - password: Password (required)
        - url: Website URL (optional)
        - notes: Additional notes (optional)
        - category: Category tag (default: 'general')
    
    Returns:
        - 201: Created entry
    """
    user_id = get_jwt_identity()
    encryption = get_encryption_manager()
    
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    title = data.get('title', '').strip()
    password = data.get('password', '')
    
    if not title:
        return jsonify({'error': 'Title is required'}), 400
    
    if not password:
        return jsonify({'error': 'Password is required'}), 400
    
    # Encrypt sensitive fields
    encrypted_data = encryption.encrypt_dict(data, ENCRYPTED_FIELDS)
    
    entry = VaultEntry(
        user_id=user_id,
        title=title,
        username=encrypted_data.get('username'),
        password=encrypted_data['password'],
        url=data.get('url', ''),
        notes=encrypted_data.get('notes'),
        category=data.get('category', 'general'),
        favorite=data.get('favorite', False)
    )
    
    db.session.add(entry)
    db.session.commit()
    
    # Return decrypted entry
    entry_dict = entry.to_dict()
    entry_dict = encryption.decrypt_dict(entry_dict, ENCRYPTED_FIELDS)
    
    return jsonify({
        'message': 'Entry created successfully',
        'entry': entry_dict
    }), 201


@passwords_bp.route('/vault/<int:entry_id>', methods=['GET'])
@jwt_required()
def get_vault_entry(entry_id):
    """
    Get a specific vault entry.
    
    Returns:
        - 200: Entry data
        - 404: Entry not found
    """
    user_id = get_jwt_identity()
    encryption = get_encryption_manager()
    
    entry = VaultEntry.query.filter_by(id=entry_id, user_id=user_id).first()
    
    if not entry:
        return jsonify({'error': 'Entry not found'}), 404
    
    entry_dict = entry.to_dict()
    entry_dict = encryption.decrypt_dict(entry_dict, ENCRYPTED_FIELDS)
    
    return jsonify({'entry': entry_dict}), 200


@passwords_bp.route('/vault/<int:entry_id>', methods=['PUT'])
@jwt_required()
def update_vault_entry(entry_id):
    """
    Update a vault entry.
    
    Request body:
        - title: Entry title
        - username: Username/email
        - password: Password
        - url: Website URL
        - notes: Additional notes
        - category: Category tag
        - favorite: Favorite flag
    
    Returns:
        - 200: Updated entry
        - 404: Entry not found
    """
    user_id = get_jwt_identity()
    encryption = get_encryption_manager()
    
    entry = VaultEntry.query.filter_by(id=entry_id, user_id=user_id).first()
    
    if not entry:
        return jsonify({'error': 'Entry not found'}), 404
    
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # Encrypt sensitive fields
    encrypted_data = encryption.encrypt_dict(data, ENCRYPTED_FIELDS)
    
    # Update fields
    if 'title' in data:
        entry.title = data['title'].strip()
    if 'username' in encrypted_data:
        entry.username = encrypted_data['username']
    if 'password' in encrypted_data:
        entry.password = encrypted_data['password']
    if 'url' in data:
        entry.url = data['url']
    if 'notes' in encrypted_data:
        entry.notes = encrypted_data['notes']
    if 'category' in data:
        entry.category = data['category']
    if 'favorite' in data:
        entry.favorite = data['favorite']
    
    db.session.commit()
    
    entry_dict = entry.to_dict()
    entry_dict = encryption.decrypt_dict(entry_dict, ENCRYPTED_FIELDS)
    
    return jsonify({
        'message': 'Entry updated successfully',
        'entry': entry_dict
    }), 200


@passwords_bp.route('/vault/<int:entry_id>', methods=['DELETE'])
@jwt_required()
def delete_vault_entry(entry_id):
    """
    Delete a vault entry.
    
    Returns:
        - 200: Entry deleted
        - 404: Entry not found
    """
    user_id = get_jwt_identity()
    
    entry = VaultEntry.query.filter_by(id=entry_id, user_id=user_id).first()
    
    if not entry:
        return jsonify({'error': 'Entry not found'}), 404
    
    db.session.delete(entry)
    db.session.commit()
    
    return jsonify({
        'message': 'Entry deleted successfully'
    }), 200
