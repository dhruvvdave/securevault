import { motion } from 'framer-motion'
import PasswordGenerator from '../components/PasswordGenerator'

function Generator() {
  return (
    <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl font-bold mb-2">
            Password <span className="gradient-text">Generator</span>
          </h1>
          <p className="text-gray-400">
            Generate cryptographically secure passwords and passphrases.
          </p>
        </motion.div>

        {/* Generator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-6"
        >
          <PasswordGenerator />
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 glass rounded-xl p-6"
        >
          <h3 className="font-semibold mb-3">Security Tips</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start space-x-2">
              <span className="text-cyber-accent">•</span>
              <span>Use a unique password for each account</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-cyber-accent">•</span>
              <span>Longer passwords are generally more secure</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-cyber-accent">•</span>
              <span>Passphrases are easier to remember and very secure</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-cyber-accent">•</span>
              <span>Store your passwords in a secure vault</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  )
}

export default Generator
