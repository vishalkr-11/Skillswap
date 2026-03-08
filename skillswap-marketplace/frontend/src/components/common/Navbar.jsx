import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Bell, MessageSquare, ChevronDown, LogOut, User, LayoutDashboard, Zap } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useScrollPosition } from '../../hooks/useUtils'
import { getInitials, generateAvatarColor } from '../../utils/helpers'

export default function Navbar() {
  const { user, isAuthenticated, logout, isProvider } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const scrollY = useScrollPosition()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const scrolled = scrollY > 20
  const isLanding = location.pathname === '/'

  const navLinks = [
    { to: '/explore', label: 'Explore' },
    { to: '/explore?category=coding', label: 'Coding' },
    { to: '/explore?category=design', label: 'Design' },
    { to: '/explore?category=tutoring', label: 'Tutoring' },
  ]

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || !isLanding
          ? 'glass-dark shadow-card border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center shadow-brand group-hover:shadow-lg transition-all">
              <Zap size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-gradient hidden sm:block">SkillSwap</span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                  location.pathname === l.to
                    ? 'text-brand-400 bg-brand-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link to="/messages" className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg transition-all">
                  <MessageSquare size={19} />
                </Link>
                <button className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg transition-all">
                  <Bell size={19} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-400 rounded-full" />
                </button>
                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-white/5 transition-all"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-slate-900"
                      style={{ background: generateAvatarColor(user?.name) }}
                    >
                      {getInitials(user?.name)}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-slate-300">{user?.name?.split(' ')[0]}</span>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-52 glass-card overflow-hidden z-50"
                        onMouseLeave={() => setDropdownOpen(false)}
                      >
                        <div className="px-4 py-3 border-b border-white/5">
                          <p className="text-sm font-semibold text-white">{user?.name}</p>
                          <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                        </div>
                        <div className="py-1">
                          <Link
                            to={isProvider ? '/provider-dashboard' : '/dashboard'}
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <LayoutDashboard size={15} />
                            Dashboard
                          </Link>
                          <Link
                            to="/messages"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <MessageSquare size={15} />
                            Messages
                          </Link>
                          <button
                            onClick={() => { logout(); navigate('/'); setDropdownOpen(false) }}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                          >
                            <LogOut size={15} />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm py-2 px-4 hidden sm:flex">Sign In</Link>
                <Link to="/signup" className="btn-primary text-sm py-2 px-4">Get Started</Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-dark border-t border-white/5"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                  {l.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <div className="pt-3 border-t border-white/5 flex gap-2">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 btn-secondary text-sm text-center justify-center">Sign In</Link>
                  <Link to="/signup" onClick={() => setMobileOpen(false)} className="flex-1 btn-primary text-sm text-center justify-center">Sign Up</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
