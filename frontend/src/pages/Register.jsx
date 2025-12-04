import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiMail, HiLockClosed, HiUserAdd, HiCheckCircle, HiXCircle } from 'react-icons/hi'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import PasswordStrengthMeter from '../components/PasswordStrengthMeter'
import api from '../utils/api'

function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [passwordAnalysis, setPasswordAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = async (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Analyze password in real-time
    if (name === 'password' && value.length > 0) {
      try {
        const response = await api.post('/analyze', { password: value })
        setPasswordAnalysis(response.data)
      } catch (error) {
        // Ignore errors during typing
      }
    } else if (name === 'password' && value.length === 0) {
      setPasswordAnalysis(null)
    }
  }

  const passwordRequirements = [
    { 
      label: 'At least 8 characters', 
      met: formData.password.length >= 8 
    },
    { 
      label: 'Contains uppercase letter', 
      met: /[A-Z]/.test(formData.password) 
    },
    { 
      label: 'Contains lowercase letter', 
      met: /[a-z]/.test(formData.password) 
    },
    { 
      label: 'Contains number', 
      met: /\d/.test(formData.password) 
    }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (!passwordRequirements.every(req => req.met)) {
      toast.error('Please meet all password requirements')
      return
    }

    setLoading(true)

    try {
      await register(formData.email, formData.password)
      toast.success('Account created successfully!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyber-accent/20 to-cyber-purple/20 flex items-center justify-center">
              <HiUserAdd className="w-8 h-8 text-cyber-accent" />
            </div>
            <h1 className="text-2xl font-bold">Create Account</h1>
            <p className="text-gray-400 mt-2">Start securing your passwords today</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <div className="relative">
                <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-cyber-accent transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Password</label>
              <div className="relative">
                <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-cyber-accent transition-colors"
                />
              </div>

              {/* Password Strength */}
              {passwordAnalysis && (
                <div className="mt-3">
                  <PasswordStrengthMeter 
                    score={passwordAnalysis.score}
                    strength={passwordAnalysis.strength}
                  />
                </div>
              )}

              {/* Requirements */}
              <div className="mt-3 space-y-1">
                {passwordRequirements.map((req, index) => (
                  <div 
                    key={index}
                    className={`flex items-center space-x-2 text-sm ${
                      req.met ? 'text-green-400' : 'text-gray-500'
                    }`}
                  >
                    {req.met ? (
                      <HiCheckCircle className="w-4 h-4" />
                    ) : (
                      <HiXCircle className="w-4 h-4" />
                    )}
                    <span>{req.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Confirm Password</label>
              <div className="relative">
                <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-4 py-3 bg-gray-800/50 border rounded-lg transition-colors ${
                    formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? 'border-red-500'
                      : formData.confirmPassword && formData.password === formData.confirmPassword
                      ? 'border-green-500'
                      : 'border-gray-700 focus:border-cyber-accent'
                  }`}
                />
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">Passwords do not match</p>
              )}
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-cyber-accent to-cyber-purple text-black font-semibold rounded-lg disabled:opacity-50 btn-cyber"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </motion.button>
          </form>

          {/* Login link */}
          <p className="mt-6 text-center text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-cyber-accent hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Register
