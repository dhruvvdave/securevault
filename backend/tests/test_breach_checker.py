"""Tests for breach checker module."""

import pytest
from unittest.mock import patch, MagicMock
import requests

from security.breach_checker import BreachChecker, check_password_breach


class TestBreachChecker:
    """Test breach checking functionality."""
    
    def test_check_password_timeout_error(self):
        """Test timeout error handling."""
        checker = BreachChecker()
        
        with patch.object(checker.session, 'get') as mock_get:
            mock_get.side_effect = requests.exceptions.Timeout("Connection timed out")
            result = checker.check_password("testpassword")
        
        assert result['breached'] is None
        assert result['count'] is None
        assert result['error'] == 'Request timed out. Please try again.'
    
    def test_check_password_connection_error(self):
        """Test connection error handling."""
        checker = BreachChecker()
        
        with patch.object(checker.session, 'get') as mock_get:
            mock_get.side_effect = requests.exceptions.ConnectionError("Connection refused")
            result = checker.check_password("testpassword")
        
        assert result['breached'] is None
        assert result['count'] is None
        assert result['error'] == 'Could not connect to breach database. Please try again.'
    
    def test_check_password_request_exception(self):
        """Test general request exception handling."""
        checker = BreachChecker()
        
        with patch.object(checker.session, 'get') as mock_get:
            mock_get.side_effect = requests.exceptions.RequestException("Unknown error")
            result = checker.check_password("testpassword")
        
        assert result['breached'] is None
        assert result['count'] is None
        assert 'Unable to check password' in result['error']
    
    def test_check_password_breached(self):
        """Test successful breach check for breached password."""
        checker = BreachChecker()
        
        # Mock response with password hash suffix
        mock_response = MagicMock()
        mock_response.status_code = 200
        # SHA-1 of "password" is 5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8
        # prefix=5BAA6, suffix=1E4C9B93F3F0682250B6CF8331B7EE68FD8
        mock_response.text = "1E4C9B93F3F0682250B6CF8331B7EE68FD8:1000\nABCDEF123456:500"
        mock_response.raise_for_status = MagicMock()
        
        with patch.object(checker.session, 'get', return_value=mock_response):
            result = checker.check_password("password")
        
        assert result['breached'] is True
        assert result['count'] == 1000
        assert 'data breaches' in result['message']
    
    def test_check_password_not_breached(self):
        """Test successful breach check for safe password."""
        checker = BreachChecker()
        
        # Mock response without matching suffix
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.text = "ABCDEF123456:500\n123456ABCDEF:300"
        mock_response.raise_for_status = MagicMock()
        
        with patch.object(checker.session, 'get', return_value=mock_response):
            result = checker.check_password("uniqueRandomPassword123!@#")
        
        assert result['breached'] is False
        assert result['count'] == 0
        assert 'not been found' in result['message']
    
    def test_get_password_hash_info(self):
        """Test hash info generation."""
        checker = BreachChecker()
        result = checker.get_password_hash_info("password")
        
        assert 'sha1_hash' in result
        assert 'hash_prefix' in result
        assert 'hash_suffix' in result
        assert len(result['hash_prefix']) == 5
        assert result['sha1_hash'] == result['hash_prefix'] + result['hash_suffix']
    
    def test_check_email_without_api_key(self):
        """Test email check without API key returns error."""
        checker = BreachChecker()  # No API key
        result = checker.check_email("test@example.com")
        
        assert result['breached'] is None
        assert 'API key required' in result['error']
    
    def test_convenience_function(self):
        """Test the convenience function uses BreachChecker."""
        with patch.object(BreachChecker, 'check_password') as mock_check:
            mock_check.return_value = {'breached': False, 'count': 0}
            result = check_password_breach("test")
        
        mock_check.assert_called_once_with("test")
        assert result['breached'] is False
