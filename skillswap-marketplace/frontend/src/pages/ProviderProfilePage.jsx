import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Clock, Calendar, Shield, Award, ArrowLeft, MessageSquare, ShieldCheck } from 'lucide-react'
import { useProvider, useProviderReviews } from '../hooks/useApi'
import Avatar from '../components/common/Avatar'
import { RatingDisplay } from '../components/common/StarRating'
import ReviewForm from '../components/review/ReviewForm'
import { MOCK_PROVIDERS, MOCK_REVIEWS, formatCurrency, formatDate, normalizeProvider } from '../utils/helpers'
import { useAuth } from '../context/AuthContext'

export default function ProviderProfilePage() {
  const { id } = useParams()
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('about')

  const { data: providerData, isLoading } = useProvider(id)
  const { data: reviewsData } = useProviderReviews(id)

  // providerData arrives as { provider, ratingStats } after the double-nesting fix
  const rawProvider = providerData?.provider
    || (typeof providerData === 'object' && !providerData?.provider ? providerData : null)
    || MOCK_PROVIDERS.find(p => p._id === id)
    || MOCK_PROVIDERS[0]

  const provider = normalizeProvider(rawProvider)

  const reviews = Array.isArray(reviewsData)
    ? reviewsData
    : (reviewsData?.reviews ?? MOCK_REVIEWS)

  if (isLoading) return (
    <div className="page-container max-w-5xl mx-auto px-4 py-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-white/5 rounded w-1/3" />
        <div className="h-64 bg-white/5 rounded" />
        <div className="h-40 bg-white/5 rounded" />
      </div>
    </div>
  )

  if (!provider) return (
    <div className="page-container text-center py-20">
      <h2 className="text-xl text-slate-400">Provider not found</h2>
      <Link to="/explore" className="btn-primary mt-4 inline-flex">Back to Explore</Link>
    </div>
  )

  const TABS = ['about', 'services', 'reviews']
  const rating      = provider.rating ?? 0
  // Use DB review count as the authoritative number
  const reviewCount = provider.reviewCount ?? reviews.length
  const hourlyRate  = provider.hourlyRate ?? 0
  const locationText = provider.location || ''

  return (
    <div className="page-container py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/explore" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm">
          <ArrowLeft size={16} />Back to Explore
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6">
              <div className="text-center mb-5">
                <div className="relative inline-block mb-4">
                  <Avatar name={provider.name} src={provider.avatar} size="xl" online={provider.available ?? provider.isActive} />
                  {(provider.available ?? provider.isActive) && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 badge badge-neon text-xs whitespace-nowrap">Available Now</span>
                  )}
                </div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-white">{provider.name}</h1>
                  {provider.isVerified && <ShieldCheck size={16} className="text-brand-400" title="Verified Provider" />}
                </div>
                {locationText && (
                  <div className="flex items-center justify-center gap-1 text-slate-500 text-sm">
                    <MapPin size={13} /><span>{locationText}</span>
                  </div>
                )}
                <div className="flex items-center justify-center gap-2 mt-2">
                  <RatingDisplay rating={rating} count={reviewCount} />
                </div>
              </div>

              <div className="space-y-3 mb-5">
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-slate-400 text-sm">Hourly Rate</span>
                  <span className="font-bold text-white text-lg">{formatCurrency(hourlyRate)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-slate-400 text-sm">Response Time</span>
                  <span className="text-white text-sm flex items-center gap-1"><Clock size={13} />~1 hour</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-400 text-sm">Sessions Done</span>
                  <span className="text-white text-sm font-medium">{reviewCount * 2}+</span>
                </div>
              </div>

              <div className="space-y-2">
                <Link
                  to={isAuthenticated ? `/book/${id}` : '/login'}
                  className="btn-primary w-full justify-center py-3 flex items-center gap-2"
                >
                  <Calendar size={16} />Book Session
                </Link>
                <button
                  onClick={() => {
                    if (!isAuthenticated) { navigate('/login'); return }
                    navigate(`/messages?with=${provider._id || id}`)
                  }}
                  className="btn-secondary w-full justify-center py-3 flex items-center gap-2"
                >
                  <MessageSquare size={16} />Send Message
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-slate-500">
                <Shield size={13} className="text-brand-400" />
                Secure booking · Money-back guarantee
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><Award size={16} className="text-brand-400" />Skills</h3>
              <div className="flex flex-wrap gap-2">
                {(provider.skills || provider.skillsOffered || []).map((skill) => (
                  <span key={skill} className="badge badge-brand text-sm py-1 px-3">{skill}</span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right content */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-5">
            <div className="flex gap-1 glass-card p-1">
              {TABS.map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-sm font-medium rounded-xl capitalize transition-all ${
                    activeTab === tab ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab} {tab === 'reviews' && `(${reviewCount})`}
                </button>
              ))}
            </div>

            {activeTab === 'about' && (
              <div className="glass-card p-6 space-y-4">
                <h2 className="text-lg font-bold">About {provider.name}</h2>
                {/* Bio with line-clamp for long bios */}
                <p className="text-slate-300 leading-relaxed" style={{ display: '-webkit-box', WebkitLineClamp: 8, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {provider.bio || 'No bio provided yet.'}
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                  {[
                    { label: 'Category',    value: provider.category },
                    { label: 'Rating',      value: `${Number(rating).toFixed(1)}/5.0` },
                    { label: 'Reviews',     value: reviewCount },
                    { label: 'Hourly Rate', value: formatCurrency(hourlyRate) },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                      <p className="font-semibold text-white capitalize">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <div className="space-y-3">
                {(provider.services?.length
                  ? provider.services
                  : [{ name: `${provider.category || 'General'} Session`, price: hourlyRate, duration: '1 hour', description: 'One-on-one personalized session tailored to your needs.' }]
                ).map((svc, i) => (
                  <div key={svc._id || i} className="glass-card p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-white capitalize">{svc.name || svc.title}</h3>
                        <p className="text-sm text-slate-400 mt-1">{svc.description}</p>
                        <span className="flex items-center gap-1 mt-3 text-xs text-slate-500">
                          <Clock size={12} />{svc.duration || '1 hour'}
                        </span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xl font-bold text-white">{formatCurrency(svc.price || svc.pricing?.amount || hourlyRate)}</p>
                        <p className="text-xs text-slate-500">per session</p>
                        <Link to={isAuthenticated ? `/book/${id}` : '/login'} className="btn-primary text-xs mt-2 py-1.5 px-3 inline-flex">
                          Book Now
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {reviews.map((r, i) => (
                  <motion.div key={r._id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="glass-card p-5"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-500/20 flex items-center justify-center text-sm font-bold text-brand-400">
                          {(r.author || r.customerId?.name || 'A')[0]?.toUpperCase() || 'A'}
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">{r.author || r.customerId?.name || 'Anonymous'}</p>
                          <p className="text-xs text-slate-500">{formatDate(r.date || r.createdAt)}</p>
                        </div>
                      </div>
                      <RatingDisplay rating={r.rating} showCount={false} size={13} />
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{r.comment}</p>
                  </motion.div>
                ))}
                {reviews.length === 0 && (
                  <div className="text-center py-10">
                    <p className="text-slate-500">No reviews yet. Be the first!</p>
                  </div>
                )}
                {isAuthenticated && user?.role !== 'provider' && (
                  <ReviewForm providerId={id} onSuccess={() => {}} />
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
