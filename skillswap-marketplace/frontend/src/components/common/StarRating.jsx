import { Star } from 'lucide-react'

export default function StarRating({ rating = 0, max = 5, size = 14, interactive = false, onChange }) {
  const stars = Array.from({ length: max }, (_, i) => i + 1)
  return (
    <div className="flex items-center gap-0.5 star-rating">
      {stars.map((star) => (
        <button
          key={star}
          type={interactive ? 'button' : undefined}
          onClick={interactive ? () => onChange?.(star) : undefined}
          className={interactive ? 'hover:scale-110 transition-transform cursor-pointer' : 'cursor-default'}
          tabIndex={interactive ? 0 : -1}
        >
          <Star
            size={size}
            fill={star <= rating ? 'currentColor' : 'none'}
            strokeWidth={1.5}
            className={star <= rating ? 'text-amber-400' : 'text-slate-600'}
          />
        </button>
      ))}
    </div>
  )
}

export function RatingDisplay({ rating, count, size = 14, showCount = true }) {
  return (
    <div className="flex items-center gap-1.5">
      <StarRating rating={Math.round(rating)} size={size} />
      <span className="text-amber-400 font-semibold text-sm">{Number(rating).toFixed(1)}</span>
      {showCount && count !== undefined && (
        <span className="text-slate-500 text-xs">({count})</span>
      )}
    </div>
  )
}
