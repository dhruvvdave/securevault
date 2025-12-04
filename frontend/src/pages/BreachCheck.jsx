import { motion } from 'framer-motion'
import BreachChecker from '../components/BreachChecker'

function BreachCheck() {
  return (
    <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl font-bold mb-2">
            Breach <span className="gradient-text">Checker</span>
          </h1>
          <p className="text-gray-400">
            Check if your email or passwords have been exposed in known data breaches.
          </p>
        </motion.div>

        {/* Checker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <BreachChecker />
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 glass rounded-xl p-6"
        >
          <h3 className="font-semibold mb-3">About the Breach Check</h3>
          <div className="space-y-4 text-sm text-gray-400">
            <p>
              We use the <a href="https://haveibeenpwned.com" target="_blank" rel="noopener noreferrer" className="text-cyber-accent hover:underline">Have I Been Pwned</a> API to check 
              for data breaches. This service aggregates data from publicly available breach databases.
            </p>
            <p>
              <strong className="text-white">For passwords:</strong> We use k-anonymity to protect your privacy. 
              Only the first 5 characters of your password's SHA-1 hash are sent to the API. Your actual password 
              never leaves your device.
            </p>
            <p>
              <strong className="text-white">For emails:</strong> The full email address is sent to check against 
              the breach database. Consider using this feature only with emails you're comfortable sharing.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default BreachCheck
