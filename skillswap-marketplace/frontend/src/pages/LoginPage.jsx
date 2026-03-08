import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [role, setRole]       = useState('customer')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) { toast.error('Please fill in all fields'); return }
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Welcome back!')
      // Role comes from the JWT/user object returned by backend
      const storedUser = JSON.parse(localStorage.getItem('skillswap_user') || '{}')
      navigate(storedUser.role === 'provider' ? '/provider-dashboard' : '/dashboard')
    } catch (err) {
      toast.error(err?.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card p-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Welcome Back</h1>
        <p className="text-slate-400 text-sm">Sign in to your SkillSwap account</p>
      </div>

      {/* Role indicator (informational only — role comes from backend) */}
      <div className="flex gap-1 glass p-1 rounded-xl mb-6">
        {['customer', 'provider'].map((r) => (
          <button key={r} onClick={() => setRole(r)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              role === r ? 'bg-brand-500 text-white shadow-brand' : 'text-slate-400 hover:text-white'
            }`}
          >
            {r === 'customer' ? '👤 Customer' : '⚡ Provider'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" className="input-field pl-9" required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" className="input-field pl-9 pr-10" required />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs text-brand-400 hover:text-brand-300">Forgot password?</Link>
        </div>
        <button type="submit" disabled={loading}
          className="btn-primary w-full justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? (
            <span className="flex items-center gap-2">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
              Signing in...
            </span>
          ) : 'Sign In'}
        </button>
      </form>

      <div className="mt-5 pt-5 border-t border-white/5 text-center">
        <p className="text-sm text-slate-400">
          Don't have an account?{' '}
          <Link to="/signup" className="text-brand-400 hover:text-brand-300 font-medium">Sign up free</Link>
        </p>
      </div>
    </div>
  )
}
