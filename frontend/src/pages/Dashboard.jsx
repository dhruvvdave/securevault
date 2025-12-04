import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  HiShieldCheck, 
  HiKey, 
  HiExclamation, 
  HiLockClosed,
  HiRefresh,
  HiArrowRight
} from 'react-icons/hi'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import api from '../utils/api'
import SecurityScore from '../components/SecurityScore'

function Dashboard() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    fetchStats()
  }, [isAuthenticated])

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats')
      setStats(response.data)
    } catch (error) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    {
      icon: HiShieldCheck,
      label: 'Analyze Password',
      path: '/analyzer',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      icon: HiKey,
      label: 'Generate Password',
      path: '/generator',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: HiExclamation,
      label: 'Check Breaches',
      path: '/breach-check',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: HiLockClosed,
      label: 'Open Vault',
      path: '/vault',
      color: 'from-green-500 to-emerald-500'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyber-accent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold">
            Welcome back, <span className="gradient-text">{user?.email?.split('@')[0]}</span>
          </h1>
          <p className="text-gray-400 mt-1">Here's an overview of your password security.</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Security Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 glass rounded-xl p-6"
          >
            <h2 className="text-lg font-semibold mb-6 text-center">Security Score</h2>
            <SecurityScore score={stats?.security_score || 0} />
            
            <div className="mt-6 space-y-2">
              {stats?.recommendations?.slice(0, 3).map((rec, index) => (
                <div key={index} className="text-sm text-gray-400 flex items-start space-x-2">
                  <span className="text-cyber-accent">•</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="glass rounded-xl p-4">
                <div className="text-3xl font-bold text-cyber-accent">
                  {stats?.total_passwords || 0}
                </div>
                <div className="text-sm text-gray-400">Total Passwords</div>
              </div>
              <div className="glass rounded-xl p-4">
                <div className="text-3xl font-bold text-green-400">
                  {stats?.strong_passwords || 0}
                </div>
                <div className="text-sm text-gray-400">Strong</div>
              </div>
              <div className="glass rounded-xl p-4">
                <div className="text-3xl font-bold text-yellow-400">
                  {stats?.moderate_passwords || 0}
                </div>
                <div className="text-sm text-gray-400">Moderate</div>
              </div>
              <div className="glass rounded-xl p-4">
                <div className="text-3xl font-bold text-red-400">
                  {stats?.weak_passwords || 0}
                </div>
                <div className="text-sm text-gray-400">Weak</div>
              </div>
            </div>

            {/* Password Health Bar */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Password Health</h3>
              <div className="h-4 bg-gray-800 rounded-full overflow-hidden flex">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${(stats?.strong_passwords || 0) / Math.max(stats?.total_passwords || 1, 1) * 100}%` 
                  }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="bg-green-500 h-full"
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${(stats?.moderate_passwords || 0) / Math.max(stats?.total_passwords || 1, 1) * 100}%` 
                  }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="bg-yellow-500 h-full"
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${(stats?.weak_passwords || 0) / Math.max(stats?.total_passwords || 1, 1) * 100}%` 
                  }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="bg-red-500 h-full"
                />
              </div>
              
              <div className="flex justify-between mt-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-gray-400">Strong</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-gray-400">Moderate</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-gray-400">Weak</span>
                </div>
              </div>

              {stats?.reused_passwords > 0 && (
                <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                  <div className="flex items-center space-x-2 text-orange-400">
                    <HiExclamation className="w-5 h-5" />
                    <span>You have {stats.reused_passwords} reused password(s)</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.path}
                className="glass rounded-xl p-6 hover:border-cyber-accent/30 transition-all group"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">{action.label}</span>
                  <HiArrowRight className="w-5 h-5 text-gray-500 group-hover:text-cyber-accent group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* 2FA Status */}
        {!stats?.totp_enabled && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6"
          >
            <div className="glass rounded-xl p-6 neon-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-cyber-purple/20 flex items-center justify-center">
                    <HiShieldCheck className="w-6 h-6 text-cyber-purple" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Enable Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
                  </div>
                </div>
                <Link
                  to="/settings"
                  className="px-4 py-2 bg-cyber-purple/20 text-cyber-purple rounded-lg hover:bg-cyber-purple/30 transition-colors"
                >
                  Enable 2FA
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
