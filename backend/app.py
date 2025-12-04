"""
SecureVault - Main Flask Application

A secure password manager and analyzer with breach checking and 2FA support.
"""

import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_talisman import Talisman

from config import config
from models import db
from auth import auth_bp
from auth.jwt_handler import JWTHandler
from api import passwords_bp, dashboard_bp


def create_app(config_name: str = None) -> Flask:
    """
    Application factory for SecureVault.
    
    Args:
        config_name: Configuration to use ('development', 'production', 'testing')
    
    Returns:
        Flask application instance
    """
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')
    
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    
    # Initialize JWT
    jwt_handler = JWTHandler(app)
    
    # Initialize CORS
    CORS(app, 
         origins=app.config['CORS_ORIGINS'],
         supports_credentials=True,
         expose_headers=['Content-Type', 'Authorization'])
    
    # Initialize rate limiter
    limiter = Limiter(
        key_func=get_remote_address,
        app=app,
        default_limits=["200 per day", "50 per hour"],
        storage_uri=app.config.get('RATELIMIT_STORAGE_URL', 'memory://')
    )
    
    # Initialize security headers (Talisman)
    if not app.config.get('TESTING'):
        Talisman(app,
                 force_https=False,  # Set to True in production with HTTPS
                 strict_transport_security=False,
                 content_security_policy={
                     'default-src': "'self'",
                     'img-src': "'self' data:",
                     'script-src': "'self' 'unsafe-inline'",
                     'style-src': "'self' 'unsafe-inline'",
                 })
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(passwords_bp)
    app.register_blueprint(dashboard_bp)
    
    # Create database tables
    with app.app_context():
        db.create_all()
    
    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        """Health check endpoint."""
        return jsonify({
            'status': 'healthy',
            'service': 'SecureVault API',
            'version': '1.0.0'
        }), 200
    
    # Error handlers
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({'error': 'Bad request', 'message': str(error)}), 400
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not found', 'message': str(error)}), 404
    
    @app.errorhandler(429)
    def rate_limit_exceeded(error):
        return jsonify({
            'error': 'Rate limit exceeded',
            'message': 'Too many requests. Please try again later.'
        }), 429
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            'error': 'Internal server error',
            'message': 'An unexpected error occurred'
        }), 500
    
    return app


# Create application instance
app = create_app()


if __name__ == '__main__':
    # Debug mode should only be enabled in development
    # In production, use gunicorn or similar WSGI server
    import os
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=5000, debug=debug_mode)
