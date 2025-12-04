"""Tests for encryption module."""

import pytest
from security.encryption import EncryptionManager


class TestEncryptionManager:
    """Test encryption functionality."""
    
    @pytest.fixture
    def encryption_manager(self):
        """Create encryption manager with random key."""
        key = EncryptionManager.generate_key()
        return EncryptionManager(key)
    
    def test_key_generation(self):
        """Test key generation."""
        key = EncryptionManager.generate_key()
        assert len(key) == 32
    
    def test_key_derivation(self):
        """Test key derivation from password."""
        key, salt = EncryptionManager.derive_key("test_password")
        
        assert len(key) == 32
        assert len(salt) == 16
        
        # Same password and salt should produce same key
        key2, _ = EncryptionManager.derive_key("test_password", salt)
        assert key == key2
        
        # Different password should produce different key
        key3, _ = EncryptionManager.derive_key("different_password", salt)
        assert key != key3
    
    def test_encrypt_decrypt(self, encryption_manager):
        """Test basic encryption and decryption."""
        plaintext = "This is a secret message!"
        
        encrypted = encryption_manager.encrypt(plaintext)
        assert encrypted != plaintext
        
        decrypted = encryption_manager.decrypt(encrypted)
        assert decrypted == plaintext
    
    def test_encrypt_decrypt_unicode(self, encryption_manager):
        """Test encryption with unicode characters."""
        plaintext = "Unicode: 你好世界 🔐 Ñoño"
        
        encrypted = encryption_manager.encrypt(plaintext)
        decrypted = encryption_manager.decrypt(encrypted)
        
        assert decrypted == plaintext
    
    def test_encrypt_decrypt_empty_string(self, encryption_manager):
        """Test encryption with empty string."""
        plaintext = ""
        
        encrypted = encryption_manager.encrypt(plaintext)
        decrypted = encryption_manager.decrypt(encrypted)
        
        assert decrypted == plaintext
    
    def test_encrypt_produces_different_ciphertexts(self, encryption_manager):
        """Test that same plaintext produces different ciphertexts (due to random nonce)."""
        plaintext = "Same message"
        
        encrypted1 = encryption_manager.encrypt(plaintext)
        encrypted2 = encryption_manager.encrypt(plaintext)
        
        # Should be different due to random nonce
        assert encrypted1 != encrypted2
        
        # But both should decrypt to same plaintext
        assert encryption_manager.decrypt(encrypted1) == plaintext
        assert encryption_manager.decrypt(encrypted2) == plaintext
    
    def test_decrypt_with_wrong_key_fails(self):
        """Test that decryption with wrong key fails."""
        key1 = EncryptionManager.generate_key()
        key2 = EncryptionManager.generate_key()
        
        manager1 = EncryptionManager(key1)
        manager2 = EncryptionManager(key2)
        
        plaintext = "Secret message"
        encrypted = manager1.encrypt(plaintext)
        
        with pytest.raises(Exception):
            manager2.decrypt(encrypted)
    
    def test_encrypt_dict(self, encryption_manager):
        """Test dictionary encryption."""
        data = {
            'username': 'testuser',
            'password': 'secret123',
            'notes': 'Some notes',
            'public_field': 'not encrypted'
        }
        
        encrypted = encryption_manager.encrypt_dict(
            data, 
            ['username', 'password', 'notes']
        )
        
        # Original should be unchanged
        assert data['username'] == 'testuser'
        
        # Encrypted fields should be different
        assert encrypted['username'] != data['username']
        assert encrypted['password'] != data['password']
        assert encrypted['notes'] != data['notes']
        
        # Non-encrypted field should be same
        assert encrypted['public_field'] == data['public_field']
    
    def test_decrypt_dict(self, encryption_manager):
        """Test dictionary decryption."""
        original = {
            'username': 'testuser',
            'password': 'secret123',
            'notes': 'Some notes'
        }
        
        encrypted = encryption_manager.encrypt_dict(
            original, 
            ['username', 'password', 'notes']
        )
        
        decrypted = encryption_manager.decrypt_dict(
            encrypted,
            ['username', 'password', 'notes']
        )
        
        assert decrypted['username'] == original['username']
        assert decrypted['password'] == original['password']
        assert decrypted['notes'] == original['notes']
    
    def test_encryption_without_key_fails(self):
        """Test that encryption without key fails."""
        manager = EncryptionManager()
        
        with pytest.raises(ValueError):
            manager.encrypt("test")
    
    def test_set_key(self):
        """Test setting key after initialization."""
        manager = EncryptionManager()
        key = EncryptionManager.generate_key()
        
        manager.set_key(key)
        
        plaintext = "Test message"
        encrypted = manager.encrypt(plaintext)
        decrypted = manager.decrypt(encrypted)
        
        assert decrypted == plaintext
    
    def test_set_invalid_key_fails(self):
        """Test that setting invalid key fails."""
        manager = EncryptionManager()
        
        with pytest.raises(ValueError):
            manager.set_key(b"short_key")
