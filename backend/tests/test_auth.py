"""Tests for authentication module."""

import pytest
from flask import Flask
from app import create_app
from models import db, User


@pytest.fixture
def app():
    """Create application for testing."""
    app = create_app('testing')
    
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture
def client(app):
    """Create test client."""
    return app.test_client()


@pytest.fixture
def auth_headers(client):
    """Get authentication headers."""
    # Register a user
    client.post('/api/auth/register', json={
        'email': 'test@example.com',
        'password': 'TestPass123!'
    })
    
    # Login
    response = client.post('/api/auth/login', json={
        'email': 'test@example.com',
        'password': 'TestPass123!'
    })
    
    data = response.get_json()
    return {'Authorization': f"Bearer {data['access_token']}"}


class TestRegistration:
    """Test user registration."""
    
    def test_register_success(self, client):
        """Test successful registration."""
        response = client.post('/api/auth/register', json={
            'email': 'new@example.com',
            'password': 'SecurePass1!'
        })
        
        assert response.status_code == 201
        data = response.get_json()
        assert 'access_token' in data
        assert 'refresh_token' in data
        assert data['user']['email'] == 'new@example.com'
    
    def test_register_invalid_email(self, client):
        """Test registration with invalid email."""
        response = client.post('/api/auth/register', json={
            'email': 'invalid-email',
            'password': 'SecurePass1!'
        })
        
        assert response.status_code == 400
        assert 'error' in response.get_json()
    
    def test_register_weak_password(self, client):
        """Test registration with weak password."""
        response = client.post('/api/auth/register', json={
            'email': 'test@example.com',
            'password': 'weak'
        })
        
        assert response.status_code == 400
        assert 'error' in response.get_json()
    
    def test_register_duplicate_email(self, client):
        """Test registration with duplicate email."""
        # First registration
        client.post('/api/auth/register', json={
            'email': 'duplicate@example.com',
            'password': 'SecurePass1!'
        })
        
        # Second registration with same email
        response = client.post('/api/auth/register', json={
            'email': 'duplicate@example.com',
            'password': 'SecurePass1!'
        })
        
        assert response.status_code == 409


class TestLogin:
    """Test user login."""
    
    def test_login_success(self, client):
        """Test successful login."""
        # Register first
        client.post('/api/auth/register', json={
            'email': 'login@example.com',
            'password': 'SecurePass1!'
        })
        
        # Login
        response = client.post('/api/auth/login', json={
            'email': 'login@example.com',
            'password': 'SecurePass1!'
        })
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'access_token' in data
        assert 'refresh_token' in data
    
    def test_login_invalid_credentials(self, client):
        """Test login with invalid credentials."""
        response = client.post('/api/auth/login', json={
            'email': 'nonexistent@example.com',
            'password': 'WrongPass1!'
        })
        
        assert response.status_code == 401
    
    def test_login_wrong_password(self, client):
        """Test login with wrong password."""
        # Register first
        client.post('/api/auth/register', json={
            'email': 'wrongpass@example.com',
            'password': 'CorrectPass1!'
        })
        
        # Login with wrong password
        response = client.post('/api/auth/login', json={
            'email': 'wrongpass@example.com',
            'password': 'WrongPass1!'
        })
        
        assert response.status_code == 401


class TestLogout:
    """Test user logout."""
    
    def test_logout_success(self, client, auth_headers):
        """Test successful logout."""
        response = client.post('/api/auth/logout', headers=auth_headers)
        
        assert response.status_code == 200
        assert response.get_json()['message'] == 'Logout successful'
    
    def test_logout_without_auth(self, client):
        """Test logout without authentication."""
        response = client.post('/api/auth/logout')
        
        assert response.status_code == 401


class TestTokenRefresh:
    """Test token refresh."""
    
    def test_refresh_token(self, client):
        """Test token refresh."""
        # Register and get tokens
        response = client.post('/api/auth/register', json={
            'email': 'refresh@example.com',
            'password': 'SecurePass1!'
        })
        
        data = response.get_json()
        refresh_token = data['refresh_token']
        
        # Refresh token
        response = client.post('/api/auth/refresh', 
                              headers={'Authorization': f'Bearer {refresh_token}'})
        
        assert response.status_code == 200
        assert 'access_token' in response.get_json()


class TestCurrentUser:
    """Test current user endpoint."""
    
    def test_get_current_user(self, client, auth_headers):
        """Test getting current user."""
        response = client.get('/api/auth/me', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['user']['email'] == 'test@example.com'
    
    def test_get_current_user_unauthorized(self, client):
        """Test getting current user without auth."""
        response = client.get('/api/auth/me')
        
        assert response.status_code == 401


class TestPasswordChange:
    """Test password change."""
    
    def test_change_password_success(self, client, auth_headers):
        """Test successful password change."""
        response = client.post('/api/auth/change-password',
                              headers=auth_headers,
                              json={
                                  'current_password': 'TestPass123!',
                                  'new_password': 'NewSecure1!'
                              })
        
        assert response.status_code == 200
        
        # Login with new password
        response = client.post('/api/auth/login', json={
            'email': 'test@example.com',
            'password': 'NewSecure1!'
        })
        
        assert response.status_code == 200
    
    def test_change_password_wrong_current(self, client, auth_headers):
        """Test password change with wrong current password."""
        response = client.post('/api/auth/change-password',
                              headers=auth_headers,
                              json={
                                  'current_password': 'WrongPass1!',
                                  'new_password': 'NewSecure1!'
                              })
        
        assert response.status_code == 400
