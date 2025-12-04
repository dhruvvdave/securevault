# 🔐 SecureVault

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-green.svg)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> A full-stack cybersecurity password security analyzer & encrypted password manager with breach checking, 2FA, and beautiful dark UI.

![SecureVault Banner](https://via.placeholder.com/1200x400/0a0a1a/00ffff?text=SecureVault+-+Secure+Your+Digital+Life)

---

## ✨ Features

### 🔍 Password Analyzer
- Calculate password entropy (bits of randomness)
- Detect common patterns (keyboard walks, sequences, dates)
- Check against common password lists
- Real-time strength scoring (0-100)
- Detailed improvement recommendations

### 🎲 Password Generator
- Cryptographically secure random generation
- Configurable length and character sets
- Passphrase generation with random words
- One-click copy to clipboard

### 🛡️ Breach Checker
- Integration with HaveIBeenPwned API
- K-anonymity for secure password checking
- Email breach detection
- Detailed breach information

### 🔒 Encrypted Vault
- AES-256-GCM encryption
- Secure key derivation with PBKDF2
- Category organization
- Search and filter functionality

### 🔐 Two-Factor Authentication
- TOTP-based 2FA
- QR code generation for authenticator apps
- Secure account protection

### 📊 Security Dashboard
- Overall security score
- Password health overview
- Personalized recommendations
- Activity tracking

---

## 🛠️ Tech Stack

### Backend
- **Python 3.11+** - Core language
- **Flask** - Web framework
- **SQLAlchemy** - ORM
- **Flask-JWT-Extended** - JWT authentication
- **bcrypt** - Password hashing
- **cryptography** - AES-256-GCM encryption
- **pyotp** - TOTP 2FA

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Framer Motion** - Animations
- **Axios** - HTTP client

### Infrastructure
- **Docker** - Containerization
- **nginx** - Reverse proxy
- **SQLite** - Database (easily switchable to PostgreSQL)

---

## 📁 Project Structure

```
securevault/
├── backend/
│   ├── app.py                    # Main Flask application
│   ├── config.py                 # Configuration settings
│   ├── models.py                 # Database models
│   ├── auth/
│   │   ├── routes.py             # Auth endpoints
│   │   ├── jwt_handler.py        # JWT token management
│   │   └── totp.py               # 2FA TOTP implementation
│   ├── security/
│   │   ├── encryption.py         # AES-256-GCM encryption
│   │   ├── password_analyzer.py  # Password strength analysis
│   │   ├── password_generator.py # Secure password generation
│   │   └── breach_checker.py     # HaveIBeenPwned API
│   ├── api/
│   │   ├── passwords.py          # Password vault endpoints
│   │   └── dashboard.py          # Analytics endpoints
│   ├── requirements.txt
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   ├── pages/                # Page components
│   │   ├── hooks/                # Custom React hooks
│   │   ├── context/              # React context providers
│   │   └── utils/                # Utility functions
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm or yarn

### Local Development

#### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp ../.env.example .env
# Edit .env with your configuration

# Run the development server
python app.py
```

The API will be available at `http://localhost:5000`

#### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Docker Deployment

```bash
# Copy environment file
cp .env.example .env
# Edit .env with your production values

# Build and run containers
docker-compose up -d

# View logs
docker-compose logs -f
```

The application will be available at `http://localhost`

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/2fa/setup` | Setup 2FA |
| POST | `/api/auth/2fa/verify` | Verify and enable 2FA |
| POST | `/api/auth/change-password` | Change password |

### Password Tools
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analyze` | Analyze password strength |
| POST | `/api/generate` | Generate secure password |
| POST | `/api/breach/check-password` | Check password breach |
| POST | `/api/breach/check-email` | Check email breach |

### Vault
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vault` | Get all vault entries |
| POST | `/api/vault` | Create new entry |
| GET | `/api/vault/:id` | Get specific entry |
| PUT | `/api/vault/:id` | Update entry |
| DELETE | `/api/vault/:id` | Delete entry |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Get security statistics |

---

## 🔒 Security Features

- **AES-256-GCM Encryption**: Military-grade encryption for stored passwords
- **PBKDF2 Key Derivation**: 600,000 iterations for secure key generation
- **bcrypt Password Hashing**: Cost factor 12 for user passwords
- **JWT Authentication**: Secure token-based authentication
- **TOTP 2FA**: Time-based one-time passwords
- **Rate Limiting**: Protection against brute force attacks
- **CORS Configuration**: Controlled cross-origin requests
- **Security Headers**: XSS, CSRF, and clickjacking protection
- **K-Anonymity**: Privacy-preserving breach checking

See [SECURITY.md](SECURITY.md) for detailed security information.

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
python -m pytest tests/ -v
```

### Code Coverage

```bash
python -m pytest tests/ --cov=. --cov-report=html
```

---

## 📸 Screenshots

### Dashboard
![Dashboard](https://via.placeholder.com/800x450/0a0a1a/00ffff?text=Dashboard+Screenshot)

### Password Analyzer
![Analyzer](https://via.placeholder.com/800x450/0a0a1a/8b5cf6?text=Password+Analyzer+Screenshot)

### Password Generator
![Generator](https://via.placeholder.com/800x450/0a0a1a/ec4899?text=Password+Generator+Screenshot)

### Vault
![Vault](https://via.placeholder.com/800x450/0a0a1a/10b981?text=Password+Vault+Screenshot)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [HaveIBeenPwned](https://haveibeenpwned.com/) for the breach database API
- [Flask](https://flask.palletsprojects.com/) for the backend framework
- [React](https://reactjs.org/) for the frontend library
- [Tailwind CSS](https://tailwindcss.com/) for the styling framework

---

<p align="center">
  Made with ❤️ for cybersecurity enthusiasts
</p>
