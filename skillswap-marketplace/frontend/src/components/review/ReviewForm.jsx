import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Star } from 'lucide-react'
import { useCreateReview } from '../../hooks/useApi'
import StarRating from '../common/StarRating'
import toast from 'react-hot-toast'

export default function ReviewForm({ providerId, bookingId, onSuccess }) {
  const [rating,    setRating]    = useState(0)
  const [comment,   setComment]   = useState('')
  const [submitted, setSubmitted] = useState(false)
  const { mutateAsync, isPending } = useCreateReview()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!rating)         { toast.error('Please select a rating');   return }
    if (!comment.trim()) { toast.error('Please add a comment');      return }

    try {
      await mutateAsync({
        providerId,
        bookingId: bookingId || undefined, // optional
        rating,
        comment,
      })
      toast.success('Review submitted! Thank you.')
      setSubmitted(true)
      onSuccess?.()
    } catch (err) {
      // If server error (e.g. not authenticated), show message but don't fake success
      toast.error(err?.message || 'Failed to submit review. Please sign in.')
    }
  }

  if (submitted) return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-5 text-center border border-emerald-500/20"
    >
      <div className="text-3xl mb-2">⭐</div>
      <p className="font-semibold text-white">Thank you for your review!</p>
      <p className="text-sm text-slate-400 mt-1">Your feedback helps the community.</p>
    </motion.div>
  )

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 border border-brand-500/10"
    >
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Star size={16} className="text-amber-400" />Leave a Review
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-sm text-slate-400 mb-2">Your Rating</p>
          <StarRating rating={rating} interactive onChange={setRating} size={28} />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-2">Your Experience</label>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)}
            className="input-field resize-none" rows={3}
            placeholder="Share your experience with this provider..."
          />
        </div>
        <button type="submit" disabled={isPending}
          className="btn-primary text-sm py-2.5 disabled:opacity-50"
        >
          <Send size={14} />{isPending ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </motion.div>
  )
}
