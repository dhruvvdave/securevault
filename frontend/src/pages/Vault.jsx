import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  HiPlus, 
  HiSearch, 
  HiFilter,
  HiX,
  HiRefresh
} from 'react-icons/hi'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import api from '../utils/api'
import VaultItem from '../components/VaultItem'
import PasswordGenerator from '../components/PasswordGenerator'

function Vault() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [showGenerator, setShowGenerator] = useState(false)

  const categories = ['general', 'social', 'work', 'finance', 'shopping', 'gaming']

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    fetchEntries()
  }, [isAuthenticated])

  const fetchEntries = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (categoryFilter) params.append('category', categoryFilter)
      
      const response = await api.get(`/vault?${params}`)
      setEntries(response.data.entries)
    } catch (error) {
      toast.error('Failed to load vault entries')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (!loading) fetchEntries()
    }, 300)
    return () => clearTimeout(debounce)
  }, [search, categoryFilter])

  const handleAdd = () => {
    setEditingEntry(null)
    setShowModal(true)
  }

  const handleEdit = (entry) => {
    setEditingEntry(entry)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this entry?')) return

    try {
      await api.delete(`/vault/${id}`)
      setEntries(entries.filter(e => e.id !== id))
      toast.success('Entry deleted')
    } catch (error) {
      toast.error('Failed to delete entry')
    }
  }

  const handleSave = async (formData) => {
    try {
      if (editingEntry) {
        const response = await api.put(`/vault/${editingEntry.id}`, formData)
        setEntries(entries.map(e => e.id === editingEntry.id ? response.data.entry : e))
        toast.success('Entry updated')
      } else {
        const response = await api.post('/vault', formData)
        setEntries([response.data.entry, ...entries])
        toast.success('Entry created')
      }
      setShowModal(false)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save entry')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyber-accent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold">
              Password <span className="gradient-text">Vault</span>
            </h1>
            <p className="text-gray-400 mt-1">{entries.length} entries stored securely</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAdd}
            className="px-4 py-2 bg-gradient-to-r from-cyber-accent to-cyber-purple text-black font-medium rounded-lg flex items-center space-x-2"
          >
            <HiPlus className="w-5 h-5" />
            <span>Add Entry</span>
          </motion.button>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-4 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search entries..."
                className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-cyber-accent transition-colors"
              />
            </div>
            <div className="relative">
              <HiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="pl-12 pr-8 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-cyber-accent transition-colors appearance-none cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Entries List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {entries.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-800/50 flex items-center justify-center">
                  <HiSearch className="w-10 h-10 text-gray-600" />
                </div>
                <h3 className="text-xl font-medium text-gray-400">No entries found</h3>
                <p className="text-gray-500 mt-2">Add your first password to get started</p>
              </motion.div>
            ) : (
              entries.map(entry => (
                <VaultItem
                  key={entry.id}
                  entry={entry}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {showModal && (
            <EntryModal
              entry={editingEntry}
              categories={categories}
              onSave={handleSave}
              onClose={() => setShowModal(false)}
              showGenerator={showGenerator}
              setShowGenerator={setShowGenerator}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function EntryModal({ entry, categories, onSave, onClose, showGenerator, setShowGenerator }) {
  const [formData, setFormData] = useState({
    title: entry?.title || '',
    username: entry?.username || '',
    password: entry?.password || '',
    url: entry?.url || '',
    notes: entry?.notes || '',
    category: entry?.category || 'general',
    favorite: entry?.favorite || false
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            {entry ? 'Edit Entry' : 'Add New Entry'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {showGenerator ? (
          <div>
            <button
              onClick={() => setShowGenerator(false)}
              className="text-sm text-gray-400 hover:text-white mb-4"
            >
              ← Back to form
            </button>
            <PasswordGenerator
              onGenerate={(password) => {
                setFormData(prev => ({ ...prev, password }))
                setShowGenerator(false)
              }}
            />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g., Google Account"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-cyber-accent transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Username/Email</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="username or email"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-cyber-accent transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-gray-400">Password *</label>
                <button
                  type="button"
                  onClick={() => setShowGenerator(true)}
                  className="text-sm text-cyber-accent hover:underline flex items-center space-x-1"
                >
                  <HiRefresh className="w-4 h-4" />
                  <span>Generate</span>
                </button>
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-cyber-accent transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">URL</label>
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                placeholder="https://example.com"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-cyber-accent transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-cyber-accent transition-colors"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Additional notes..."
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-cyber-accent transition-colors resize-none"
              />
            </div>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="favorite"
                checked={formData.favorite}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-cyber-accent focus:ring-cyber-accent focus:ring-offset-0"
              />
              <span className="text-sm text-gray-300">Mark as favorite</span>
            </label>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-cyber-accent to-cyber-purple text-black font-medium rounded-lg"
              >
                {entry ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  )
}

export default Vault
