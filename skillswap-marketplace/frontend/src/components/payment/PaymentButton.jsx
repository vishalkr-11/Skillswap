import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Lock, CheckCircle2 } from 'lucide-react'
import { paymentService } from '../../services/index'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import DemoPaymentModal from './DemoPaymentModal'

export default function PaymentButton({
  bookingId,
  amount,
  currency = 'INR',
  providerName = 'Provider',
  serviceName = 'Session',
  onSuccess,
  onFailure,
  disabled = false,
}) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [paid,    setPaid]    = useState(false)
  const [showDemoModal, setShowDemoModal] = useState(false)
  const [mockOrder, setMockOrder] = useState(null)
  const hasAttemptedRef = useRef(false)

  const handlePayment = async () => {
    if (!bookingId) { toast.error('No booking found'); return }

    setLoading(true)

    try {
      // ── MOCK PAYMENT FLOW ───────────────────────────────────────
      // 1. Create mock order on backend
      const res  = await paymentService.createOrder({ bookingId })
      const order = res?.order

      if (!order?.orderId) {
        toast.error('Could not create mock payment order. Please try again.')
        setLoading(false)
        return
      }

      // 2. Open the mock visual gateway
      setMockOrder(order)
      setLoading(false)
      setShowDemoModal(true)

    } catch (err) {
      toast.error(err?.message || 'Payment initiation failed')
      onFailure?.(err)
      setLoading(false)
    }
  }

  // Called when DemoPaymentModal finishes the "transaction"
  const handleDemoSuccess = async (mockResponse) => {
    setShowDemoModal(false)
    setLoading(true)
    try {
      // 3. Auto-verify the mock payment
      const verifyRes = await paymentService.verifyPayment({
        razorpayOrderId:   mockOrder.orderId,
        razorpayPaymentId: mockResponse.razorpay_payment_id,
        razorpaySignature: mockResponse.razorpay_signature,
      })
      
      setPaid(true)
      toast.success('🎉 Payment successful! Booking confirmed.')
      onSuccess?.(verifyRes)

    } catch (err) {
      toast.error(err?.message || 'Payment processing failed')
      onFailure?.(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDemoClose = () => {
    setShowDemoModal(false)
    toast('Payment cancelled', { icon: '⚠️' })
  }

  // Auto-redirect effect
  useEffect(() => {
    if (!paid && !disabled && !hasAttemptedRef.current) {
      hasAttemptedRef.current = true
      handlePayment()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (paid) return (
    <div className="flex items-center gap-2 px-6 py-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 font-medium text-sm">
      <CheckCircle2 size={18} />
      Payment Confirmed
    </div>
  )

  return (
    <>
      <motion.button
        onClick={handlePayment}
        disabled={disabled || loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="btn-primary py-3 px-6 justify-center disabled:opacity-50 disabled:cursor-not-allowed w-full"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
            />
            Opening Gateway...
          </span>
        ) : (
          <>
            <Lock size={15} />
            <CreditCard size={15} />
            Pay {currency} {Number(amount).toLocaleString()}
          </>
        )}
      </motion.button>
      
      <DemoPaymentModal 
        isOpen={showDemoModal}
        onClose={handleDemoClose}
        onSuccess={handleDemoSuccess}
        amount={amount}
        currency={currency}
        providerName={providerName}
      />
    </>
  )
}