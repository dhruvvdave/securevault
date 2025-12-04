import { useState } from 'react'
import { motion } from 'framer-motion'
import { HiRefresh, HiClipboardCopy, HiCheck } from 'react-icons/hi'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { copyToClipboard } from '../utils/helpers'
import PasswordStrengthMeter from './PasswordStrengthMeter'

function PasswordGenerator({ onGenerate = null }) {
  const [password, setPassword] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  
  const [options, setOptions] = useState({
    length: 16,
    useLowercase: true,
    useUppercase: true,
    useDigits: true,
    useSymbols: true,
    type: 'password',
    wordCount: 4
  })

  const generatePassword = async () => {
    setLoading(true)
    try {
      const payload = options.type === 'passphrase' 
        ? { type: 'passphrase', word_count: options.wordCount }
        : {
            type: 'password',
            length: options.length,
            use_lowercase: options.useLowercase,
            use_uppercase: options.useUppercase,
            use_digits: options.useDigits,
            use_symbols: options.useSymbols
          }

      const response = await api.post('/generate', payload)
      setPassword(response.data.password)
      setAnalysis(response.data.analysis)
      
      if (onGenerate) {
        onGenerate(response.data.password)
      }
    } catch (error) {
      toast.error('Failed to generate password')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!password) return
    
    const success = await copyToClipboard(password)
    if (success) {
      setCopied(true)
      toast.success('Password copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } else {
      toast.error('Failed to copy password')
    }
  }

  const updateOption = (key, value) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Password Type Toggle */}
      <div className="flex space-x-2 p-1 bg-gray-800/50 rounded-lg">
        <button
          onClick={() => updateOption('type', 'password')}
          className={`flex-1 py-2 rounded-md transition-all ${
            options.type === 'password'
              ? 'bg-cyber-accent text-black font-medium'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Password
        </button>
        <button
          onClick={() => updateOption('type', 'passphrase')}
          className={`flex-1 py-2 rounded-md transition-all ${
            options.type === 'passphrase'
              ? 'bg-cyber-accent text-black font-medium'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Passphrase
        </button>
      </div>

      {/* Options */}
      {options.type === 'password' ? (
        <div className="space-y-4">
          {/* Length slider */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-gray-300">Length</label>
              <span className="text-sm text-cyber-accent font-medium">{options.length}</span>
            </div>
            <input
              type="range"
              min="8"
              max="64"
              value={options.length}
              onChange={(e) => updateOption('length', parseInt(e.target.value))}
              className="w-full accent-cyber-accent"
            />
          </div>

          {/* Character toggles */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'useLowercase', label: 'Lowercase (a-z)' },
              { key: 'useUppercase', label: 'Uppercase (A-Z)' },
              { key: 'useDigits', label: 'Numbers (0-9)' },
              { key: 'useSymbols', label: 'Symbols (!@#$)' },
            ].map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={options[key]}
                  onChange={(e) => updateOption(key, e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-cyber-accent focus:ring-cyber-accent focus:ring-offset-0"
                />
                <span className="text-sm text-gray-300">{label}</span>
              </label>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm text-gray-300">Number of Words</label>
            <span className="text-sm text-cyber-accent font-medium">{options.wordCount}</span>
          </div>
          <input
            type="range"
            min="3"
            max="8"
            value={options.wordCount}
            onChange={(e) => updateOption('wordCount', parseInt(e.target.value))}
            className="w-full accent-cyber-accent"
          />
        </div>
      )}

      {/* Generate Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={generatePassword}
        disabled={loading}
        className="w-full py-3 rounded-lg bg-gradient-to-r from-cyber-accent to-cyber-purple text-black font-medium flex items-center justify-center space-x-2 disabled:opacity-50"
      >
        <HiRefresh className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        <span>Generate Password</span>
      </motion.button>

      {/* Generated Password */}
      {password && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="relative">
            <div className="glass p-4 rounded-lg font-mono text-lg break-all text-center">
              {password}
            </div>
            <button
              onClick={handleCopy}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-cyber-accent/20 text-cyber-accent hover:bg-cyber-accent/30 transition-colors"
            >
              {copied ? <HiCheck className="w-5 h-5" /> : <HiClipboardCopy className="w-5 h-5" />}
            </button>
          </div>

          {analysis && (
            <div>
              <PasswordStrengthMeter
                score={analysis.score}
                strength={analysis.strength}
              />
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

export default PasswordGenerator
