import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Analyzer from './pages/Analyzer'
import Generator from './pages/Generator'
import BreachCheck from './pages/BreachCheck'
import Vault from './pages/Vault'
import Settings from './pages/Settings'

// Components
import Navbar from './components/Navbar'
import AnimatedBackground from './components/AnimatedBackground'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen relative">
          <AnimatedBackground />
          <Navbar />
          <main className="relative z-10">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/analyzer" element={<Analyzer />} />
              <Route path="/generator" element={<Generator />} />
              <Route path="/breach-check" element={<BreachCheck />} />
              <Route path="/vault" element={<Vault />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(10, 10, 26, 0.9)',
                color: '#fff',
                border: '1px solid rgba(0, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
