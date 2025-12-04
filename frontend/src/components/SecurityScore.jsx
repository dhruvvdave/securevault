import { motion } from 'framer-motion'

function SecurityScore({ score, size = 'large' }) {
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (score / 100) * circumference

  const getScoreColor = () => {
    if (score >= 80) return '#10b981' // green
    if (score >= 60) return '#06b6d4' // cyan
    if (score >= 40) return '#eab308' // yellow
    if (score >= 20) return '#f97316' // orange
    return '#ef4444' // red
  }

  const getScoreLabel = () => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    if (score >= 20) return 'Poor'
    return 'Critical'
  }

  const dimensions = size === 'large' 
    ? { width: 160, height: 160, textSize: 'text-4xl', labelSize: 'text-sm' }
    : { width: 120, height: 120, textSize: 'text-2xl', labelSize: 'text-xs' }

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: dimensions.width, height: dimensions.height }}>
        <svg
          className="transform -rotate-90"
          width={dimensions.width}
          height={dimensions.height}
        >
          {/* Background circle */}
          <circle
            cx={dimensions.width / 2}
            cy={dimensions.height / 2}
            r="45"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="8"
          />
          
          {/* Score circle */}
          <motion.circle
            cx={dimensions.width / 2}
            cy={dimensions.height / 2}
            r="45"
            fill="none"
            stroke={getScoreColor()}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{
              filter: `drop-shadow(0 0 10px ${getScoreColor()})`
            }}
          />
        </svg>
        
        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className={`${dimensions.textSize} font-bold`}
            style={{ color: getScoreColor() }}
          >
            {score}
          </motion.span>
          <span className={`${dimensions.labelSize} text-gray-400`}>/ 100</span>
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-2 text-center"
      >
        <span 
          className="font-medium"
          style={{ color: getScoreColor() }}
        >
          {getScoreLabel()}
        </span>
      </motion.div>
    </div>
  )
}

export default SecurityScore
