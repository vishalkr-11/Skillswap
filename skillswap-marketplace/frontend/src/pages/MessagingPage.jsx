import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Phone, Video, Search, MoreHorizontal,
  ArrowLeft, Circle, Plus, X, MessageSquare,
} from 'lucide-react'
import {
  useMessages, useSendMessage, useUserChats,
  buildChatId, useProviders,
} from '../hooks/useApi'
import { useSocket } from '../context/SocketContext'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/common/Avatar'
import { formatRelativeTime, MOCK_PROVIDERS } from '../utils/helpers'
import toast from 'react-hot-toast'

// ── Resolve chat partner from a chat-list entry ──────────────────────────
// Backend now returns `partner` = the OTHER participant. Fall back gracefully.
function resolvePartner(chat, myId) {
  if (!chat) return null

  // Best case: backend provided `partner` field directly
  if (chat.partner && chat.partner.name) return chat.partner

  // Derive from lastMessage fields
  const msg = chat.lastMessage
  if (!msg) return null

  const senderIdStr   = msg.senderId?._id?.toString()   || msg.senderId?.toString()
  const receiverIdStr = msg.receiverId?._id?.toString() || msg.receiverId?.toString()
  const myIdStr = String(myId)

  if (senderIdStr && senderIdStr !== myIdStr && msg.senderId?.name) return msg.senderId
  if (receiverIdStr && receiverIdStr !== myIdStr && msg.receiverId?.name) return msg.receiverId

  // Last resort: extract ID from chatId and return minimal object
  const otherId = chat._id?.split('_').find(id => id !== myIdStr)
  return otherId ? { _id: otherId, name: 'User', avatar: null } : null
}

