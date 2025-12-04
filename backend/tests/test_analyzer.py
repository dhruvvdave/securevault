"""Tests for password analyzer module."""

import pytest
from security.password_analyzer import PasswordAnalyzer, analyze_password


class TestPasswordAnalyzer:
    """Test password analysis functionality."""
    
    def test_analyze_empty_password(self):
        """Test analysis of empty password."""
        result = analyze_password("")
        
        assert result['score'] == 0
        assert result['strength'] == 'very_weak'
        assert result['length'] == 0
        assert result['entropy'] == 0
    
    def test_analyze_weak_password(self):
        """Test analysis of weak password."""
        result = analyze_password("password")
        
        assert result['score'] < 30
        assert result['strength'] in ['very_weak', 'weak']
        assert result['is_common'] == True
    
    def test_analyze_common_password(self):
        """Test detection of common passwords."""
        common_passwords = ['password', '123456', 'qwerty', 'admin']
        
        for password in common_passwords:
            result = analyze_password(password)
            assert result['is_common'] == True
    
    def test_analyze_strong_password(self):
        """Test analysis of strong password."""
        result = analyze_password("MyS3cur3P@ssw0rd!2024")
        
        assert result['score'] >= 70
        assert result['strength'] in ['strong', 'very_strong']
        assert result['characters']['has_lowercase'] == True
        assert result['characters']['has_uppercase'] == True
        assert result['characters']['has_digits'] == True
        assert result['characters']['has_symbols'] == True
    
    def test_character_analysis(self):
        """Test character composition analysis."""
        result = analyze_password("Aa1!")
        
        assert result['characters']['has_lowercase'] == True
        assert result['characters']['has_uppercase'] == True
        assert result['characters']['has_digits'] == True
        assert result['characters']['has_symbols'] == True
        assert result['characters']['lowercase_count'] == 1
        assert result['characters']['uppercase_count'] == 1
        assert result['characters']['digit_count'] == 1
        assert result['characters']['symbol_count'] == 1
    
    def test_keyboard_pattern_detection(self):
        """Test keyboard pattern detection."""
        result = analyze_password("qwertypass")
        
        assert result['patterns']['has_patterns'] == True
        assert 'qwerty' in result['patterns']['keyboard_patterns']
    
    def test_repeated_chars_detection(self):
        """Test repeated character detection."""
        result = analyze_password("passsword")
        
        assert result['patterns']['has_patterns'] == True
        assert len(result['patterns']['repeated_chars']) > 0
    
    def test_sequential_chars_detection(self):
        """Test sequential character detection."""
        result = analyze_password("abc123xyz")
        
        assert result['patterns']['has_patterns'] == True
        assert len(result['patterns']['sequential_chars']) > 0
    
    def test_date_pattern_detection(self):
        """Test date pattern detection."""
        result = analyze_password("pass1999word")
        
        assert '1999' in result['patterns']['date_patterns']
    
    def test_entropy_calculation(self):
        """Test entropy calculation."""
        # Simple lowercase password
        result = analyze_password("abcdefgh")
        # 8 chars * log2(26) ≈ 37.6 bits
        assert 35 < result['entropy'] < 40
        
        # Mixed password
        result = analyze_password("Abc123!@")
        # 8 chars * log2(94) ≈ 52.4 bits
        assert 50 < result['entropy'] < 55
    
    def test_crack_time_estimates(self):
        """Test crack time estimates are present."""
        result = analyze_password("TestPassword123!")
        
        assert 'crack_times' in result
        assert 'online_throttled' in result['crack_times']
        assert 'online_unthrottled' in result['crack_times']
        assert 'offline_slow' in result['crack_times']
        assert 'offline_fast' in result['crack_times']
    
    def test_recommendations_for_weak_password(self):
        """Test recommendations for weak passwords."""
        result = analyze_password("password")
        
        assert len(result['recommendations']) > 0
        # Should recommend not using common password
        has_common_warning = any('common' in r.lower() for r in result['recommendations'])
        assert has_common_warning
    
    def test_recommendations_for_short_password(self):
        """Test recommendations for short passwords."""
        result = analyze_password("Ab1!")
        
        has_length_warning = any('character' in r.lower() or 'length' in r.lower() 
                                 for r in result['recommendations'])
        assert has_length_warning
    
    def test_recommendations_for_missing_chars(self):
        """Test recommendations for missing character types."""
        # Lowercase only
        result = analyze_password("abcdefghijklmnop")
        
        has_uppercase_suggestion = any('uppercase' in r.lower() for r in result['recommendations'])
        has_digit_suggestion = any('number' in r.lower() for r in result['recommendations'])
        has_symbol_suggestion = any('special' in r.lower() or 'character' in r.lower() 
                                    for r in result['recommendations'])
        
        assert has_uppercase_suggestion
        assert has_digit_suggestion
    
    def test_strength_labels(self):
        """Test strength label assignment."""
        # Very weak
        result = analyze_password("a")
        assert result['strength'] == 'very_weak'
        
        # Strong
        result = analyze_password("MySecurePassword123!@#")
        assert result['strength'] in ['strong', 'very_strong']
    
    def test_unique_character_count(self):
        """Test unique character counting."""
        result = analyze_password("aaaaabbbbb")
        
        assert result['characters']['unique_characters'] == 2
        assert result['characters']['character_diversity'] < 0.5
    
    def test_password_analyzer_class_caching(self):
        """Test that analysis is cached."""
        analyzer = PasswordAnalyzer("test123")
        
        result1 = analyzer.analyze()
        result2 = analyzer.analyze()
        
        assert result1 is result2  # Same object (cached)
    
    def test_very_strong_password(self):
        """Test very strong password analysis."""
        password = "K@9mNv#Xr2$pL7qW!sYz"
        result = analyze_password(password)
        
        assert result['score'] >= 80
        assert result['strength'] == 'very_strong'
        assert result['is_common'] == False
        assert result['patterns']['has_patterns'] == False
