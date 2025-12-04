import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  HiShieldCheck, 
  HiLightningBolt,
  HiClock,
  HiExclamation,
  HiCheckCircle
} from 'react-icons/hi'
import api from '../utils/api'
import PasswordStrengthMeter from '../components/PasswordStrengthMeter'
import { getStrengthLabel, getStrengthColor } from '../utils/helpers'

function Analyzer() {
  const [password, setPassword] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const analyzePassword = async () => {
    if (!password.trim()) return

    setLoading(true)
    try {
      const response = await api.post('/analyze', { password })
      setAnalysis(response.data)
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      analyzePassword()
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl font-bold mb-2">
            Password <span className="gradient-text">Analyzer</span>
          </h1>
          <p className="text-gray-400">
            Get detailed analysis of your password strength and security recommendations.
          </p>
        </motion.div>

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-6 mb-8"
        >
          <div className="flex space-x-4">
            <div className="relative flex-1">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter a password to analyze"
                className="w-full px-6 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-lg focus:border-cyber-accent transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={analyzePassword}
              disabled={loading || !password.trim()}
              className="px-8 py-4 bg-gradient-to-r from-cyber-accent to-cyber-purple text-black font-semibold rounded-xl disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </motion.button>
          </div>
        </motion.div>

        {/* Results */}
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Strength Meter */}
            <div className="glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Password Strength</h2>
                <span className={`text-lg font-bold ${getStrengthColor(analysis.score)}`}>
                  {getStrengthLabel(analysis.strength)}
                </span>
              </div>
              <PasswordStrengthMeter 
                score={analysis.score} 
                strength={analysis.strength}
                showLabel={false}
              />
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="glass rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <HiLightningBolt className="w-6 h-6 text-cyber-accent" />
                  <h3 className="font-semibold">Entropy</h3>
                </div>
                <div className="text-3xl font-bold">{analysis.entropy}</div>
                <div className="text-sm text-gray-400">bits of randomness</div>
              </div>

              <div className="glass rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <HiShieldCheck className="w-6 h-6 text-green-400" />
                  <h3 className="font-semibold">Length</h3>
                </div>
                <div className="text-3xl font-bold">{analysis.length}</div>
                <div className="text-sm text-gray-400">characters</div>
              </div>

              <div className="glass rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <HiClock className="w-6 h-6 text-purple-400" />
                  <h3 className="font-semibold">Time to Crack</h3>
                </div>
                <div className="text-lg font-bold truncate">
                  {analysis.crack_times?.offline_slow || 'N/A'}
                </div>
                <div className="text-sm text-gray-400">offline attack</div>
              </div>
            </div>

            {/* Character Analysis */}
            <div className="glass rounded-xl p-6">
              <h3 className="font-semibold mb-4">Character Composition</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Lowercase', has: analysis.characters?.has_lowercase, count: analysis.characters?.lowercase_count },
                  { label: 'Uppercase', has: analysis.characters?.has_uppercase, count: analysis.characters?.uppercase_count },
                  { label: 'Numbers', has: analysis.characters?.has_digits, count: analysis.characters?.digit_count },
                  { label: 'Symbols', has: analysis.characters?.has_symbols, count: analysis.characters?.symbol_count },
                ].map((item, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg ${
                      item.has ? 'bg-green-500/10 border border-green-500/30' : 'bg-gray-800/50 border border-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      {item.has ? (
                        <HiCheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <HiExclamation className="w-5 h-5 text-gray-500" />
                      )}
                      <span className={item.has ? 'text-green-400' : 'text-gray-500'}>{item.label}</span>
                    </div>
                    <div className="text-2xl font-bold">{item.count || 0}</div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Unique Characters</span>
                  <span className="font-bold">{analysis.characters?.unique_characters || 0}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-400">Character Diversity</span>
                  <span className="font-bold">
                    {((analysis.characters?.character_diversity || 0) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Patterns */}
            {analysis.patterns?.has_patterns && (
              <div className="glass rounded-xl p-6 border border-orange-500/30">
                <h3 className="font-semibold mb-4 flex items-center space-x-2 text-orange-400">
                  <HiExclamation className="w-5 h-5" />
                  <span>Patterns Detected</span>
                </h3>
                <div className="space-y-2">
                  {analysis.patterns.keyboard_patterns?.length > 0 && (
                    <div className="text-sm">
                      <span className="text-gray-400">Keyboard patterns:</span>{' '}
                      <span className="text-orange-400">
                        {analysis.patterns.keyboard_patterns.join(', ')}
                      </span>
                    </div>
                  )}
                  {analysis.patterns.repeated_chars?.length > 0 && (
                    <div className="text-sm">
                      <span className="text-gray-400">Repeated characters:</span>{' '}
                      <span className="text-orange-400">
                        {analysis.patterns.repeated_chars.join(', ')}
                      </span>
                    </div>
                  )}
                  {analysis.patterns.sequential_chars?.length > 0 && (
                    <div className="text-sm">
                      <span className="text-gray-400">Sequential characters:</span>{' '}
                      <span className="text-orange-400">
                        {analysis.patterns.sequential_chars.join(', ')}
                      </span>
                    </div>
                  )}
                  {analysis.patterns.date_patterns?.length > 0 && (
                    <div className="text-sm">
                      <span className="text-gray-400">Date patterns:</span>{' '}
                      <span className="text-orange-400">
                        {analysis.patterns.date_patterns.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Common Password Warning */}
            {analysis.is_common && (
              <div className="glass rounded-xl p-6 border border-red-500/30">
                <div className="flex items-center space-x-3 text-red-400">
                  <HiExclamation className="w-6 h-6" />
                  <div>
                    <h3 className="font-semibold">Common Password Detected</h3>
                    <p className="text-sm text-gray-400">
                      This password is in the list of commonly used passwords and should not be used.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysis.recommendations?.length > 0 && (
              <div className="glass rounded-xl p-6">
                <h3 className="font-semibold mb-4">Recommendations</h3>
                <ul className="space-y-2">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2 text-gray-400">
                      <span className="text-cyber-accent mt-1">→</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Crack Time Estimates */}
            <div className="glass rounded-xl p-6">
              <h3 className="font-semibold mb-4">Time to Crack Estimates</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(analysis.crack_times || {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-gray-400 capitalize">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Analyzer
