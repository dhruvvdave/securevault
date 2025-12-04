/**
 * Format a date string to a human-readable format
 */
export function formatDate(dateString) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Get password strength color
 */
export function getStrengthColor(score) {
  if (score >= 80) return 'text-green-400'
  if (score >= 60) return 'text-cyan-400'
  if (score >= 40) return 'text-yellow-400'
  if (score >= 20) return 'text-orange-400'
  return 'text-red-400'
}

/**
 * Get password strength gradient
 */
export function getStrengthGradient(score) {
  if (score >= 80) return 'from-green-500 to-emerald-400'
  if (score >= 60) return 'from-cyan-500 to-blue-400'
  if (score >= 40) return 'from-yellow-500 to-amber-400'
  if (score >= 20) return 'from-orange-500 to-red-400'
  return 'from-red-600 to-red-400'
}

/**
 * Get password strength label
 */
export function getStrengthLabel(strength) {
  const labels = {
    very_weak: 'Very Weak',
    weak: 'Weak',
    moderate: 'Moderate',
    strong: 'Strong',
    very_strong: 'Very Strong'
  }
  return labels[strength] || 'Unknown'
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-9999px'
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      return true
    } catch (err) {
      return false
    } finally {
      document.body.removeChild(textArea)
    }
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return pattern.test(email)
}

/**
 * Format large numbers
 */
export function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text, maxLength = 30) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Generate random string for unique IDs
 */
export function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
