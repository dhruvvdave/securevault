"""Dashboard analytics API endpoints."""

from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from models import db, VaultEntry, User
from security.password_analyzer import PasswordAnalyzer
from security.encryption import EncryptionManager
from flask import current_app

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

# Fields to decrypt
ENCRYPTED_FIELDS = ['username', 'password', 'notes']


def get_encryption_manager():
    """Get encryption manager with app key."""
    key = current_app.config.get('ENCRYPTION_KEY')
    if key:
        if isinstance(key, str):
            key = key.encode('utf-8')[:32].ljust(32, b'\0')
        manager = EncryptionManager(key)
    else:
        manager = EncryptionManager(EncryptionManager.generate_key())
    return manager


@dashboard_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    """
    Get security statistics for dashboard.
    
    Returns:
        - 200: Dashboard statistics
    """
    user_id = get_jwt_identity()
    encryption = get_encryption_manager()
    
    # Get user
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get all vault entries
    entries = VaultEntry.query.filter_by(user_id=user_id).all()
    
    # Calculate statistics
    total_passwords = len(entries)
    
    if total_passwords == 0:
        return jsonify({
            'total_passwords': 0,
            'security_score': 100,
            'weak_passwords': 0,
            'moderate_passwords': 0,
            'strong_passwords': 0,
            'reused_passwords': 0,
            'average_strength': 0,
            'categories': {},
            'recommendations': [
                'Start adding passwords to your vault to see security insights.'
            ]
        }), 200
    
    # Analyze all passwords
    weak_count = 0
    moderate_count = 0
    strong_count = 0
    total_score = 0
    password_hashes = {}
    categories = {}
    
    for entry in entries:
        # Decrypt password
        try:
            decrypted = encryption.decrypt(entry.password)
        except Exception:
            decrypted = entry.password
        
        # Analyze
        analyzer = PasswordAnalyzer(decrypted)
        analysis = analyzer.analyze()
        
        score = analysis['score']
        total_score += score
        
        if score < 40:
            weak_count += 1
        elif score < 70:
            moderate_count += 1
        else:
            strong_count += 1
        
        # Check for reused passwords (hash to compare)
        pw_hash = hash(decrypted)
        if pw_hash in password_hashes:
            password_hashes[pw_hash] += 1
        else:
            password_hashes[pw_hash] = 1
        
        # Count categories
        cat = entry.category or 'general'
        categories[cat] = categories.get(cat, 0) + 1
    
    # Count reused passwords
    reused_count = sum(1 for count in password_hashes.values() if count > 1)
    
    # Calculate average strength
    average_strength = total_score / total_passwords
    
    # Calculate overall security score
    security_score = calculate_security_score(
        average_strength,
        weak_count,
        reused_count,
        total_passwords,
        user.totp_enabled
    )
    
    # Generate recommendations
    recommendations = generate_recommendations(
        weak_count,
        reused_count,
        user.totp_enabled,
        total_passwords
    )
    
    return jsonify({
        'total_passwords': total_passwords,
        'security_score': round(security_score),
        'weak_passwords': weak_count,
        'moderate_passwords': moderate_count,
        'strong_passwords': strong_count,
        'reused_passwords': reused_count,
        'average_strength': round(average_strength),
        'categories': categories,
        'totp_enabled': user.totp_enabled,
        'recommendations': recommendations
    }), 200


def calculate_security_score(
    avg_strength: float,
    weak_count: int,
    reused_count: int,
    total: int,
    totp_enabled: bool
) -> float:
    """Calculate overall security score."""
    if total == 0:
        return 100.0
    
    # Base score from average password strength (0-60 points)
    base_score = (avg_strength / 100) * 60
    
    # Penalty for weak passwords (up to -20 points)
    weak_penalty = min(20, (weak_count / total) * 20)
    
    # Penalty for reused passwords (up to -15 points)
    reuse_penalty = min(15, (reused_count / total) * 15)
    
    # Bonus for 2FA (10 points)
    totp_bonus = 10 if totp_enabled else 0
    
    # Bonus for having passwords (5 points)
    has_passwords_bonus = 5 if total > 0 else 0
    
    score = base_score - weak_penalty - reuse_penalty + totp_bonus + has_passwords_bonus
    
    return max(0, min(100, score))


def generate_recommendations(
    weak_count: int,
    reused_count: int,
    totp_enabled: bool,
    total: int
) -> list:
    """Generate security recommendations."""
    recommendations = []
    
    if weak_count > 0:
        recommendations.append(
            f"You have {weak_count} weak password(s). Consider updating them with stronger alternatives."
        )
    
    if reused_count > 0:
        recommendations.append(
            f"You have {reused_count} reused password(s). Use unique passwords for each account."
        )
    
    if not totp_enabled:
        recommendations.append(
            "Enable two-factor authentication (2FA) for enhanced account security."
        )
    
    if total < 5:
        recommendations.append(
            "Consider storing more of your passwords in the vault for better security management."
        )
    
    if not recommendations:
        recommendations.append(
            "Great job! Your password security is looking good. Keep it up!"
        )
    
    return recommendations


@dashboard_bp.route('/recent-activity', methods=['GET'])
@jwt_required()
def get_recent_activity():
    """
    Get recent vault activity.
    
    Returns:
        - 200: Recent activity list
    """
    user_id = get_jwt_identity()
    
    # Get recently updated entries
    recent_entries = VaultEntry.query.filter_by(user_id=user_id) \
        .order_by(VaultEntry.updated_at.desc()) \
        .limit(10) \
        .all()
    
    activity = []
    for entry in recent_entries:
        activity.append({
            'id': entry.id,
            'title': entry.title,
            'category': entry.category,
            'updated_at': entry.updated_at.isoformat() if entry.updated_at else None,
            'created_at': entry.created_at.isoformat() if entry.created_at else None
        })
    
    return jsonify({'activity': activity}), 200
