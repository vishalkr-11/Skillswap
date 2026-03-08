import { useState, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail, User, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const SUGGESTED_SKILLS = ['React','Node.js','Python','Design','Figma','Tutoring','Math','Guitar','Yoga','Spanish']

export default function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [role,      setRole]     = useState(params.get('role') || 'customer')
  const [form,      setForm]     = useState({ name: '', email: '', password: '' })
  const [skills,    setSkills]   = useState([])
  const [skillInput,setSkillInput]= useState('')
  const [showPass,  setShowPass] = useState(false)
  const [loading,   setLoading] = useState(false)
  const skillRef = useRef(null)

  const update = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }))

  const addSkill = (skill) => {
    const s = skill.trim()
    if (s && !skills.includes(s) && skills.length < 10) {
      setSkills(prev => [...prev, s])
    }
    setSkillInput('')
  }

  const removeSkill = (s) => setSkills(prev => prev.filter(x => x !== s))

  const handleSkillKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
      e.preventDefault()
      addSkill(skillInput)
    } else if (e.key === 'Backspace' && !skillInput && skills.length > 0) {
      setSkills(prev => prev.slice(0, -1))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      toast.error('All fields are required'); return
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters'); return
    }
    if (role === 'provider' && skills.length === 0) {
      toast.error('Please add at least one skill'); return
    }
    setLoading(true)
    try {
      await signup({ ...form, role, skillsOffered: skills })
      toast.success('Account created! Welcome to SkillSwap 🎉')
      navigate(role === 'provider' ? '/provider-dashboard' : '/dashboard')
    } catch (err) {
      toast.error(err?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card p-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Create Account</h1>
        <p className="text-slate-400 text-sm">Join thousands of skill exchangers</p>
      </div>

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
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
          <div className="relative">
            <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={form.name} onChange={update('name')} placeholder="Your full name"
              className="input-field pl-9" required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="email" value={form.email} onChange={update('email')}
              placeholder="you@example.com" className="input-field pl-9" required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type={showPass ? 'text' : 'password'} value={form.password} onChange={update('password')}
              placeholder="At least 8 characters" className="input-field pl-9 pr-10" required minLength={8} />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* Skills tag input — providers only */}
        {role === 'provider' && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Your Skills <span className="text-slate-500 font-normal">(type and press Enter)</span>
            </label>
            <div
              className="input-field min-h-[48px] flex flex-wrap gap-1.5 items-center cursor-text p-2"
              onClick={() => skillRef.current?.focus()}
            >
              {skills.map(s => (
                <span key={s} className="badge badge-brand text-xs flex items-center gap-1 py-1">
                  {s}
                  <button type="button" onClick={() => removeSkill(s)} className="hover:text-white">
                    <X size={10} />
                  </button>
                </span>
              ))}
              <input
                ref={skillRef}
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                placeholder={skills.length === 0 ? 'e.g. React, Design, Guitar...' : ''}
                className="bg-transparent outline-none text-sm text-white placeholder-slate-500 min-w-24 flex-1"
              />
            </div>
            {/* Suggested skill chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {SUGGESTED_SKILLS.filter(s => !skills.includes(s)).slice(0, 6).map(s => (
                <button key={s} type="button" onClick={() => addSkill(s)}
                  className="text-xs px-2.5 py-1 bg-white/5 text-slate-400 border border-white/10 rounded-full hover:border-brand-500/40 hover:text-brand-400 transition-all">
                  + {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <button type="submit" disabled={loading}
          className="btn-primary w-full justify-center py-3 disabled:opacity-50">
          {loading ? (
            <span className="flex items-center gap-2">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
              Creating account...
            </span>
          ) : `Join as ${role === 'provider' ? 'Provider' : 'Customer'}`}
        </button>
      </form>

      <div className="mt-5 pt-5 border-t border-white/5 text-center">
        <p className="text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
