import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, Sparkles, RefreshCw, X, MessageCircle } from 'lucide-react'
import { aiService } from '../../services/index'
import { MOCK_PROVIDERS, CATEGORIES } from '../../utils/helpers'

const SUGGESTED = [
  'Find me a React developer',
  'Who are the best tutors?',
  'I need a yoga instructor',
  'Compare design vs coding providers',
]

const WELCOME = "Hi! I'm your SkillSwap AI assistant. I can help you find the perfect provider, compare options, or answer any questions. What are you looking for? 🚀"

// ── Render message content with basic markdown ────────
function MessageContent({ text }) {
  if (!text) return null
  return (
    <div className="text-sm leading-relaxed space-y-1">
      {text.split('\n').map((line, i) => {
        if (!line.trim()) return <br key={i} />
        // Bold: **text**
        const parts = line.split(/\*\*(.*?)\*\*/g)
        return (
          <p key={i}>
            {parts.map((part, j) =>
              j % 2 === 1 ? <strong key={j} className="text-white font-semibold">{part}</strong> : part
            )}
          </p>
        )
      })}
    </div>
  )
}

export default function AIAssistant({ floating = false, onClose }) {
  const [messages, setMessages] = useState([{ role: 'assistant', content: WELCOME }])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const addMsg = (role, content) =>
    setMessages(prev => [...prev, { role, content }])

  const buildStaticReply = (query) => {
    const q = query.toLowerCase()
    const matched = MOCK_PROVIDERS.filter(p =>
      p.skills?.some(s => s.toLowerCase().includes(q)) ||
      p.category?.toLowerCase().includes(q) ||
      q.includes(p.category?.toLowerCase())
    )
    const list = (matched.length ? matched : MOCK_PROVIDERS).slice(0, 3)
    return (
      `Here are some great options for "${query}":\n\n` +
      list.map((p, i) =>
        `${i + 1}. **${p.name}** — ${p.skills?.slice(0, 3).join(', ')}\n` +
        `   ⭐ ${p.rating}/5 · $${p.hourlyRate}/hr · ${p.location}`
      ).join('\n\n') +
      '\n\nWould you like more details about any of these providers?'
    )
  }

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return
    const userMsg = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      // ── Primary: backend /api/ai/recommend ───────────
      const result = await aiService.recommend({ requirement: text })
      const recs   = result?.recommendations || []
      let reply    = result?.summary || ''

      if (recs.length > 0) {
        if (reply) reply += '\n\n'
        reply += recs.slice(0, 3).map((r, i) =>
          `${i + 1}. **${r.title}** by ${r.provider}\n` +
          `   ⭐ ${r.rating} · ${r.price} · Match: ${r.matchScore}%\n` +
          `   ${r.reasoning}`
        ).join('\n\n')
      } else if (!reply) {
        // Backend returned empty recommendations — use static fallback
        reply = buildStaticReply(text)
      }

      addMsg('assistant', reply)
    } catch {
      // ── Static fallback — never show generic error message ──
      addMsg('assistant', buildStaticReply(text))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => { e?.preventDefault(); sendMessage(input) }
  const reset = () => setMessages([{ role: 'assistant', content: WELCOME }])

  const containerClass = floating
    ? 'fixed bottom-20 right-4 sm:right-6 w-full max-w-sm sm:max-w-md z-50 glass-card shadow-card overflow-hidden'
    : 'glass-card overflow-hidden'

  return (
    <div className={containerClass} style={{ height: floating ? '500px' : '600px', display: 'flex', flexDirection: 'column' }}>
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-brand-500/10 to-accent-500/10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center shadow-brand">
            <Sparkles size={17} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">AI Assistant</h3>
            <p className="text-xs text-slate-400">Powered by Gemini</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={reset} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all" title="Reset conversation">
            <RefreshCw size={15} />
          </button>
          {onClose && (
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot size={14} className="text-white" />
                </div>
              )}
              <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl ${
                msg.role === 'user' ? 'chat-bubble-user text-white' : 'glass text-slate-200 border border-white/5'
              }`}>
                <MessageContent text={msg.content} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5 justify-start">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center flex-shrink-0">
              <Bot size={14} className="text-white" />
            </div>
            <div className="glass border border-white/5 px-4 py-3 rounded-2xl">
              <div className="typing-indicator flex gap-1"><span /><span /><span /></div>
            </div>
          </motion.div>
        )}

        {messages.length === 1 && !loading && (
          <div className="grid grid-cols-1 gap-2 mt-2">
            {SUGGESTED.map((s) => (
              <button key={s} onClick={() => sendMessage(s)}
                className="text-left text-xs px-3 py-2 glass rounded-xl text-slate-400 hover:text-white hover:border-brand-500/30 border border-white/5 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-white/5 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          className="input-field flex-1 py-2.5 text-sm"
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit(e)}
        />
        <motion.button type="submit" disabled={!input.trim() || loading}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="btn-primary p-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
        >
          <Send size={16} />
        </motion.button>
      </form>
    </div>
  )
}

// ── Floating button ────────────────────────────────────
export function FloatingAIButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
          >
            <AIAssistant floating onClose={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-4 sm:right-6 z-40 w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center shadow-brand"
        title="AI Assistant"
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}><X size={22} className="text-white" /></motion.div>
            : <motion.div key="ai" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}><MessageCircle size={22} className="text-white" /></motion.div>
          }
        </AnimatePresence>
      </motion.button>
    </>
  )
}
