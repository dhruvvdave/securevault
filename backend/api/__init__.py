"""API module for SecureVault."""

from .passwords import passwords_bp
from .dashboard import dashboard_bp

__all__ = ['passwords_bp', 'dashboard_bp']
