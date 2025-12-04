"""Database models for SecureVault."""

from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(db.Model):
    """User model for authentication and vault ownership."""
    
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    
    # 2FA settings
    totp_secret = db.Column(db.String(32), nullable=True)
    totp_enabled = db.Column(db.Boolean, default=False)
    
    # Account metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    vault_entries = db.relationship('VaultEntry', backref='owner', lazy='dynamic', 
                                   cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<User {self.email}>'
    
    def to_dict(self):
        """Convert user to dictionary for API responses."""
        return {
            'id': self.id,
            'email': self.email,
            'totp_enabled': self.totp_enabled,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }


class VaultEntry(db.Model):
    """Encrypted password vault entry."""
    
    __tablename__ = 'vault_entries'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    
    # Entry details (encrypted)
    title = db.Column(db.String(255), nullable=False)
    username = db.Column(db.Text, nullable=True)  # Encrypted
    password = db.Column(db.Text, nullable=False)  # Encrypted
    url = db.Column(db.Text, nullable=True)
    notes = db.Column(db.Text, nullable=True)  # Encrypted
    
    # Metadata
    category = db.Column(db.String(50), default='general')
    favorite = db.Column(db.Boolean, default=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<VaultEntry {self.title}>'
    
    def to_dict(self):
        """Convert entry to dictionary for API responses."""
        return {
            'id': self.id,
            'title': self.title,
            'username': self.username,
            'password': self.password,
            'url': self.url,
            'notes': self.notes,
            'category': self.category,
            'favorite': self.favorite,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class RevokedToken(db.Model):
    """Store revoked JWT tokens for logout functionality."""
    
    __tablename__ = 'revoked_tokens'
    
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(36), nullable=False, unique=True, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    @classmethod
    def is_token_revoked(cls, jti):
        """Check if a token JTI has been revoked."""
        return cls.query.filter_by(jti=jti).first() is not None
