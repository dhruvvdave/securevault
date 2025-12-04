import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  HiEye, 
  HiEyeOff, 
  HiClipboardCopy, 
  HiPencil, 
  HiTrash,
  HiStar,
  HiExternalLink
} from 'react-icons/hi'
import toast from 'react-hot-toast'
import { copyToClipboard, truncate, formatDate } from '../utils/helpers'

function VaultItem({ entry, onEdit, onDelete }) {
  const [showPassword, setShowPassword] = useState(false)
  const [copiedField, setCopiedField] = useState(null)

  const handleCopy = async (text, field) => {
    const success = await copyToClipboard(text)
    if (success) {
      setCopiedField(field)
      toast.success(`${field} copied!`)
      setTimeout(() => setCopiedField(null), 2000)
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      social: 'bg-blue-500/20 text-blue-400',
      work: 'bg-green-500/20 text-green-400',
      finance: 'bg-yellow-500/20 text-yellow-400',
      shopping: 'bg-purple-500/20 text-purple-400',
      gaming: 'bg-red-500/20 text-red-400',
      general: 'bg-gray-500/20 text-gray-400'
    }
    return colors[category] || colors.general
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="glass rounded-xl p-4 hover:border-cyber-accent/30 transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          {/* Icon/Avatar */}
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyber-accent/20 to-cyber-purple/20 flex items-center justify-center">
            <span className="text-lg">
              {entry.title?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
          
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-medium">{entry.title}</h3>
              {entry.favorite && (
                <HiStar className="w-4 h-4 text-yellow-400" />
              )}
            </div>
            <p className="text-sm text-gray-400">{entry.username || 'No username'}</p>
          </div>
        </div>

        {/* Category badge */}
        <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(entry.category)}`}>
          {entry.category || 'general'}
        </span>
      </div>

      {/* Password field */}
      <div className="mt-4 flex items-center space-x-2">
        <div className="flex-1 px-3 py-2 bg-gray-800/50 rounded-lg font-mono text-sm">
          {showPassword ? entry.password : '••••••••••••'}
        </div>
        
        <button
          onClick={() => setShowPassword(!showPassword)}
          className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors text-gray-400 hover:text-white"
        >
          {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
        </button>
        
        <button
          onClick={() => handleCopy(entry.password, 'Password')}
          className={`p-2 rounded-lg transition-colors ${
            copiedField === 'Password' 
              ? 'bg-green-500/20 text-green-400' 
              : 'hover:bg-gray-700/50 text-gray-400 hover:text-white'
          }`}
        >
          <HiClipboardCopy className="w-5 h-5" />
        </button>
      </div>

      {/* URL */}
      {entry.url && (
        <div className="mt-3 flex items-center space-x-2 text-sm">
          <a
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyber-accent hover:underline flex items-center space-x-1"
          >
            <span>{truncate(entry.url, 40)}</span>
            <HiExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}

      {/* Notes */}
      {entry.notes && (
        <div className="mt-3 text-sm text-gray-400">
          {truncate(entry.notes, 100)}
        </div>
      )}

      {/* Actions and metadata */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          Updated {formatDate(entry.updated_at)}
        </span>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleCopy(entry.username, 'Username')}
            className="text-xs px-2 py-1 rounded bg-gray-700/50 hover:bg-gray-700 transition-colors"
          >
            Copy Username
          </button>
          
          <button
            onClick={() => onEdit(entry)}
            className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors text-gray-400 hover:text-cyber-accent"
          >
            <HiPencil className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onDelete(entry.id)}
            className="p-2 rounded-lg hover:bg-red-500/20 transition-colors text-gray-400 hover:text-red-400"
          >
            <HiTrash className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default VaultItem
