import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Clock, ArrowLeft, CheckCircle2, CreditCard, User, AlertCircle, Lock } from 'lucide-react'
import { useProvider, useService, useCreateBooking } from '../hooks/useApi'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/common/Avatar'
import { MOCK_PROVIDERS, formatCurrency, formatDate, normalizeProvider } from '../utils/helpers'
import toast from 'react-hot-toast'
import PaymentButton from '../components/payment/PaymentButton'

const TIME_SLOTS = ['09:00','10:00','11:00','13:00','14:00','15:00','16:00','17:00']

const getNextDays = (count = 14) => {
  const days = []
  for (let i = 1; i <= count; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    days.push(d)
  }
  return days
}

const addOneHour = (time) => {
  const [h, m] = time.split(':').map(Number)
  const end = new Date()
  end.setHours(h + 1, m, 0, 0)
  return `${String(end.getHours()).padStart(2,'0')}:${String(end.getMinutes()).padStart(2,'0')}`
}

export default function BookingPage() {
  const { providerId } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  const [step, setStep]                 = useState(1)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [notes, setNotes]               = useState('')
  const [confirmed, setConfirmed]       = useState(false)

  const { mutateAsync: createBooking, isPending } = useCreateBooking()
  const { data: providerData } = useProvider(providerId)

  const rawProvider = providerData || MOCK_PROVIDERS.find(p => p._id === providerId) || MOCK_PROVIDERS[0]
  const provider    = normalizeProvider(rawProvider)
  const days        = getNextDays()

  // Find a real service ID — priority: provider's first service, then null (shows no-service warning)
  const services  = providerData?.services || rawProvider?.services || []
  const serviceId = services[0]?._id || null
  const isMock    = !providerData  // no real API data — only display, booking will be demo

 // REPLACE the existing handleConfirm and confirmed screen with this:

const [bookingResult, setBookingResult] = useState(null) // holds { _id, price } after booking

  const handleConfirm = async () => {
    if (!isAuthenticated) { navigate('/login'); return }

    if (!serviceId) {
      // Create a mock booking result so the Demo Payment Gateway UI is forced to show up
      setBookingResult({
        _id: 'mock_booking_id',
        price: { amount: provider.hourlyRate }
      })
      toast.success('Demo booking created. Complete payment to confirm.')
      return
    }

    try {
      const result = await createBooking({
        serviceId,
        timeSlot: {
          date:      selectedDate.toISOString(),
          startTime: selectedTime,
          endTime:   addOneHour(selectedTime),
        },
        notes,
      })
      // Booking created with status=pending — now open payment
      setBookingResult(result?.booking || result)
      toast.success('Booking created! Complete payment to confirm.')
    } catch (err) {
      toast.error(err?.message || 'Booking failed. Please try again.')
    }
  }

  // If a real booking was created and needs payment
  if (bookingResult) return (
    <div className="page-container flex items-center justify-center py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-10 text-center max-w-md w-full"
      >
        <div className="w-16 h-16 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center mx-auto mb-5">
          <CreditCard size={32} className="text-brand-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Complete Payment</h2>
        <p className="text-slate-400 mb-6">
          Booking created with <strong className="text-white">{provider.name}</strong>.
          Pay to confirm your session.
        </p>

        <div className="glass p-4 rounded-xl mb-6 text-sm text-slate-300 space-y-1 text-left">
          <p><strong>Date:</strong> {selectedDate ? formatDate(selectedDate) : '—'}</p>
          <p><strong>Time:</strong> {selectedTime} – {selectedTime ? addOneHour(selectedTime) : '—'}</p>
          <p><strong>Amount:</strong> {formatCurrency(provider.hourlyRate)}</p>
        </div>

        <PaymentButton
          bookingId={bookingResult._id}
          amount={bookingResult.price?.amount || provider.hourlyRate}
          currency="INR"
          providerName={provider.name}
          serviceName={services[0]?.title || 'Session'}
          onSuccess={() => {
            setTimeout(() => navigate('/dashboard'), 2000)
          }}
          onFailure={() => {}}
        />

        <p className="text-xs text-slate-500 mt-4 flex items-center justify-center gap-1">
          <Lock size={11} /> Secured by Razorpay
        </p>
      </motion.div>
    </div>
  )

  // If it was just a demo booking (no serviceId)
  if (confirmed) return (
    <div className="page-container flex items-center justify-center py-20">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-10 text-center max-w-md w-full">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
          className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5"
        >
          <CheckCircle2 size={40} className="text-emerald-400" />
        </motion.div>
        <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
        <p className="text-slate-400 mb-2">Your session with <strong className="text-white">{provider.name}</strong> is scheduled.</p>
        <div className="glass p-4 rounded-xl mb-6 text-sm text-slate-300 space-y-1">
          <p><strong>Date:</strong> {selectedDate ? formatDate(selectedDate) : '—'}</p>
          <p><strong>Time:</strong> {selectedTime} – {selectedTime ? addOneHour(selectedTime) : '—'}</p>
          <p><strong>Rate:</strong> {formatCurrency(provider.hourlyRate)}/hr</p>
        </div>
        <div className="flex gap-3">
          <Link to="/dashboard"  className="btn-primary flex-1 justify-center">View Dashboard</Link>
          <Link to="/explore"    className="btn-secondary flex-1 justify-center">Explore More</Link>
        </div>
      </motion.div>
    </div>
  )

  return (
    <div className="page-container py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to={`/providers/${providerId}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 text-sm">
          <ArrowLeft size={16} />Back to Profile
        </Link>

        {/* No-service warning */}
        {!serviceId && (
          <div className="glass-card border border-amber-500/30 p-4 mb-6 flex items-center gap-3 text-sm text-amber-400">
            <AlertCircle size={16} className="flex-shrink-0" />
            This provider hasn't published a service yet — booking will be a demo request.
          </div>
        )}

        {/* Progress */}
        <div className="flex items-center gap-3 mb-8">
          {['Select Date & Time','Confirm Booking'].map((label, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step > i + 1 ? 'bg-emerald-500 text-white' : step === i + 1 ? 'bg-brand-500 text-white' : 'bg-white/10 text-slate-500'
              }`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className={`text-sm hidden sm:block ${step === i + 1 ? 'text-white font-medium' : 'text-slate-500'}`}>{label}</span>
              {i < 1 && <div className="flex-1 h-px bg-white/10 mx-2" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6 space-y-6">
                <h2 className="text-lg font-bold flex items-center gap-2"><Calendar size={18} className="text-brand-400" />Choose Date</h2>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {days.map((d) => {
                    const isSelected = selectedDate?.toDateString() === d.toDateString()
                    return (
                      <button key={d.toISOString()} onClick={() => setSelectedDate(d)}
                        className={`flex flex-col items-center p-2 rounded-xl text-xs transition-all ${
                          isSelected
                            ? 'bg-brand-500 text-white border border-brand-400'
                            : 'glass hover:bg-white/10 text-slate-400 border border-white/5'
                        }`}
                      >
                        <span className="font-medium">{d.toLocaleDateString('en',{ weekday:'short' })}</span>
                        <span className="text-base font-bold mt-0.5 text-white">{d.getDate()}</span>
                      </button>
                    )
                  })}
                </div>

                <h2 className="text-lg font-bold flex items-center gap-2"><Clock size={18} className="text-brand-400" />Choose Time</h2>
                <div className="grid grid-cols-4 gap-2">
                  {TIME_SLOTS.map((t) => (
                    <button key={t} onClick={() => setSelectedTime(t)}
                      className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                        selectedTime === t
                          ? 'bg-brand-500 text-white border border-brand-400'
                          : 'glass hover:bg-white/10 text-slate-400 border border-white/5'
                      }`}
                    >{t}</button>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Notes (optional)</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                    className="input-field resize-none" rows={3}
                    placeholder="Any specific requirements or topics to cover..."
                  />
                </div>

                <button onClick={() => setStep(2)} disabled={!selectedDate || !selectedTime}
                  className="btn-primary w-full justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Confirmation
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6 space-y-5">
                <h2 className="text-lg font-bold">Confirm Your Booking</h2>
                <div className="space-y-3">
                  {[
                    { icon: User,       label: 'Provider', value: provider.name },
                    { icon: Calendar,   label: 'Date',     value: selectedDate ? formatDate(selectedDate) : '—' },
                    { icon: Clock,      label: 'Time',     value: selectedTime ? `${selectedTime} – ${addOneHour(selectedTime)}` : '—' },
                    { icon: CreditCard, label: 'Rate',     value: `${formatCurrency(provider.hourlyRate)}/hr` },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center justify-between py-3 border-b border-white/5">
                      <div className="flex items-center gap-2 text-slate-400 text-sm"><Icon size={15} />{label}</div>
                      <span className="font-medium text-white text-sm">{value}</span>
                    </div>
                  ))}
                </div>
                {notes && (
                  <div className="glass p-3 rounded-xl">
                    <p className="text-xs text-slate-500 mb-1">Notes</p>
                    <p className="text-sm text-slate-300">{notes}</p>
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-secondary flex-1 justify-center py-3">Back</button>
                  <button onClick={handleConfirm} disabled={isPending}
                    className="btn-primary flex-1 justify-center py-3 disabled:opacity-50">
                    {isPending ? 'Confirming...' : 'Confirm Booking'}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Summary sidebar */}
          <div className="lg:col-span-2">
            <div className="glass-card p-5 sticky top-20">
              <h3 className="text-sm font-semibold text-slate-400 mb-4">Booking Summary</h3>
              <div className="flex items-center gap-3 mb-4">
                <Avatar name={provider.name} size="lg" />
                <div>
                  <p className="font-semibold text-white">{provider.name}</p>
                  <p className="text-xs text-slate-400 capitalize">{provider.category}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Session (1hr)</span>
                  <span className="text-white font-medium">{formatCurrency(provider.hourlyRate)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Platform fee (5%)</span>
                  <span className="text-white font-medium">{formatCurrency(provider.hourlyRate * 0.05)}</span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-brand-400">{formatCurrency(provider.hourlyRate * 1.05)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
