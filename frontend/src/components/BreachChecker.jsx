import { useState } from 'react'
import { motion } from 'framer-motion'
import { HiShieldCheck, HiShieldExclamation, HiSearch, HiMail } from 'react-icons/hi'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { formatNumber } from '../utils/helpers'

function BreachChecker() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailResult, setEmailResult] = useState(null)
  const [passwordResult, setPasswordResult] = useState(null)
  const [loading, setLoading] = useState({ email: false, password: false })
  const [showPassword, setShowPassword] = useState(false)

  const checkEmail = async () => {
    if (!email.trim()) {
      toast.error('Please enter an email address')
      return
    }

    setLoading(prev => ({ ...prev, email: true }))
    try {
      const response = await api.post('/breach/check-email', { email })
      setEmailResult(response.data)
    } catch (error) {
      toast.error('Failed to check email')
    } finally {
      setLoading(prev => ({ ...prev, email: false }))
    }
  }

  const checkPassword = async () => {
    if (!password.trim()) {
      toast.error('Please enter a password')
      return
    }

    setLoading(prev => ({ ...prev, password: true }))
    try {
      const response = await api.post('/breach/check-password', { password })
      setPasswordResult(response.data)
    } catch (error) {
      toast.error('Failed to check password')
    } finally {
      setLoading(prev => ({ ...prev, password: false }))
    }
  }

  return (
    <div className="space-y-8">
      {/* Email Check Section */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <HiMail className="text-cyber-accent" />
          <span>Email Breach Check</span>
        </h3>

        <div className="flex space-x-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-cyber-accent transition-colors"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={checkEmail}
            disabled={loading.email}
            className="px-6 py-3 bg-cyber-accent text-black rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50"
          >
            <HiSearch className={`w-5 h-5 ${loading.email ? 'animate-pulse' : ''}`} />
            <span>Check</span>
          </motion.button>
        </div>

        {emailResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            {emailResult.error ? (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400">
                {emailResult.error}
              </div>
            ) : emailResult.breached ? (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-center space-x-2 text-red-400 mb-2">
                  <HiShieldExclamation className="w-5 h-5" />
                  <span className="font-medium">
                    Found in {emailResult.count} breach(es)
                  </span>
                </div>
                {emailResult.breaches && emailResult.breaches.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {emailResult.breaches.slice(0, 5).map((breach, index) => (
                      <div key={index} className="text-sm text-gray-300">
                        <span className="font-medium">{breach.name}</span>
                        {breach.breach_date && (
                          <span className="text-gray-500 ml-2">
                            ({breach.breach_date})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center space-x-2 text-green-400">
                  <HiShieldCheck className="w-5 h-5" />
                  <span>No breaches found for this email!</span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Password Check Section */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <HiShieldCheck className="text-cyber-purple" />
          <span>Password Breach Check</span>
        </h3>

        <p className="text-sm text-gray-400 mb-4">
          We use k-anonymity to check your password securely. Only the first 5 characters 
          of your password's hash are sent to the API.
        </p>

        <div className="flex space-x-3">
          <div className="relative flex-1">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter a password to check"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-cyber-purple transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={checkPassword}
            disabled={loading.password}
            className="px-6 py-3 bg-cyber-purple text-white rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50"
          >
            <HiSearch className={`w-5 h-5 ${loading.password ? 'animate-pulse' : ''}`} />
            <span>Check</span>
          </motion.button>
        </div>

        {passwordResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            {passwordResult.breached ? (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-center space-x-2 text-red-400 mb-2">
                  <HiShieldExclamation className="w-5 h-5" />
                  <span className="font-medium">
                    This password has been exposed {formatNumber(passwordResult.count)} times!
                  </span>
                </div>
                <p className="text-sm text-gray-400">
                  This password has appeared in data breaches. You should not use it.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center space-x-2 text-green-400">
                  <HiShieldCheck className="w-5 h-5" />
                  <span>This password has not been found in known data breaches!</span>
                </div>
              </div>
            )}

            {passwordResult.hash_info && (
              <div className="mt-4 p-4 bg-gray-800/50 rounded-lg text-sm">
                <div className="text-gray-400 mb-2">Hash Information (SHA-1):</div>
                <div className="font-mono text-xs break-all">
                  <span className="text-cyber-accent">{passwordResult.hash_info.hash_prefix}</span>
                  <span className="text-gray-500">{passwordResult.hash_info.hash_suffix}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Only the highlighted portion is sent to the API (k-anonymity).
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default BreachChecker
