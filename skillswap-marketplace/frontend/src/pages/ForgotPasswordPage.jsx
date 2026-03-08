import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) { toast.error('Please enter your email'); return }
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch {
      // Always show success to prevent email enumeration
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  if (sent) return (
    <div className="glass-card p-8 text-center">
      <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-white mb-2">Check Your Email</h2>
      <p className="text-slate-400 text-sm mb-6">
        If an account exists for <strong className="text-white">{email}</strong>, you'll receive a password reset link shortly.
      </p>
      <Link to="/login" className="btn-primary inline-flex">Back to Sign In</Link>
    </div>
  )

  return (
    <div className="glass-card p-8">
      <Link to="/login" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-6">
        <ArrowLeft size={14} /> Back to Sign In
      </Link>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Reset Password</h1>
        <p className="text-slate-400 text-sm">Enter your email and we'll send you a reset link</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" className="input-field pl-9" required />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 disabled:opacity-50">
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
    </div>
  )
}
