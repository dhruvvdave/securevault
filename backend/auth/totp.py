"""TOTP 2FA implementation for SecureVault."""

import pyotp
import qrcode
import io
import base64
from typing import Optional, Tuple


class TOTPManager:
    """
    TOTP (Time-based One-Time Password) manager for 2FA.
    
    Features:
    - Secret generation
    - QR code generation for authenticator apps
    - TOTP verification
    """
    
    ISSUER = "SecureVault"
    DIGEST = "sha1"  # Standard for Google Authenticator
    DIGITS = 6
    INTERVAL = 30
    
    def __init__(self, secret: Optional[str] = None):
        """
        Initialize TOTP manager.
        
        Args:
            secret: Optional existing TOTP secret
        """
        self.secret = secret
        self._totp = None
        
        if secret:
            self._totp = pyotp.TOTP(secret)
    
    @classmethod
    def generate_secret(cls) -> str:
        """
        Generate a new TOTP secret.
        
        Returns:
            Base32 encoded secret string
        """
        return pyotp.random_base32()
    
    def get_provisioning_uri(self, email: str) -> str:
        """
        Generate provisioning URI for authenticator apps.
        
        Args:
            email: User's email address
        
        Returns:
            otpauth:// URI string
        """
        if not self._totp:
            raise ValueError("TOTP secret not set")
        
        return self._totp.provisioning_uri(
            name=email,
            issuer_name=self.ISSUER
        )
    
    def generate_qr_code(self, email: str) -> str:
        """
        Generate QR code for authenticator app setup.
        
        Args:
            email: User's email address
        
        Returns:
            Base64 encoded PNG image
        """
        uri = self.get_provisioning_uri(email)
        
        # Create QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4
        )
        qr.add_data(uri)
        qr.make(fit=True)
        
        # Generate image
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        
        return base64.b64encode(buffer.getvalue()).decode('utf-8')
    
    def verify(self, code: str, valid_window: int = 1) -> bool:
        """
        Verify a TOTP code.
        
        Args:
            code: 6-digit TOTP code
            valid_window: Number of 30-second windows to accept (default 1)
        
        Returns:
            True if code is valid
        """
        if not self._totp:
            raise ValueError("TOTP secret not set")
        
        # Remove any spaces from code
        code = code.replace(" ", "").replace("-", "")
        
        return self._totp.verify(code, valid_window=valid_window)
    
    def get_current_code(self) -> str:
        """
        Get current TOTP code (for testing).
        
        Returns:
            Current 6-digit code
        """
        if not self._totp:
            raise ValueError("TOTP secret not set")
        
        return self._totp.now()
    
    @classmethod
    def setup_2fa(cls, email: str) -> Tuple[str, str, str]:
        """
        Complete 2FA setup helper.
        
        Args:
            email: User's email address
        
        Returns:
            Tuple of (secret, provisioning_uri, qr_code_base64)
        """
        secret = cls.generate_secret()
        manager = cls(secret)
        
        uri = manager.get_provisioning_uri(email)
        qr_code = manager.generate_qr_code(email)
        
        return secret, uri, qr_code
    
    @classmethod
    def verify_code(cls, secret: str, code: str) -> bool:
        """
        Static method to verify a code against a secret.
        
        Args:
            secret: TOTP secret
            code: Code to verify
        
        Returns:
            True if valid
        """
        manager = cls(secret)
        return manager.verify(code)
