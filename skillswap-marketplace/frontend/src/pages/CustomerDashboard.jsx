import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, MessageSquare, Star, Clock, Search, Bot, CheckCircle2 } from 'lucide-react'
import { useUserBookings, useUserChats } from '../hooks/useApi'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/common/Avatar'
import AIAssistant from '../components/ai/AIAssistant'
import { formatDate, formatCurrency, MOCK_BOOKINGS_CUSTOMER } from '../utils/helpers'

export default function CustomerDashboard() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const myId = user?._id || user?.id
  const [activeTab, setActiveTab] = useState('upcoming')

  const { data: bookingsData, isLoading: loadingBookings } = useUserBookings()
  const { data: chatsData } = useUserChats()

  // Real API data or mock fallback
  const bookings = Array.isArray(bookingsData) && bookingsData.length
    ? bookingsData
    : (MOCK_BOOKINGS_CUSTOMER || [])

  const chats = Array.isArray(chatsData) ? chatsData : []

  // Normalise booking fields (backend uses timeSlot.date, frontend mock uses date)
  const normalise = (b) => ({
    ...b,
    providerName: b.providerName || b.providerId?.name || b.serviceId?.providerId?.name || 'Provider',
    service:      b.service      || b.serviceId?.title || 'Session',
    date:         b.date         || b.timeSlot?.date,
    time:         b.time         || b.timeSlot?.startTime,
    amount:       b.amount       || b.serviceId?.pricing?.amount || 0,
    providerId:   b.providerId?._id || b.providerId || '',
  })

  const normalised = bookings.map(normalise)
  const upcoming   = normalised.filter(b => ['pending','confirmed','upcoming'].includes(b.status))
  const past       = normalised.filter(b => ['completed'].includes(b.status))

  const TABS = [
    { id: 'upcoming', label: 'Upcoming', count: upcoming.length, icon: Calendar },
    { id: 'past',     label: 'Past',     count: past.length,     icon: CheckCircle2 },
    { id: 'messages', label: 'Messages', count: chats.length,    icon: MessageSquare },
    { id: 'ai',       label: 'AI Assistant', count: null,        icon: Bot },
  ]

  const openChat = (providerId) => {
    if (!myId || !providerId) { navigate('/messages'); return }
    const [a, b2] = [String(myId), String(providerId)].sort()
    navigate(`/messages?with=${providerId}`)
  }

  return (
    <div className="page-container py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-1">
                Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0] || 'there'}</span> 👋
              </h1>
              <p className="text-slate-400">Manage your bookings and connect with providers</p>
            </div>
            <Link to="/explore" className="btn-primary text-sm hidden sm:flex">
              <Search size={15} />Find Providers
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Upcoming Sessions', value: upcoming.length, icon: Calendar,      color: 'text-brand-400',   bg: 'bg-brand-500/10' },
            { label: 'Completed',         value: past.length,     icon: CheckCircle2,  color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Total Spent',       value: formatCurrency(past.reduce((s, b) => s + (b.amount || 0), 0)), icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { label: 'Conversations',     value: chats.length,    icon: MessageSquare, color: 'text-accent-400',  bg: 'bg-accent-500/10' },
          ].map((s) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon size={18} className={s.color} />
              </div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 glass-card p-1 mb-6 overflow-x-auto">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all flex-shrink-0 ${
                activeTab === tab.id ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              <tab.icon size={15} />
              {tab.label}
              {tab.count !== null && <span className="badge badge-brand text-xs px-2 py-0">{tab.count}</span>}
            </button>
          ))}
        </div>

        {/* Bookings */}
        {(activeTab === 'upcoming' || activeTab === 'past') && (
          <div className="space-y-4">
            {(activeTab === 'upcoming' ? upcoming : past).map((b, i) => (
              <motion.div key={b._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass-card p-5 flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row"
              >
                <div className="flex items-center gap-4">
                  <Avatar name={b.providerName} size="md" />
                  <div>
                    <h3 className="font-semibold text-white">{b.service}</h3>
                    <p className="text-sm text-slate-400">{b.providerName}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      {b.date && <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(b.date)}</span>}
                      {b.time && <span className="flex items-center gap-1"><Clock size={11} />{b.time}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-auto sm:ml-0">
                  <span className={`badge text-xs ${['upcoming','confirmed','pending'].includes(b.status) ? 'badge-brand' : 'badge-success'}`}>
                    {b.status}
                  </span>
                  <span className="font-bold text-white">{formatCurrency(b.amount)}</span>
                  {['upcoming','confirmed','pending'].includes(b.status) ? (
                    <button onClick={() => openChat(b.providerId)} className="btn-secondary text-xs py-1.5 px-3">
                      <MessageSquare size={12} />Chat
                    </button>
                  ) : (
                    <button className="btn-secondary text-xs py-1.5 px-3">
                      <Star size={12} />Review
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
            {(activeTab === 'upcoming' ? upcoming : past).length === 0 && (
              <div className="text-center py-16">
                <Calendar size={40} className="text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No {activeTab} bookings</p>
                <Link to="/explore" className="btn-primary mt-4 text-sm inline-flex">Find a Provider</Link>
              </div>
            )}
          </div>
        )}

        {/* Messages tab */}
        {activeTab === 'messages' && (
          <div className="space-y-3">
            {chats.length === 0 && (
              <div className="text-center py-16">
                <MessageSquare size={40} className="text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No conversations yet</p>
                <Link to="/messages" className="btn-primary mt-4 text-sm inline-flex">Start a Chat</Link>
              </div>
            )}
            {chats.map((chat) => {
              const partner = chat.lastMessage?.senderId
              const name    = partner?.name || 'User'
              const preview = chat.lastMessage?.content || ''
              return (
                <Link key={chat._id} to={`/messages/${chat._id}`}
                  className="glass-card p-4 flex items-center gap-4 hover:border-brand-500/20 transition-all block"
                >
                  <Avatar name={name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm">{name}</p>
                    <p className="text-xs text-slate-400 truncate">{preview}</p>
                  </div>
                  {chat.unread > 0 && (
                    <span className="w-5 h-5 bg-brand-500 rounded-full text-xs text-white flex items-center justify-center">{chat.unread}</span>
                  )}
                </Link>
              )
            })}
          </div>
        )}

        {activeTab === 'ai' && <AIAssistant />}
      </div>
    </div>
  )
}
