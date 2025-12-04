import { motion } from 'framer-motion'
import { getStrengthGradient, getStrengthLabel } from '../utils/helpers'

function PasswordStrengthMeter({ score, strength, showLabel = true }) {
  const gradient = getStrengthGradient(score)
  const label = getStrengthLabel(strength)

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
        />
      </div>

      {/* Label and score */}
      {showLabel && (
        <div className="flex justify-between mt-2 text-sm">
          <span className={`font-medium ${getTextColor(score)}`}>
            {label}
          </span>
          <span className="text-gray-400">{score}/100</span>
        </div>
      )}
    </div>
  )
}

function getTextColor(score) {
  if (score >= 80) return 'text-green-400'
  if (score >= 60) return 'text-cyan-400'
  if (score >= 40) return 'text-yellow-400'
  if (score >= 20) return 'text-orange-400'
  return 'text-red-400'
}

export default PasswordStrengthMeter
