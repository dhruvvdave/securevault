import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  HiShieldCheck, 
  HiKey, 
  HiExclamation, 
  HiLockClosed,
  HiFingerPrint,
  HiChartBar
} from 'react-icons/hi'

function Home() {
  const features = [
    {
      icon: HiShieldCheck,
      title: 'Password Analyzer',
      description: 'Get detailed analysis of your password strength with entropy calculation and pattern detection.',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      icon: HiKey,
      title: 'Secure Generator',
      description: 'Generate cryptographically secure passwords and memorable passphrases.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: HiExclamation,
      title: 'Breach Checker',
      description: 'Check if your email or passwords have been exposed in known data breaches.',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: HiLockClosed,
      title: 'Encrypted Vault',
      description: 'Store your passwords securely with AES-256-GCM encryption.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: HiFingerPrint,
      title: 'Two-Factor Auth',
      description: 'Protect your account with TOTP-based two-factor authentication.',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: HiChartBar,
      title: 'Security Dashboard',
      description: 'Monitor your overall password health and get personalized recommendations.',
      color: 'from-pink-500 to-rose-500'
    }
  ]

  const stats = [
    { value: '256-bit', label: 'AES Encryption' },
    { value: '100%', label: 'Open Source' },
    { value: 'Zero', label: 'Knowledge' },
    { value: 'TOTP', label: '2FA Support' }
  ]

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="gradient-text">Secure</span> Your Digital Life
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
              A comprehensive password security solution with advanced analysis, 
              breach detection, and encrypted storage. Your passwords deserve the best protection.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="px-8 py-4 bg-gradient-to-r from-cyber-accent to-cyber-purple text-black font-semibold rounded-xl hover:opacity-90 transition-opacity btn-cyber"
              >
                Get Started Free
              </Link>
              <Link
                to="/analyzer"
                className="px-8 py-4 glass rounded-xl font-medium hover:bg-white/10 transition-colors"
              >
                Try Password Analyzer
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat, index) => (
              <div key={index} className="glass rounded-xl p-4">
                <div className="text-2xl font-bold text-cyber-accent">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need for{' '}
              <span className="gradient-text">Password Security</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Powerful tools to analyze, generate, and securely store your passwords.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-xl p-6 hover:border-cyber-accent/30 transition-all group"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-8 md:p-12 text-center neon-border"
          >
            <h2 className="text-3xl font-bold mb-4">
              Ready to Secure Your Passwords?
            </h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Join thousands of users who trust SecureVault to protect their digital identity.
            </p>
            <Link
              to="/register"
              className="inline-block px-8 py-4 bg-gradient-to-r from-cyber-accent to-cyber-purple text-black font-semibold rounded-xl hover:opacity-90 transition-opacity"
            >
              Create Free Account
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-gray-400 text-sm">
            © 2024 SecureVault. All rights reserved.
          </div>
          <div className="flex items-center space-x-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
