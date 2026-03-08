import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const { token, user } = useAuth()
  const socketRef  = useRef(null)
  const [connected,   setConnected]   = useState(false)
  const [onlineUsers, setOnlineUsers] = useState([])

  useEffect(() => {
    if (!token || !user) {
      socketRef.current?.disconnect()
      socketRef.current = null
      setConnected(false)
      return
    }

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

    const socket = io(SOCKET_URL, {
      auth:                { token },
      transports:          ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay:   1000,
    })

    socketRef.current = socket

    socket.on('connect',    () => { setConnected(true) })
    socket.on('disconnect', () => { setConnected(false) })
    socket.on('connect_error', (err) => {
      console.warn('[socket] connect error:', err.message)
      setConnected(false)
    })

    socket.on('user_online',  ({ userId }) =>
      setOnlineUsers(prev => [...new Set([...prev, userId])])
    )
    socket.on('user_offline', ({ userId }) =>
      setOnlineUsers(prev => prev.filter(id => id !== userId))
    )

    // ── In-app notification toasts ─────────────────────
    socket.on('new_message', ({ message }) => {
      const senderId = message?.senderId?._id || message?.senderId
      if (String(senderId) !== String(user?._id || user?.id)) {
        const name = message?.senderId?.name || 'Someone'
        toast(
          `💬 New message from ${name}`,
          { duration: 4000, style: { cursor: 'pointer' } }
        )
      }
    })

    socket.on('new_booking', ({ booking }) => {
      if (user?.role === 'provider') {
        toast.success('📅 New booking request received!', { duration: 5000 })
      }
    })

    socket.on('booking_update', ({ status }) => {
      if (status === 'confirmed') toast.success('✅ Your booking was confirmed!', { duration: 5000 })
      else if (status === 'cancelled') toast.error('❌ A booking was cancelled', { duration: 5000 })
    })

    socket.on('bookingConfirmed', ({ serviceTitle, customerName, amount, currency }) => {
  if (user?.role === 'provider') {
    toast.success(
      `💰 Payment received! ${customerName} booked "${serviceTitle}" — ${currency} ${amount}`,
      { duration: 8000 }
    )
  }
})

    return () => {
      socket.off('new_message')
      socket.off('new_booking')
      socket.off('booking_update')
      socket.off('user_online')
      socket.off('user_offline')
      socket.off('bookingConfirmed')
      socket.disconnect()
      socketRef.current = null
      setConnected(false)
    }
  }, [token, user])

  // ── Stable helpers (use socketRef — never go stale) ──
  const joinChat  = useCallback((chatId) =>
    socketRef.current?.emit('join_chat',  { chatId }), [])
  const leaveChat = useCallback((chatId) =>
    socketRef.current?.emit('leave_chat', { chatId }), [])

  const emitTyping = useCallback((chatId, receiverId, isTyping) => {
    if (!socketRef.current?.connected) return
    socketRef.current.emit(isTyping ? 'typing' : 'stop_typing', { chatId, receiverId })
  }, [])

  // Subscribe helpers — each returns a cleanup fn
  const onMessage = useCallback((cb) => {
    const s = socketRef.current
    if (!s) return () => {}
    s.on('new_message', cb)
    return () => s.off('new_message', cb)
  }, [])

  const onBookingUpdate = useCallback((cb) => {
    const s = socketRef.current
    if (!s) return () => {}
    s.on('new_booking',    cb)
    s.on('booking_update', cb)
    return () => {
      s.off('new_booking',    cb)
      s.off('booking_update', cb)
    }
  }, [])

  const onTyping = useCallback((cb) => {
    const s = socketRef.current
    if (!s) return () => {}
    s.on('user_typing',      cb)
    s.on('user_stop_typing', cb)
    return () => {
      s.off('user_typing',      cb)
      s.off('user_stop_typing', cb)
    }
  }, [])

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current,
      connected,
      onlineUsers,
      joinChat,
      leaveChat,
      emitTyping,
      onMessage,
      onTyping,
      onBookingUpdate,
    }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
