# Security Policy

## Security Measures Implemented

SecureVault implements multiple layers of security to protect user data:

### Encryption

#### Password Vault Encryption
- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Size**: 256 bits
- **Nonce Size**: 12 bytes (96 bits)
- **Authentication Tag**: Included in ciphertext

AES-256-GCM provides both confidentiality and authenticity. Each encryption operation uses a unique random nonce to ensure semantic security.

#### Key Derivation
- **Algorithm**: PBKDF2-HMAC-SHA256
- **Iterations**: 600,000 (exceeds OWASP minimum recommendation)
- **Salt Size**: 16 bytes (128 bits)

### Password Hashing

User account passwords are hashed using:
- **Algorithm**: bcrypt
- **Cost Factor**: 12 (4,096 iterations)
- **Salt**: Automatically generated per hash

### Authentication

#### JWT Tokens
- Access tokens expire after 1 hour
- Refresh tokens expire after 30 days
- Tokens can be revoked (blocklist)
- Tokens include user identity and claims

#### Two-Factor Authentication
- **Algorithm**: TOTP (RFC 6238)
- **Secret Size**: 160 bits (32 characters base32)
- **Time Step**: 30 seconds
- **Digits**: 6
- **Hash**: SHA-1 (standard for Google Authenticator compatibility)

### API Security

#### Rate Limiting
- Default: 200 requests per day, 50 per hour
- Auth endpoints: 10 login attempts per minute
- Registration: 5 attempts per minute

#### Input Validation
- Server-side validation on all inputs
- SQL injection prevention via SQLAlchemy ORM
- XSS prevention via proper escaping

#### Security Headers
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Content-Security-Policy: Configured`

#### CORS
- Configurable allowed origins
- Credentials support enabled

### Breach Checking

Password breach checking uses **k-anonymity**:
1. Password is hashed with SHA-1
2. Only the first 5 characters of the hash are sent to HIBP
3. Server returns all matching suffixes
4. Comparison is done locally

**Your actual password never leaves your device.**

---

## Known Limitations

1. **SQLite Database**: Default configuration uses SQLite which may not be suitable for high-traffic production deployments. Consider PostgreSQL for production.

2. **Single-Server Encryption Key**: The encryption key is shared across the application. For higher security, consider per-user encryption keys derived from their master password.

3. **Memory Security**: Sensitive data in memory is not explicitly cleared. Python's garbage collection handles memory, but sensitive values may persist briefly.

4. **Browser Security**: Data decrypted in the browser is visible in memory. Use the vault only on trusted devices.

---

## Responsible Disclosure

If you discover a security vulnerability, please report it responsibly:

1. **Email**: security@securevault.example.com (replace with actual email)
2. **Do not** disclose publicly until we've had a chance to address it
3. **Provide** detailed steps to reproduce the issue
4. **Allow** reasonable time for us to respond and fix

We appreciate security researchers who help keep SecureVault secure!

---

## Security Best Practices for Users

1. **Use a strong master password** - At least 16 characters with mixed case, numbers, and symbols
2. **Enable 2FA** - Adds an extra layer of protection
3. **Don't reuse passwords** - Use unique passwords for each account
4. **Use HTTPS** - Always access SecureVault over encrypted connections
5. **Keep software updated** - Use the latest version of SecureVault
6. **Log out** when done - Especially on shared devices
7. **Monitor for breaches** - Regularly check your emails in the breach checker

---

## Compliance

This application is designed with security best practices in mind, including:
- OWASP Top 10 mitigations
- NIST password guidelines
- Industry-standard encryption

However, this is a portfolio project and has not undergone formal security auditing. Use appropriate caution when storing sensitive information.

---

## Version

This security policy applies to SecureVault v1.0.0
