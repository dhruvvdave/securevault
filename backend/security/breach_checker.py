"""HaveIBeenPwned API integration for breach checking."""

import hashlib
import requests
from typing import Optional


class BreachChecker:
    """
    Check emails and passwords against HaveIBeenPwned database.
    
    Uses k-anonymity for password checks - only sends first 5 chars of SHA-1 hash.
    """
    
    HIBP_PASSWORD_API = "https://api.pwnedpasswords.com/range/"
    HIBP_BREACH_API = "https://haveibeenpwned.com/api/v3/breachedaccount/"
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize breach checker.
        
        Args:
            api_key: Optional HIBP API key for breach account checking
        """
        self.api_key = api_key
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'SecureVault-PasswordManager'
        })
        if api_key:
            self.session.headers.update({
                'hibp-api-key': api_key
            })
    
    def check_password(self, password: str) -> dict:
        """
        Check if password has been exposed in data breaches.
        
        Uses k-anonymity - only sends first 5 characters of SHA-1 hash.
        
        Args:
            password: Password to check
        
        Returns:
            Dictionary with breach info:
            - breached: bool
            - count: number of times seen in breaches
        """
        # Create SHA-1 hash
        sha1_hash = hashlib.sha1(password.encode('utf-8')).hexdigest().upper()
        
        # K-anonymity: send only first 5 characters
        prefix = sha1_hash[:5]
        suffix = sha1_hash[5:]
        
        try:
            response = self.session.get(
                f"{self.HIBP_PASSWORD_API}{prefix}",
                timeout=10
            )
            response.raise_for_status()
            
            # Check if our suffix is in the response
            hashes = response.text.splitlines()
            for line in hashes:
                parts = line.split(':')
                if len(parts) == 2:
                    hash_suffix, count = parts
                    if hash_suffix == suffix:
                        return {
                            'breached': True,
                            'count': int(count),
                            'message': f'This password has been seen {count:,} times in data breaches!'
                        }
            
            return {
                'breached': False,
                'count': 0,
                'message': 'This password has not been found in known data breaches.'
            }
            
        except requests.exceptions.RequestException as e:
            return {
                'breached': None,
                'count': None,
                'error': f'Unable to check password: {str(e)}'
            }
    
    def check_email(self, email: str) -> dict:
        """
        Check if email has been involved in data breaches.
        
        Note: Requires HIBP API key for v3 API.
        
        Args:
            email: Email address to check
        
        Returns:
            Dictionary with breach info:
            - breached: bool
            - breaches: list of breach names
            - count: total breach count
        """
        if not self.api_key:
            return {
                'breached': None,
                'breaches': [],
                'count': 0,
                'error': 'API key required for email breach checking'
            }
        
        try:
            response = self.session.get(
                f"{self.HIBP_BREACH_API}{email}",
                params={'truncateResponse': 'false'},
                timeout=10
            )
            
            if response.status_code == 404:
                return {
                    'breached': False,
                    'breaches': [],
                    'count': 0,
                    'message': 'This email has not been found in known data breaches.'
                }
            
            response.raise_for_status()
            breaches = response.json()
            
            breach_details = []
            for breach in breaches:
                breach_details.append({
                    'name': breach.get('Name', 'Unknown'),
                    'title': breach.get('Title', 'Unknown'),
                    'domain': breach.get('Domain', ''),
                    'breach_date': breach.get('BreachDate', ''),
                    'added_date': breach.get('AddedDate', ''),
                    'pwn_count': breach.get('PwnCount', 0),
                    'description': breach.get('Description', ''),
                    'data_classes': breach.get('DataClasses', []),
                    'is_verified': breach.get('IsVerified', False),
                    'is_sensitive': breach.get('IsSensitive', False)
                })
            
            return {
                'breached': True,
                'breaches': breach_details,
                'count': len(breaches),
                'message': f'This email was found in {len(breaches)} data breach(es).'
            }
            
        except requests.exceptions.RequestException as e:
            return {
                'breached': None,
                'breaches': [],
                'count': 0,
                'error': f'Unable to check email: {str(e)}'
            }
    
    def get_password_hash_info(self, password: str) -> dict:
        """
        Get hash information for a password (for educational display).
        
        Args:
            password: Password to hash
        
        Returns:
            Dictionary with hash info
        """
        sha1_hash = hashlib.sha1(password.encode('utf-8')).hexdigest().upper()
        
        return {
            'sha1_hash': sha1_hash,
            'hash_prefix': sha1_hash[:5],
            'hash_suffix': sha1_hash[5:],
            'note': 'Only the first 5 characters of the hash are sent to HIBP (k-anonymity)'
        }


def check_password_breach(password: str) -> dict:
    """Convenience function to check password breach."""
    checker = BreachChecker()
    return checker.check_password(password)


def check_email_breach(email: str, api_key: str) -> dict:
    """Convenience function to check email breach."""
    checker = BreachChecker(api_key=api_key)
    return checker.check_email(email)
