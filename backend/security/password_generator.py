"""Secure password generator module."""

import os
import secrets
import string
from typing import Optional


class PasswordGenerator:
    """
    Cryptographically secure password generator.
    
    Features:
    - Uses secrets module for CSPRNG
    - Configurable length and character sets
    - Pronounceable password option
    - Passphrase generation
    """
    
    # Character sets
    LOWERCASE = string.ascii_lowercase
    UPPERCASE = string.ascii_uppercase
    DIGITS = string.digits
    SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?"
    
    # Syllables for pronounceable passwords
    SYLLABLES = [
        'ba', 'be', 'bi', 'bo', 'bu', 'ca', 'ce', 'ci', 'co', 'cu',
        'da', 'de', 'di', 'do', 'du', 'fa', 'fe', 'fi', 'fo', 'fu',
        'ga', 'ge', 'gi', 'go', 'gu', 'ha', 'he', 'hi', 'ho', 'hu',
        'ja', 'je', 'ji', 'jo', 'ju', 'ka', 'ke', 'ki', 'ko', 'ku',
        'la', 'le', 'li', 'lo', 'lu', 'ma', 'me', 'mi', 'mo', 'mu',
        'na', 'ne', 'ni', 'no', 'nu', 'pa', 'pe', 'pi', 'po', 'pu',
        'ra', 're', 'ri', 'ro', 'ru', 'sa', 'se', 'si', 'so', 'su',
        'ta', 'te', 'ti', 'to', 'tu', 'va', 've', 'vi', 'vo', 'vu',
        'wa', 'we', 'wi', 'wo', 'wu', 'za', 'ze', 'zi', 'zo', 'zu',
        'bla', 'ble', 'bli', 'blo', 'blu', 'cla', 'cle', 'cli', 'clo',
        'dra', 'dre', 'dri', 'dro', 'dru', 'fla', 'fle', 'fli', 'flo',
        'gra', 'gre', 'gri', 'gro', 'gru', 'pla', 'ple', 'pli', 'plo',
        'tra', 'tre', 'tri', 'tro', 'tru', 'sta', 'ste', 'sti', 'sto'
    ]
    
    # Common words for passphrases (100 diverse words)
    WORDS = [
        'apple', 'banana', 'cherry', 'dragon', 'eagle', 'forest', 'garden',
        'harbor', 'island', 'jungle', 'kitten', 'lemon', 'marble', 'nebula',
        'orange', 'planet', 'quartz', 'river', 'sunset', 'thunder', 'unique',
        'violet', 'whisper', 'xylophone', 'yellow', 'zebra', 'ancient', 'bridge',
        'crystal', 'diamond', 'emerald', 'falcon', 'glacier', 'horizon', 'impulse',
        'jasmine', 'kingdom', 'lantern', 'meadow', 'northern', 'orchid', 'pyramid',
        'quantum', 'rainbow', 'shadow', 'temple', 'umbrella', 'venture', 'winter',
        'anchor', 'breeze', 'compass', 'dolphin', 'eclipse', 'fountain', 'gravity',
        'harmony', 'infinity', 'journey', 'kaleidoscope', 'liberty', 'mountain',
        'nucleus', 'octagon', 'paradise', 'quicksand', 'reflect', 'spectrum',
        'twilight', 'universe', 'velocity', 'wanderer', 'xenon', 'yearning', 'zenith',
        'abstract', 'bamboo', 'cascade', 'destiny', 'evolution', 'frontier', 'guardian',
        'heritage', 'imagine', 'jubilee', 'kindred', 'legacy', 'momentum', 'navigate',
        'odyssey', 'pinnacle', 'quasar', 'radiant', 'sapphire', 'triumph', 'ultimate',
        'vibrant', 'wavelength', 'xanadu', 'youth', 'zephyr'
    ]
    
    def __init__(
        self,
        length: int = 16,
        use_lowercase: bool = True,
        use_uppercase: bool = True,
        use_digits: bool = True,
        use_symbols: bool = True,
        exclude_ambiguous: bool = False
    ):
        """
        Initialize password generator with options.
        
        Args:
            length: Password length (minimum 8)
            use_lowercase: Include lowercase letters
            use_uppercase: Include uppercase letters
            use_digits: Include digits
            use_symbols: Include special characters
            exclude_ambiguous: Exclude ambiguous characters (0, O, l, 1, etc.)
        """
        self.length = max(8, length)
        self.use_lowercase = use_lowercase
        self.use_uppercase = use_uppercase
        self.use_digits = use_digits
        self.use_symbols = use_symbols
        self.exclude_ambiguous = exclude_ambiguous
        
        self._build_charset()
    
    def _build_charset(self):
        """Build character set based on options."""
        charset = ""
        
        if self.use_lowercase:
            chars = self.LOWERCASE
            if self.exclude_ambiguous:
                chars = chars.replace('l', '').replace('o', '')
            charset += chars
        
        if self.use_uppercase:
            chars = self.UPPERCASE
            if self.exclude_ambiguous:
                chars = chars.replace('O', '').replace('I', '')
            charset += chars
        
        if self.use_digits:
            chars = self.DIGITS
            if self.exclude_ambiguous:
                chars = chars.replace('0', '').replace('1', '')
            charset += chars
        
        if self.use_symbols:
            charset += self.SYMBOLS
        
        if not charset:
            # Fallback to alphanumeric if nothing selected
            charset = self.LOWERCASE + self.UPPERCASE + self.DIGITS
        
        self.charset = charset
    
    def generate(self) -> str:
        """
        Generate a random password.
        
        Returns:
            Randomly generated password string
        """
        # Generate base password
        password = [secrets.choice(self.charset) for _ in range(self.length)]
        
        # Ensure at least one character from each selected category
        requirements = []
        if self.use_lowercase:
            chars = self.LOWERCASE
            if self.exclude_ambiguous:
                chars = chars.replace('l', '').replace('o', '')
            requirements.append(chars)
        
        if self.use_uppercase:
            chars = self.UPPERCASE
            if self.exclude_ambiguous:
                chars = chars.replace('O', '').replace('I', '')
            requirements.append(chars)
        
        if self.use_digits:
            chars = self.DIGITS
            if self.exclude_ambiguous:
                chars = chars.replace('0', '').replace('1', '')
            requirements.append(chars)
        
        if self.use_symbols:
            requirements.append(self.SYMBOLS)
        
        # Replace random positions with required characters
        if len(requirements) <= self.length:
            positions = secrets.SystemRandom().sample(range(self.length), len(requirements))
            for i, chars in enumerate(requirements):
                password[positions[i]] = secrets.choice(chars)
        
        # Shuffle to distribute required characters
        secrets.SystemRandom().shuffle(password)
        
        return ''.join(password)
    
    def generate_pronounceable(self, syllable_count: int = 4) -> str:
        """
        Generate a pronounceable password using syllables.
        
        Args:
            syllable_count: Number of syllables (default 4)
        
        Returns:
            Pronounceable password string
        """
        syllables = [secrets.choice(self.SYLLABLES) for _ in range(syllable_count)]
        
        # Add some capitalization
        if len(syllables) > 0:
            syllables[0] = syllables[0].capitalize()
        
        # Add numbers and symbol at the end
        password = ''.join(syllables)
        password += str(secrets.randbelow(100))
        password += secrets.choice(self.SYMBOLS)
        
        return password
    
    def generate_passphrase(
        self,
        word_count: int = 4,
        separator: str = '-',
        capitalize: bool = True,
        include_number: bool = True
    ) -> str:
        """
        Generate a passphrase from random words.
        
        Args:
            word_count: Number of words (default 4)
            separator: Word separator (default '-')
            capitalize: Capitalize each word
            include_number: Add a random number
        
        Returns:
            Generated passphrase
        """
        words = [secrets.choice(self.WORDS) for _ in range(word_count)]
        
        if capitalize:
            words = [word.capitalize() for word in words]
        
        passphrase = separator.join(words)
        
        if include_number:
            passphrase += separator + str(secrets.randbelow(1000))
        
        return passphrase
    
    @classmethod
    def quick_generate(
        cls,
        length: int = 16,
        use_symbols: bool = True
    ) -> str:
        """
        Quick static method to generate a password.
        
        Args:
            length: Password length
            use_symbols: Include special characters
        
        Returns:
            Generated password
        """
        generator = cls(length=length, use_symbols=use_symbols)
        return generator.generate()
    
    @classmethod
    def quick_passphrase(cls, word_count: int = 4) -> str:
        """
        Quick static method to generate a passphrase.
        
        Args:
            word_count: Number of words
        
        Returns:
            Generated passphrase
        """
        generator = cls()
        return generator.generate_passphrase(word_count=word_count)


def generate_password(
    length: int = 16,
    use_lowercase: bool = True,
    use_uppercase: bool = True,
    use_digits: bool = True,
    use_symbols: bool = True
) -> str:
    """Convenience function to generate a password."""
    generator = PasswordGenerator(
        length=length,
        use_lowercase=use_lowercase,
        use_uppercase=use_uppercase,
        use_digits=use_digits,
        use_symbols=use_symbols
    )
    return generator.generate()


def generate_passphrase(word_count: int = 4, separator: str = '-') -> str:
    """Convenience function to generate a passphrase."""
    generator = PasswordGenerator()
    return generator.generate_passphrase(word_count=word_count, separator=separator)
