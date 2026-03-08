import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CreditCard, Lock, X, CheckCircle2, ShieldCheck } from 'lucide-react'

export default function DemoPaymentModal({
  isOpen,
  onClose,
  onSuccess,
  amount,
  currency = 'INR',
  providerName,
}) {
  const [step, setStep] = useState('input') // 'input' | 'processing' | 'success'
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')

  if (!isOpen) return null

  const handlePay = (e) => {
    e.preventDefault()
    setStep('processing')
    
    // Simulate payment processing time
    setTimeout(() => {
      setStep('success')
      // Wait a moment on the success screen before closing and notifying parent
      setTimeout(() => {
        onSuccess({
          razorpay_payment_id: `demo_pay_${Date.now()}`,
          razorpay_signature: 'demo_signature',
        })
        setStep('input') // reset for next time
      }, 1500)
    }, 2000)
  }

  // Auto-format card number
  const handleCardInput = (e) => {
    let val = e.target.value.replace(/\D/g, '')
    if (val.length > 16) val = val.slice(0, 16)
    const formatted = val.match(/.{1,4}/g)?.join(' ') || val
    setCardNumber(formatted)
  }

  // Auto-format expiry
  const handleExpiryInput = (e) => {
    let val = e.target.value.replace(/\D/g, '')
    if (val.length > 4) val = val.slice(0, 4)
    if (val.length >= 2) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`
    }
    setExpiry(val)
  }

  // Auto-format CVV
  const handleCvvInput = (e) => {
    let val = e.target.value.replace(/\D/g, '')
    if (val.length > 3) val = val.slice(0, 3)
    setCvv(val)
  }

  const isFormValid = cardNumber.length >= 19 && expiry.length === 5 && cvv.length === 3

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <ShieldCheck size={18} className="text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold flex items-center gap-2">
                  Demo Gateway <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">Test Mode</span>
                </h3>
              </div>
            </div>
            {step === 'input' && (
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors">
                <X size={20} />
              </button>
            )}
          </div>

          <div className="p-6">
            {step === 'input' && (
              <form onSubmit={handlePay} className="space-y-6">
                {/* Order Summary */}
                <div className="bg-slate-800/50 rounded-xl p-4 flex items-center justify-between border border-slate-700">
                  <div className="text-sm">
                    <p className="text-slate-400">Paying</p>
                    <p className="text-white font-medium">{providerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white tracking-tight">
                      {currency === 'INR' ? '₹' : currency}{Number(amount).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Card Flow Demo UI */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Card Number</label>
                    <div className="relative">
                      <CreditCard size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        value={cardNumber}
                        onChange={handleCardInput}
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Valid Thru</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={handleExpiryInput}
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono text-sm text-center"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">CVV</label>
                      <input
                        type="password"
                        placeholder="123"
                        value={cvv}
                        onChange={handleCvvInput}
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono text-sm text-center tracking-widest"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!isFormValid}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(37,99,235,0.2)]"
                  >
                    <Lock size={16} /> Pay {currency === 'INR' ? '₹' : currency}{Number(amount).toLocaleString()}
                  </button>
                  <p className="text-center text-[11px] text-slate-500 mt-3 font-medium">
                    This is a Demo Gateway. Use any 16-digit number.
                  </p>
                </div>
              </form>
            )}

            {step === 'processing' && (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  className="w-12 h-12 border-4 border-slate-800 border-t-blue-500 rounded-full"
                />
                <div>
                  <h3 className="text-white font-medium text-lg">Processing Payment</h3>
                  <p className="text-slate-400 text-sm mt-1">Please do not close this window</p>
                </div>
              </div>
            )}

            {step === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10 flex flex-col items-center justify-center text-center space-y-4"
              >
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl">Payment Successful</h3>
                  <p className="text-slate-400 text-sm mt-1">Redirecting back to app...</p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
