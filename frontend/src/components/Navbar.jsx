import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { 
  HiHome, 
  HiShieldCheck, 
  HiKey, 
  HiExclamation,
  HiLockClosed,
  HiChartBar,
  HiCog,
  HiLogout,
  HiMenu,
  HiX
} from 'react-icons/hi'
import { useState } from 'react'

function Navbar() {
  const { isAuthenticated, logout, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const navLinks = isAuthenticated ? [
    { path: '/dashboard', label: 'Dashboard', icon: HiChartBar },
    { path: '/analyzer', label: 'Analyzer', icon: HiShieldCheck },
    { path: '/generator', label: 'Generator', icon: HiKey },
    { path: '/breach-check', label: 'Breach Check', icon: HiExclamation },
    { path: '/vault', label: 'Vault', icon: HiLockClosed },
  ] : [
    { path: '/analyzer', label: 'Analyzer', icon: HiShieldCheck },
    { path: '/generator', label: 'Generator', icon: HiKey },
    { path: '/breach-check', label: 'Breach Check', icon: HiExclamation },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold gradient-text"
            >
              🔐 SecureVault
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all ${
                  isActive(link.path)
                    ? 'bg-cyber-accent/20 text-cyber-accent'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <link.icon className="w-5 h-5" />
                <span className="text-sm">{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/settings"
                  className={`p-2 rounded-lg transition-all ${
                    isActive('/settings')
                      ? 'bg-cyber-accent/20 text-cyber-accent'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <HiCog className="w-5 h-5" />
                </Link>
                <span className="text-sm text-gray-400">{user?.email}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                >
                  <HiLogout className="w-4 h-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm bg-gradient-to-r from-cyber-accent to-cyber-purple rounded-lg text-black font-medium hover:opacity-90 transition-opacity"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5"
          >
            {mobileMenuOpen ? (
              <HiX className="w-6 h-6" />
            ) : (
              <HiMenu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden py-4 border-t border-white/10"
          >
            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all ${
                    isActive(link.path)
                      ? 'bg-cyber-accent/20 text-cyber-accent'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              ))}
              {isAuthenticated ? (
                <>
                  <Link
                    to="/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5"
                  >
                    <HiCog className="w-5 h-5" />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-3 rounded-lg bg-red-500/20 text-red-400"
                  >
                    <HiLogout className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <div className="flex space-x-2 px-4 pt-4">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 rounded-lg border border-cyber-accent/50 text-cyber-accent"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 rounded-lg bg-gradient-to-r from-cyber-accent to-cyber-purple text-black font-medium"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
