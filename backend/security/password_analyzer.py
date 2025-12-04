"""Password strength analysis module."""

import re
import math
import string
from typing import Optional


class PasswordAnalyzer:
    """
    Comprehensive password strength analyzer.
    
    Analyzes passwords for:
    - Entropy (bits of randomness)
    - Common patterns (keyboard walks, sequences, etc.)
    - Character diversity
    - Common password list matching
    - Time to crack estimates
    """
    
    # Keyboard patterns
    KEYBOARD_ROWS = [
        'qwertyuiop',
        'asdfghjkl',
        'zxcvbnm',
        '1234567890'
    ]
    
    KEYBOARD_PATTERNS = [
        'qwerty', 'qwertz', 'azerty', 'asdf', 'zxcv',
        '1234', '123456', '12345678', '123456789',
        'qazwsx', 'qweasd', 'password', 'pass',
        'admin', 'login', 'welcome', 'letmein'
    ]
    
    # Common passwords (top 100 most common)
    COMMON_PASSWORDS = {
        'password', '123456', '123456789', '12345678', '12345',
        '1234567', 'password1', '12345678', 'qwerty', 'abc123',
        'monkey', '1234567', '111111', 'password123', '123123',
        'dragon', 'sunshine', 'princess', 'iloveyou', 'trustno1',
        'letmein', 'ashley', 'passw0rd', 'master', 'welcome',
        'shadow', '123qwe', 'football', 'jesus', 'michael',
        'ninja', 'mustang', 'password12', 'badboy', 'baseball',
        'login', 'admin', 'qwerty123', 'solo', 'hockey',
        'charlie', 'donald', 'lovely', '696969', 'shadow',
        'jordan', '123abc', 'superman', 'harley', 'hello',
        '654321', '666666', '112233', '121212', 'qwertyuiop',
        'loveme', 'maggie', 'starwars', 'summer', 'killer',
        'pepper', 'anthony', 'joshua', 'jennifer', 'hunter',
        'george', 'maverick', 'matrix', 'amanda', 'corvette',
        'austin', 'robert', 'merlin', 'access', 'thunder',
        'cowboy', 'silver', 'richard', 'biteme', 'ginger',
        'tigger', 'chelsea', 'computer', 'william', 'diamond'
    }
    
    # Character set sizes for entropy calculation
    CHAR_SETS = {
        'lowercase': (string.ascii_lowercase, 26),
        'uppercase': (string.ascii_uppercase, 26),
        'digits': (string.digits, 10),
        'symbols': (string.punctuation, 32)
    }
    
    def __init__(self, password: str):
        """Initialize analyzer with password to analyze."""
        self.password = password
        self.length = len(password)
        self._analysis = None
    
    def analyze(self) -> dict:
        """
        Perform comprehensive password analysis.
        
        Returns:
            Dictionary containing analysis results
        """
        if self._analysis is not None:
            return self._analysis
        
        # Character analysis
        char_analysis = self._analyze_characters()
        
        # Pattern detection
        patterns = self._detect_patterns()
        
        # Entropy calculation
        entropy = self._calculate_entropy(char_analysis)
        
        # Time to crack estimates
        crack_times = self._estimate_crack_times(entropy)
        
        # Check if common password
        is_common = self._is_common_password()
        
        # Calculate overall score (0-100)
        score = self._calculate_score(entropy, patterns, is_common, char_analysis)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            char_analysis, patterns, is_common, score
        )
        
        self._analysis = {
            'score': score,
            'strength': self._score_to_strength(score),
            'length': self.length,
            'entropy': round(entropy, 2),
            'characters': char_analysis,
            'patterns': patterns,
            'is_common': is_common,
            'crack_times': crack_times,
            'recommendations': recommendations
        }
        
        return self._analysis
    
    def _analyze_characters(self) -> dict:
        """Analyze character composition of password."""
        has_lower = any(c in string.ascii_lowercase for c in self.password)
        has_upper = any(c in string.ascii_uppercase for c in self.password)
        has_digit = any(c in string.digits for c in self.password)
        has_symbol = any(c in string.punctuation for c in self.password)
        
        lower_count = sum(1 for c in self.password if c in string.ascii_lowercase)
        upper_count = sum(1 for c in self.password if c in string.ascii_uppercase)
        digit_count = sum(1 for c in self.password if c in string.digits)
        symbol_count = sum(1 for c in self.password if c in string.punctuation)
        
        unique_chars = len(set(self.password))
        
        return {
            'has_lowercase': has_lower,
            'has_uppercase': has_upper,
            'has_digits': has_digit,
            'has_symbols': has_symbol,
            'lowercase_count': lower_count,
            'uppercase_count': upper_count,
            'digit_count': digit_count,
            'symbol_count': symbol_count,
            'unique_characters': unique_chars,
            'character_diversity': unique_chars / self.length if self.length > 0 else 0
        }
    
    def _detect_patterns(self) -> dict:
        """Detect common patterns in password."""
        patterns = {
            'keyboard_patterns': [],
            'repeated_chars': [],
            'sequential_chars': [],
            'date_patterns': []
        }
        
        password_lower = self.password.lower()
        
        # Check keyboard patterns
        for pattern in self.KEYBOARD_PATTERNS:
            if pattern in password_lower:
                patterns['keyboard_patterns'].append(pattern)
        
        # Check repeated characters (3+ in a row)
        repeated = re.findall(r'(.)\1{2,}', self.password)
        if repeated:
            patterns['repeated_chars'] = repeated
        
        # Check sequential characters (abc, 123, etc.)
        for i in range(len(self.password) - 2):
            substr = self.password[i:i+3]
            if self._is_sequential(substr):
                if substr not in patterns['sequential_chars']:
                    patterns['sequential_chars'].append(substr)
        
        # Check date patterns
        date_patterns = [
            r'\d{4}',  # Year
            r'\d{2}/\d{2}',  # MM/DD or DD/MM
            r'\d{2}-\d{2}',  # MM-DD or DD-MM
            r'19\d{2}',  # 1900s year
            r'20\d{2}'   # 2000s year
        ]
        for pattern in date_patterns:
            if re.search(pattern, self.password):
                match = re.search(pattern, self.password)
                if match and match.group() not in patterns['date_patterns']:
                    patterns['date_patterns'].append(match.group())
        
        patterns['has_patterns'] = bool(
            patterns['keyboard_patterns'] or 
            patterns['repeated_chars'] or 
            patterns['sequential_chars'] or
            patterns['date_patterns']
        )
        
        return patterns
    
    def _is_sequential(self, s: str) -> bool:
        """Check if a 3-character string is sequential."""
        if len(s) != 3:
            return False
        
        # Check ascending
        if ord(s[1]) == ord(s[0]) + 1 and ord(s[2]) == ord(s[1]) + 1:
            return True
        
        # Check descending
        if ord(s[1]) == ord(s[0]) - 1 and ord(s[2]) == ord(s[1]) - 1:
            return True
        
        return False
    
    def _calculate_entropy(self, char_analysis: dict) -> float:
        """Calculate password entropy in bits."""
        if self.length == 0:
            return 0.0
        
        # Calculate character pool size
        pool_size = 0
        if char_analysis['has_lowercase']:
            pool_size += 26
        if char_analysis['has_uppercase']:
            pool_size += 26
        if char_analysis['has_digits']:
            pool_size += 10
        if char_analysis['has_symbols']:
            pool_size += 32
        
        if pool_size == 0:
            return 0.0
        
        # Entropy = length * log2(pool_size)
        entropy = self.length * math.log2(pool_size)
        
        return entropy
    
    def _estimate_crack_times(self, entropy: float) -> dict:
        """Estimate time to crack based on entropy."""
        if entropy == 0:
            return {
                'online_throttled': 'instant',
                'online_unthrottled': 'instant',
                'offline_slow': 'instant',
                'offline_fast': 'instant'
            }
        
        # Total combinations = 2^entropy
        combinations = 2 ** entropy
        
        # Attack speeds (guesses per second)
        speeds = {
            'online_throttled': 10,           # Rate-limited online attack
            'online_unthrottled': 10000,      # Fast online attack
            'offline_slow': 10000000,         # 10M/s - bcrypt/Argon2
            'offline_fast': 100000000000      # 100B/s - MD5 on GPUs
        }
        
        times = {}
        for attack_type, speed in speeds.items():
            seconds = combinations / (2 * speed)  # Average case = half
            times[attack_type] = self._format_time(seconds)
        
        return times
    
    def _format_time(self, seconds: float) -> str:
        """Format seconds into human-readable time."""
        if seconds < 1:
            return 'instant'
        elif seconds < 60:
            return f'{int(seconds)} seconds'
        elif seconds < 3600:
            return f'{int(seconds / 60)} minutes'
        elif seconds < 86400:
            return f'{int(seconds / 3600)} hours'
        elif seconds < 31536000:
            return f'{int(seconds / 86400)} days'
        elif seconds < 31536000 * 100:
            return f'{int(seconds / 31536000)} years'
        elif seconds < 31536000 * 1000000:
            return f'{int(seconds / (31536000 * 1000))}K years'
        elif seconds < 31536000 * 1000000000:
            return f'{int(seconds / (31536000 * 1000000))}M years'
        else:
            return 'centuries'
    
    def _is_common_password(self) -> bool:
        """Check if password is in common passwords list."""
        return self.password.lower() in self.COMMON_PASSWORDS
    
    def _calculate_score(
        self, 
        entropy: float, 
        patterns: dict, 
        is_common: bool,
        char_analysis: dict
    ) -> int:
        """Calculate overall score from 0-100."""
        # Base score from entropy (0-50 points)
        if entropy >= 100:
            entropy_score = 50
        else:
            entropy_score = int(entropy / 2)
        
        # Length bonus (0-15 points)
        if self.length >= 20:
            length_score = 15
        elif self.length >= 16:
            length_score = 12
        elif self.length >= 12:
            length_score = 8
        elif self.length >= 8:
            length_score = 4
        else:
            length_score = 0
        
        # Character diversity bonus (0-20 points)
        diversity_score = 0
        if char_analysis['has_lowercase']:
            diversity_score += 5
        if char_analysis['has_uppercase']:
            diversity_score += 5
        if char_analysis['has_digits']:
            diversity_score += 5
        if char_analysis['has_symbols']:
            diversity_score += 5
        
        # Unique character bonus (0-15 points)
        unique_ratio = char_analysis['character_diversity']
        if unique_ratio >= 0.8:
            unique_score = 15
        elif unique_ratio >= 0.6:
            unique_score = 10
        elif unique_ratio >= 0.4:
            unique_score = 5
        else:
            unique_score = 0
        
        total_score = entropy_score + length_score + diversity_score + unique_score
        
        # Penalties
        if is_common:
            total_score = max(0, total_score - 80)
        
        if patterns['has_patterns']:
            pattern_penalty = (
                len(patterns['keyboard_patterns']) * 10 +
                len(patterns['repeated_chars']) * 5 +
                len(patterns['sequential_chars']) * 5 +
                len(patterns['date_patterns']) * 5
            )
            total_score = max(0, total_score - pattern_penalty)
        
        if self.length < 8:
            total_score = max(0, total_score - 20)
        
        return min(100, max(0, total_score))
    
    def _score_to_strength(self, score: int) -> str:
        """Convert score to strength label."""
        if score >= 80:
            return 'very_strong'
        elif score >= 60:
            return 'strong'
        elif score >= 40:
            return 'moderate'
        elif score >= 20:
            return 'weak'
        else:
            return 'very_weak'
    
    def _generate_recommendations(
        self,
        char_analysis: dict,
        patterns: dict,
        is_common: bool,
        score: int
    ) -> list[str]:
        """Generate improvement recommendations."""
        recommendations = []
        
        if is_common:
            recommendations.append("This is a commonly used password. Choose something unique.")
        
        if self.length < 12:
            recommendations.append("Use at least 12 characters for better security.")
        elif self.length < 16:
            recommendations.append("Consider using 16+ characters for optimal security.")
        
        if not char_analysis['has_uppercase']:
            recommendations.append("Add uppercase letters (A-Z).")
        
        if not char_analysis['has_lowercase']:
            recommendations.append("Add lowercase letters (a-z).")
        
        if not char_analysis['has_digits']:
            recommendations.append("Include numbers (0-9).")
        
        if not char_analysis['has_symbols']:
            recommendations.append("Add special characters (!@#$%^&*).")
        
        if patterns['keyboard_patterns']:
            recommendations.append(
                f"Avoid keyboard patterns like '{patterns['keyboard_patterns'][0]}'."
            )
        
        if patterns['repeated_chars']:
            recommendations.append("Avoid repeated characters.")
        
        if patterns['sequential_chars']:
            recommendations.append("Avoid sequential characters (abc, 123).")
        
        if patterns['date_patterns']:
            recommendations.append("Avoid using dates in your password.")
        
        if char_analysis['character_diversity'] < 0.5:
            recommendations.append("Use more unique characters.")
        
        if score >= 80 and not recommendations:
            recommendations.append("Great password! Keep it safe.")
        
        return recommendations


def analyze_password(password: str) -> dict:
    """Convenience function to analyze a password."""
    analyzer = PasswordAnalyzer(password)
    return analyzer.analyze()
