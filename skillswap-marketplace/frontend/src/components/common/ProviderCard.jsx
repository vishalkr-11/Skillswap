import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Star, ArrowRight, ShieldCheck } from 'lucide-react'
import Avatar from './Avatar'
import { formatCurrency, truncate, normalizeProvider, CATEGORIES } from '../../utils/helpers'

export default function ProviderCard({ provider: raw, index = 0 }) {
  if (!raw) return null
  const provider = normalizeProvider(raw)
  const { _id, id, name, avatar, skills = [], rating, reviewCount, hourlyRate, location, bio, available, category, isVerified } = provider

  const providerId = _id || id
  const cat = CATEGORIES.find(c => c.id === category)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="glass-card p-5 flex flex-col gap-4 group"
    >
      <div className="flex items-start gap-3">
        <Avatar name={name} src={avatar} size="lg" online={available} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <h3 className="font-semibold text-white text-base truncate">{name}</h3>
              {isVerified && <ShieldCheck size={14} className="text-brand-400 flex-shrink-0" title="Verified Provider" />}
            </div>
            {available && <span className="badge badge-neon flex-shrink-0 text-xs">Available</span>}
          </div>
          {location && (
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin size={12} className="text-slate-500 flex-shrink-0" />
              <span className="text-xs text-slate-500 truncate">{location}</span>
            </div>
          )}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <div className="flex items-center gap-1">
              <Star size={13} fill="currentColor" className="text-amber-400" />
              <span className="text-sm font-semibold text-amber-400">{Number(rating).toFixed(1)}</span>
              <span className="text-xs text-slate-500">({reviewCount})</span>
            </div>
            {cat && (
              <span className="badge text-xs py-0.5 px-2" style={{
                background: `${cat.color}20`,
                color: cat.color,
                border: `1px solid ${cat.color}40`,
              }}>
                {cat.icon} {cat.label}
              </span>
            )}
          </div>
        </div>
      </div>

      {bio && <p className="text-sm text-slate-400 leading-relaxed">{truncate(bio, 90)}</p>}

      <div className="flex flex-wrap gap-1.5">
        {skills.slice(0, 4).map((skill) => (
          <span key={skill} className="badge badge-brand text-xs">{skill}</span>
        ))}
        {skills.length > 4 && (
          <span className="badge bg-white/5 text-slate-400 text-xs border border-white/10">+{skills.length - 4}</span>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-auto">
        <div>
          <span className="text-lg font-bold text-white">{formatCurrency(hourlyRate)}</span>
          <span className="text-xs text-slate-500">/hr</span>
        </div>
        <Link to={`/providers/${providerId}`} className="btn-primary py-2 px-4 text-xs group/btn">
          View Profile
          <ArrowRight size={13} className="group-hover/btn:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </motion.div>
  )
}
