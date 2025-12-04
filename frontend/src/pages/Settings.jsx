import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  HiUser, 
  HiShieldCheck, 
  HiKey,
  HiTrash,
  HiLogout
} from 'react-icons/hi'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import api from '../utils/api'
import TwoFactorSetup from '../components/TwoFactorSetup'

function Settings() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout, updateUser } = useAuth()
  
  const [activeTab, setActiveTab] = useState('account')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated])

  const tabs = [
    { id: 'account', label: 'Account', icon: HiUser },
    { id: 'security', label: 'Security', icon: HiShieldCheck },
    { id: 'danger', label: 'Danger Zone', icon: HiTrash },
  ]

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-400 mt-1">Manage your account and security preferences</p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:w-64 flex-shrink-0"
          >
            <nav className="glass rounded-xl p-2 space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-cyber-accent/20 text-cyber-accent'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1"
          >
            {activeTab === 'account' && (
              <AccountSettings user={user} />
            )}
            {activeTab === 'security' && (
              <SecuritySettings user={user} updateUser={updateUser} />
            )}
            {activeTab === 'danger' && (
              <DangerZone logout={logout} navigate={navigate} />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function AccountSettings({ user }) {
  return (
    <div className="space-y-6">
      <div className="glass rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-6">Account Information</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Email</label>
            <div className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-300">
              {user?.email}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Account Created</label>
            <div className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-300">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Last Login</label>
            <div className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-300">
              {user?.last_login ? new Date(user.last_login).toLocaleString() : 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SecuritySettings({ user, updateUser }) {
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChangePassword = async (e) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/change-password', {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword
      })
      toast.success('Password changed successfully')
      setShowChangePassword(false)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const handle2FAComplete = async () => {
    try {
      const response = await api.get('/auth/me')
      updateUser(response.data.user)
    } catch (error) {
      console.error('Failed to refresh user data')
    }
  }

  return (
    <div className="space-y-6">
      {/* 2FA Section */}
      <div className="glass rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-6">Two-Factor Authentication</h2>
        
        {user?.totp_enabled ? (
          <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <HiShieldCheck className="w-6 h-6 text-green-400" />
              <div>
                <div className="font-medium text-green-400">2FA is enabled</div>
                <div className="text-sm text-gray-400">Your account has an extra layer of security</div>
              </div>
            </div>
          </div>
        ) : (
          <TwoFactorSetup onComplete={handle2FAComplete} />
        )}
      </div>

      {/* Change Password Section */}
      <div className="glass rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-6">Change Password</h2>
        
        {!showChangePassword ? (
          <button
            onClick={() => setShowChangePassword(true)}
            className="px-4 py-2 bg-cyber-accent/20 text-cyber-accent rounded-lg hover:bg-cyber-accent/30 transition-colors flex items-center space-x-2"
          >
            <HiKey className="w-5 h-5" />
            <span>Change Password</span>
          </button>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Current Password</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                required
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-cyber-accent transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                required
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-cyber-accent transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                required
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-cyber-accent transition-colors"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowChangePassword(false)
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                }}
                className="flex-1 py-3 border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-cyber-accent text-black font-medium rounded-lg disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function DangerZone({ logout, navigate }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleDeleteAccount = async (e) => {
    e.preventDefault()
    
    if (!confirm('Are you absolutely sure? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    try {
      await api.delete('/auth/delete-account', {
        data: { password }
      })
      toast.success('Account deleted')
      await logout()
      navigate('/')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="glass rounded-xl p-6 border border-red-500/30">
        <h2 className="text-xl font-semibold mb-2 text-red-400">Danger Zone</h2>
        <p className="text-gray-400 mb-6">
          Irreversible and destructive actions. Please be careful.
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center space-x-2"
          >
            <HiTrash className="w-5 h-5" />
            <span>Delete Account</span>
          </button>
        ) : (
          <form onSubmit={handleDeleteAccount} className="space-y-4">
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
              <strong>Warning:</strong> This will permanently delete your account and all stored passwords. 
              This action cannot be undone.
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Enter your password to confirm</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Your password"
                className="w-full px-4 py-3 bg-gray-800/50 border border-red-500/30 rounded-lg focus:border-red-500 transition-colors"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setPassword('')
                }}
                className="flex-1 py-3 border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-red-500 text-white font-medium rounded-lg disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete My Account'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default Settings