export default function MessagingPage() {
  const { chatId: chatIdParam } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const withParam = searchParams.get('with')
  const { user } = useAuth()
  const myId    = user?._id || user?.id
  const myIdStr = String(myId || '')

  const {
    joinChat, leaveChat, onMessage, emitTyping, onTyping,
    connected, onlineUsers,
  } = useSocket() || {}

  // ── Core state ────────────────────────────────────────────
  const [selectedChatId,    setSelectedChatId]    = useState(null)
  const [selectedPartner,   setSelectedPartner]   = useState(null) // { _id, name, avatar }
  const [localMessages,     setLocalMessages]     = useState([])
  const [newMessage,        setNewMessage]        = useState('')
  const [partnerTyping,     setPartnerTyping]     = useState(false)
  const [showNewChat,       setShowNewChat]       = useState(false)
  const [providerSearch,    setProviderSearch]    = useState('')

  const typingTimeoutRef = useRef(null)   // useRef instead of useState — no re-render
  const messagesEndRef   = useRef(null)
  const inputRef         = useRef(null)

  // ── Data fetching ─────────────────────────────────────────
  const { data: chatList = [], refetch: refetchChats } = useUserChats()
  const { data: fetchedMessages = [], isLoading: msgsLoading } = useMessages(selectedChatId)
  const { data: providersData } = useProviders({ limit: 100 })

  const allProviders = providersData?.providers?.length
    ? providersData.providers
    : MOCK_PROVIDERS

  const filteredProviders = allProviders.filter(p =>
    p.name?.toLowerCase().includes(providerSearch.toLowerCase())
  )

  // ── Resolve initial chat from URL ─────────────────────────
 useEffect(() => {
  if (!myId) return
  if (chatIdParam) {
    setSelectedChatId(chatIdParam)
  } else if (withParam) {
    // Only proceed if withParam is a valid MongoDB ObjectId
    if (!/^[a-f\d]{24}$/i.test(withParam)) return
    const chatId = buildChatId(myId, withParam)
    setSelectedChatId(chatId)
    const fromProviders = allProviders.find(
      p => (p._id || p.id)?.toString() === withParam
    )
    if (fromProviders) setSelectedPartner({ _id: withParam, name: fromProviders.name, avatar: fromProviders.avatar })
  }
}, [chatIdParam, withParam, myId]) // eslint-disable-line
  // ── Sync fetched messages → local state ───────────────────
  useEffect(() => {
    if (fetchedMessages?.length) setLocalMessages(fetchedMessages)
    else if (!selectedChatId)    setLocalMessages([])
  }, [fetchedMessages, selectedChatId])

  // ── Auto-scroll to bottom ─────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [localMessages])

  // ── Socket: join / leave room ─────────────────────────────
  useEffect(() => {
    if (!selectedChatId) return
    joinChat?.(selectedChatId)
    return () => leaveChat?.(selectedChatId)
  }, [selectedChatId, joinChat, leaveChat])

  // ── Socket: receive real-time messages ────────────────────
  useEffect(() => {
    if (!onMessage) return
    return onMessage(({ message }) => {
      setLocalMessages(prev =>
        prev.some(m => m._id === message._id) ? prev : [...prev, message]
      )
      refetchChats()
    })
  }, [onMessage, refetchChats])

  // ── Socket: typing indicator ──────────────────────────────
  useEffect(() => {
    if (!onTyping) return
    return onTyping(({ chatId: cId }) => {
      if (cId !== selectedChatId) return
      setPartnerTyping(true)
      setTimeout(() => setPartnerTyping(false), 2500)
    })
  }, [onTyping, selectedChatId])

  const { mutateAsync: sendMsgApi } = useSendMessage()

  // ── Derive receiverId from chatId ─────────────────────────
  const getReceiverId = useCallback((chatId) => {
    if (!chatId || !myIdStr) return null
    return chatId.split('_').find(id => id !== myIdStr) || null
  }, [myIdStr])

  // ── Determine current chat partner ───────────────────────
  // Priority: 1) explicitly selected partner, 2) chat list entry partner field
  const currentChatEntry = chatList.find(c => c._id === selectedChatId)
  const chatPartner = selectedPartner
    || (currentChatEntry ? resolvePartner(currentChatEntry, myId) : null)

  const chatPartnerName   = chatPartner?.name   || 'Conversation'
  const chatPartnerAvatar = chatPartner?.avatar || null
  const partnerId         = chatPartner?._id?.toString() || getReceiverId(selectedChatId)
  const isPartnerOnline   = onlineUsers?.includes(partnerId)

  // ── Send message ──────────────────────────────────────────
  // ── Send message ──────────────────────────────────────────
const handleSend = useCallback(async (e) => {
  e?.preventDefault()
  const text = newMessage.trim()
  if (!text || !selectedChatId || !myId) return

  // Get receiverId from partner state first, fall back to chatId parsing
  const receiverId = (chatPartner?._id || '').toString() || getReceiverId(selectedChatId)
  if (!receiverId) { toast.error('Cannot identify recipient'); return }

  // Validate it's a real MongoDB ObjectId (24 hex chars) — mock IDs like "1","2" won't pass
  if (!/^[a-f\d]{24}$/i.test(receiverId)) {
    toast.error('This provider is a demo account and cannot receive messages. Sign in with a real provider account.')
    return
  }

  setNewMessage('')
  if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
  emitTyping?.(selectedChatId, receiverId, false)

  const tempId = `opt_${Date.now()}`
  setLocalMessages(prev => [...prev, {
    _id:       tempId,
    content:   text,
    senderId:  { _id: myId, name: user?.name },
    createdAt: new Date().toISOString(),
    optimistic: true,
  }])

  try {
    const saved = await sendMsgApi({ receiverId, content: text, _localSenderId: myId })
    setLocalMessages(prev => prev.map(m =>
      m._id === tempId ? (saved || { ...m, optimistic: false }) : m
    ))
    refetchChats()
  } catch (err) {
    setLocalMessages(prev => prev.filter(m => m._id !== tempId))
    toast.error(err?.message || 'Failed to send message')
  }
}, [newMessage, selectedChatId, myId, chatPartner, getReceiverId, sendMsgApi, emitTyping, user?.name, refetchChats])
  // ── Typing emit ───────────────────────────────────────────
 const handleInputChange = (e) => {
  setNewMessage(e.target.value)
  if (!selectedChatId) return
  const receiverId = (chatPartner?._id || '').toString() || getReceiverId(selectedChatId)
  if (!receiverId || !/^[a-f\d]{24}$/i.test(receiverId)) return
  if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
  emitTyping?.(selectedChatId, receiverId, true)
  typingTimeoutRef.current = setTimeout(() => {
    emitTyping?.(selectedChatId, receiverId, false)
  }, 1500)
}
  // ── Start a new chat ──────────────────────────────────────
 const startChat = (provider) => {
  if (!myId) return
  const theirId = (provider._id || provider.id || '').toString()
  if (String(theirId) === myIdStr) { toast.error("You can't message yourself"); return }

  // Block mock providers — they have short IDs like "1","2","3"
  if (!/^[a-f\d]{24}$/i.test(theirId)) {
    toast.error('Demo providers cannot receive messages. Seed the database and log in with a real account.')
    return
  }

  const chatId = buildChatId(myId, theirId)
  setSelectedChatId(chatId)
  setSelectedPartner({ _id: theirId, name: provider.name, avatar: provider.avatar })
  setLocalMessages([])
  setShowNewChat(false)
  setProviderSearch('')
  setTimeout(() => inputRef.current?.focus(), 100)
}

  // Select from chat list
  const selectChat = (chat) => {
    setSelectedChatId(chat._id)
    const partner = resolvePartner(chat, myId)
    setSelectedPartner(partner)
    setLocalMessages([])
  }

  // ── Message bubble ────────────────────────────────────────
  const renderMessage = (msg) => {
    const senderIdStr = msg.senderId?._id?.toString() || msg.senderId?.toString()
    const isMe = senderIdStr === myIdStr

    return (
      <motion.div key={msg._id}
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
      >
        {!isMe && (
          <Avatar name={chatPartnerName} src={chatPartnerAvatar} size="xs" />
        )}
        <div className={`max-w-xs sm:max-w-sm lg:max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
          <div className={`px-4 py-2.5 rounded-2xl ${
            isMe
              ? 'chat-bubble-user rounded-br-sm'
              : 'chat-bubble-other rounded-bl-sm'
          } ${msg.optimistic ? 'opacity-60' : ''}`}>
            <p className="text-sm text-white leading-relaxed">{msg.content || msg.text}</p>
          </div>
          <span className={`text-xs px-1 ${isMe ? 'text-slate-500' : 'text-slate-600'}`}>
            {formatRelativeTime(msg.createdAt)}
            {msg.optimistic && ' · sending...'}
          </span>
        </div>
      </motion.div>
    )
  }

  // ── Chat list sidebar entry ───────────────────────────────
  const renderChatEntry = (chat) => {
    const partner  = resolvePartner(chat, myId)
    const name     = partner?.name    || 'User'
    const avatar   = partner?.avatar  || null
    const preview  = chat.lastMessage?.content || ''
    const online   = onlineUsers?.includes(partner?._id?.toString())
    const isActive = selectedChatId === chat._id

    return (
      <button key={chat._id}
        onClick={() => selectChat(chat)}
        className={`w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-all text-left ${
          isActive ? 'bg-brand-500/10 border-l-2 border-brand-500' : ''
        }`}
      >
        <Avatar name={name} src={avatar} size="md" online={online} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-white text-sm truncate">{name}</p>
          <p className="text-xs text-slate-400 truncate mt-0.5">{preview}</p>
        </div>
        {chat.unread > 0 && (
          <span className="w-5 h-5 bg-brand-500 rounded-full text-xs text-white flex items-center justify-center flex-shrink-0 flex-shrink-0">
            {chat.unread}
          </span>
        )}
      </button>
    )
  }

  return (
    <div className="page-container" style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      <div className="flex-1 flex max-w-7xl mx-auto w-full px-0 sm:px-4 sm:py-4 gap-0 sm:gap-4 overflow-hidden" style={{ minHeight: 0 }}>

        {/* ── Sidebar ─────────────────────────────────────────── */}
        <div className={`${selectedChatId ? 'hidden sm:flex' : 'flex'} flex-col w-full sm:w-80 glass-card sm:rounded-2xl overflow-hidden flex-shrink-0`}>
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-white">Messages</h2>
              <button
                onClick={() => setShowNewChat(true)}
                className="w-8 h-8 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 hover:bg-brand-500/30 transition-all"
                title="New conversation"
              >
                <Plus size={15} />
              </button>
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input className="input-field pl-8 py-2 text-sm" placeholder="Search conversations..." />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {chatList.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-3">
                <div className="text-3xl">💬</div>
                <p className="text-slate-400 text-sm font-medium">No conversations yet</p>
                <p className="text-slate-500 text-xs">Explore providers and start a chat</p>
                <button
                  onClick={() => setShowNewChat(true)}
                  className="text-xs px-4 py-2 bg-brand-500/20 text-brand-400 border border-brand-500/30 rounded-xl hover:bg-brand-500/30 transition-all"
                >
                  + New Conversation
                </button>
              </div>
            ) : (
              chatList.map(renderChatEntry)
            )}
          </div>
        </div>

        {/* ── Chat area ────────────────────────────────────────── */}
        {selectedChatId ? (
          <div className="flex-1 flex flex-col glass-card sm:rounded-2xl overflow-hidden min-w-0">

            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center gap-3">
              <button
                onClick={() => { setSelectedChatId(null); setSelectedPartner(null) }}
                className="sm:hidden p-2 text-slate-400 hover:text-white"
              >
                <ArrowLeft size={18} />
              </button>
              <Avatar name={chatPartnerName} src={chatPartnerAvatar} size="sm" online={isPartnerOnline} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm truncate">{chatPartnerName}</p>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  {isPartnerOnline
                    ? <><Circle size={8} className="fill-emerald-400 text-emerald-400 flex-shrink-0" />Online</>
                    : 'Offline'}
                  {!connected && <span className="text-amber-400 ml-1">(connecting...)</span>}
                </p>
              </div>
              <div className="flex gap-1">
                <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all" title="Voice call (coming soon)"><Phone size={16} /></button>
                <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all" title="Video call (coming soon)"><Video size={16} /></button>
                <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"><MoreHorizontal size={16} /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {msgsLoading && (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-brand-400/30 border-t-brand-400 rounded-full animate-spin" />
                </div>
              )}
              {!msgsLoading && localMessages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-4xl mb-3">👋</div>
                    <p className="text-white font-medium mb-1">Start a conversation with {chatPartnerName}</p>
                    <p className="text-slate-500 text-sm">Messages are end-to-end encrypted</p>
                  </div>
                </div>
              )}
              {localMessages.map(renderMessage)}
              {partnerTyping && (
                <div className="flex items-end gap-2 justify-start">
                  <Avatar name={chatPartnerName} src={chatPartnerAvatar} size="xs" />
                  <div className="chat-bubble-other px-4 py-3 rounded-2xl rounded-bl-sm">
                    <div className="typing-indicator flex gap-1 items-center">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-white/5 flex items-center gap-2">
              <input
                ref={inputRef}
                value={newMessage}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
                }}
                placeholder={`Message ${chatPartnerName}...`}
                className="input-field flex-1 py-3"
              />
              <motion.button
                type="submit"
                disabled={!newMessage.trim()}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="btn-primary p-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Send size={17} />
              </motion.button>
            </form>
          </div>
        ) : (
          /* Empty state — desktop only */
          <div className="hidden sm:flex flex-1 glass-card rounded-2xl items-center justify-center">
            <div className="text-center">
              <MessageSquare size={48} className="text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg font-medium mb-2">Select a conversation</p>
              <p className="text-slate-500 text-sm mb-5">Choose from your chats or start a new one</p>
              <button onClick={() => setShowNewChat(true)} className="btn-primary text-sm">
                <Plus size={15} /> New Conversation
              </button>
            </div>
          </div>
        )}

        {/* ── New Conversation Modal ───────────────────────────── */}
        <AnimatePresence>
          {showNewChat && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowNewChat(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-card w-full max-w-md rounded-2xl overflow-hidden"
              >
                <div className="p-5 border-b border-white/5 flex items-center justify-between">
                  <h3 className="font-bold text-white">New Conversation</h3>
                  <button onClick={() => setShowNewChat(false)} className="text-slate-400 hover:text-white transition-colors">
                    <X size={18} />
                  </button>
                </div>
                <div className="p-4">
                  <div className="relative mb-3">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      autoFocus
                      value={providerSearch}
                      onChange={(e) => setProviderSearch(e.target.value)}
                      placeholder="Search providers..."
                      className="input-field pl-8 py-2 text-sm w-full"
                    />
                  </div>
                  <div className="space-y-1 max-h-72 overflow-y-auto">
                    {filteredProviders.length === 0 ? (
                      <p className="text-slate-500 text-sm text-center py-6">No providers found</p>
                    ) : (
                      filteredProviders.map((p) => {
                        const pid = p._id || p.id
                        const isSelf = String(pid) === myIdStr
                        if (isSelf) return null
                        return (
                          <button key={pid}
                            onClick={() => startChat(p)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all text-left"
                          >
                            <Avatar name={p.name} src={p.avatar} size="sm" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">{p.name}</p>
                              <p className="text-xs text-slate-500 capitalize">{p.category || p.skillsOffered?.[0] || 'Provider'}</p>
                            </div>
                            <span className="text-xs text-brand-400 flex-shrink-0">Message →</span>
                          </button>
                        )
                      })
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
