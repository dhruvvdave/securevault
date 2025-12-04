"""AES-256-GCM encryption for vault data."""

import os
import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.backends import default_backend


class EncryptionManager:
    """
    AES-256-GCM encryption manager for secure data storage.
    
    Uses:
    - AES-256-GCM for authenticated encryption
    - PBKDF2 for key derivation from master password
    - Random nonce for each encryption operation
    """
    
    SALT_SIZE = 16
    NONCE_SIZE = 12
    KEY_SIZE = 32  # 256 bits
    ITERATIONS = 600000  # OWASP recommended minimum
    
    def __init__(self, master_key: bytes = None):
        """
        Initialize encryption manager.
        
        Args:
            master_key: Optional pre-derived key. If not provided,
                       use derive_key() to generate one.
        """
        self._key = master_key
    
    @classmethod
    def derive_key(cls, password: str, salt: bytes = None) -> tuple[bytes, bytes]:
        """
        Derive encryption key from password using PBKDF2.
        
        Args:
            password: User's master password
            salt: Optional salt bytes. If not provided, generates random salt.
        
        Returns:
            Tuple of (derived_key, salt)
        """
        if salt is None:
            salt = os.urandom(cls.SALT_SIZE)
        
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=cls.KEY_SIZE,
            salt=salt,
            iterations=cls.ITERATIONS,
            backend=default_backend()
        )
        
        key = kdf.derive(password.encode('utf-8'))
        return key, salt
    
    @classmethod
    def generate_key(cls) -> bytes:
        """Generate a random encryption key."""
        return os.urandom(cls.KEY_SIZE)
    
    def set_key(self, key: bytes):
        """Set the encryption key."""
        if len(key) != self.KEY_SIZE:
            raise ValueError(f"Key must be {self.KEY_SIZE} bytes")
        self._key = key
    
    def encrypt(self, plaintext: str) -> str:
        """
        Encrypt plaintext using AES-256-GCM.
        
        Args:
            plaintext: String to encrypt
        
        Returns:
            Base64-encoded string containing nonce + ciphertext + tag
        """
        if not self._key:
            raise ValueError("Encryption key not set")
        
        # Generate random nonce
        nonce = os.urandom(self.NONCE_SIZE)
        
        # Create cipher and encrypt
        aesgcm = AESGCM(self._key)
        ciphertext = aesgcm.encrypt(nonce, plaintext.encode('utf-8'), None)
        
        # Combine nonce + ciphertext (tag is appended by GCM)
        encrypted = nonce + ciphertext
        
        # Return base64 encoded
        return base64.b64encode(encrypted).decode('utf-8')
    
    def decrypt(self, ciphertext: str) -> str:
        """
        Decrypt ciphertext using AES-256-GCM.
        
        Args:
            ciphertext: Base64-encoded encrypted data
        
        Returns:
            Decrypted plaintext string
        """
        if not self._key:
            raise ValueError("Encryption key not set")
        
        # Decode from base64
        encrypted = base64.b64decode(ciphertext.encode('utf-8'))
        
        # Extract nonce and ciphertext
        nonce = encrypted[:self.NONCE_SIZE]
        ct = encrypted[self.NONCE_SIZE:]
        
        # Decrypt
        aesgcm = AESGCM(self._key)
        plaintext = aesgcm.decrypt(nonce, ct, None)
        
        return plaintext.decode('utf-8')
    
    def encrypt_dict(self, data: dict, fields: list[str]) -> dict:
        """
        Encrypt specific fields in a dictionary.
        
        Args:
            data: Dictionary containing data
            fields: List of field names to encrypt
        
        Returns:
            New dictionary with specified fields encrypted
        """
        result = data.copy()
        for field in fields:
            if field in result and result[field] is not None:
                result[field] = self.encrypt(str(result[field]))
        return result
    
    def decrypt_dict(self, data: dict, fields: list[str]) -> dict:
        """
        Decrypt specific fields in a dictionary.
        
        Args:
            data: Dictionary containing encrypted data
            fields: List of field names to decrypt
        
        Returns:
            New dictionary with specified fields decrypted
        """
        result = data.copy()
        for field in fields:
            if field in result and result[field] is not None:
                try:
                    result[field] = self.decrypt(str(result[field]))
                except Exception:
                    # If decryption fails, leave as-is
                    pass
        return result
