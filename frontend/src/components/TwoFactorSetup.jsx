import { useState } from 'react'
import { motion } from 'framer-motion'
import { HiShieldCheck, HiQrcode, HiKey } from 'react-icons/hi'
import toast from 'react-hot-toast'
import api from '../utils/api'

function TwoFactorSetup({ onComplete }) {
  const [step, setStep] = useState('setup') // setup, verify
  const [setupData, setSetupData] = useState(null)
  const [verifyCode, setVerifyCode] = useState('')
  const [loading, setLoading] = useState(false)

  const initSetup = async () => {
    setLoading(true)
    try {
      const response = await api.post('/auth/2fa/setup')
      setSetupData(response.data)
      setStep('verify')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to setup 2FA')
    } finally {
      setLoading(false)
    }
  }

  const verifyAndEnable = async () => {
    if (verifyCode.length !== 6) {
      toast.error('Please enter a 6-digit code')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/2fa/verify', { code: verifyCode })
      toast.success('2FA has been enabled!')
      if (onComplete) onComplete()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid verification code')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'setup') {
    return (
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cyber-accent/20 flex items-center justify-center">
          <HiShieldCheck className="w-8 h-8 text-cyber-accent" />
        </div>
        
        <h3 className="text-xl font-semibold mb-2">Enable Two-Factor Authentication</h3>
        <p className="text-gray-400 mb-6">
          Add an extra layer of security to your account by enabling 2FA.
        </p>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={initSetup}
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-cyber-accent to-cyber-purple text-black font-medium rounded-lg disabled:opacity-50"
        >
          {loading ? 'Setting up...' : 'Setup 2FA'}
        </motion.button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Scan QR Code</h3>
        <p className="text-gray-400 text-sm">
          Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
        </p>
      </div>

      {/* QR Code */}
      {setupData?.qr_code && (
        <div className="flex justify-center">
          <div className="p-4 bg-white rounded-xl">
            <img
              src={setupData.qr_code}
              alt="2FA QR Code"
              className="w-48 h-48"
            />
          </div>
        </div>
      )}

      {/* Manual entry */}
      <div className="glass rounded-lg p-4">
        <div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
          <HiKey className="w-4 h-4" />
          <span>Manual entry key:</span>
        </div>
        <code className="block p-2 bg-gray-800/50 rounded font-mono text-sm text-cyber-accent break-all">
          {setupData?.secret}
        </code>
      </div>

      {/* Verification */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">
          Enter the 6-digit code from your authenticator app
        </label>
        <input
          type="text"
          value={verifyCode}
          onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-center text-2xl tracking-widest font-mono focus:border-cyber-accent transition-colors"
          maxLength={6}
        />
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={verifyAndEnable}
        disabled={loading || verifyCode.length !== 6}
        className="w-full py-3 bg-gradient-to-r from-cyber-accent to-cyber-purple text-black font-medium rounded-lg disabled:opacity-50"
      >
        {loading ? 'Verifying...' : 'Verify and Enable 2FA'}
      </motion.button>
    </div>
  )
}

export default TwoFactorSetup
