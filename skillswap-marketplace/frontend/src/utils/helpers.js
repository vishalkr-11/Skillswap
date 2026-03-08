import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) { return twMerge(clsx(inputs)) }

export function formatCurrency(amount, currency) {
  // Auto-detect currency from browser locale, default USD
  if (!currency) {
    try {
      const locale = navigator.language || 'en-US'
      const region = locale.split('-')[1] || 'US'
      const regionCurrency = { US: 'USD', GB: 'GBP', EU: 'EUR', IN: 'INR', AU: 'AUD', CA: 'CAD', JP: 'JPY' }
      currency = regionCurrency[region] || 'USD'
    } catch { currency = 'USD' }
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency, minimumFractionDigits: 0,
  }).format(amount || 0)
}

export function formatDate(date, opts = {}) {
  if (!date) return '—'
  try {
    return new Intl.DateTimeFormat(navigator.language || 'en-US', {
      dateStyle: 'medium',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      ...opts,
    }).format(new Date(date))
  } catch { return '—' }
}

export function formatRelativeTime(date) {
  if (!date) return ''
  const now     = new Date()
  const then    = new Date(date)
  const diff    = now - then
  const minutes = Math.floor(diff / 60000)
  const hours   = Math.floor(diff / 3600000)
  const days    = Math.floor(diff / 86400000)
  if (minutes < 1)  return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours   < 24) return `${hours}h ago`
  if (days    <  7) return `${days}d ago`
  return formatDate(date)
}

export function getInitials(name = '') {
  if (!name || typeof name !== 'string') return '?'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  return parts.map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export function generateAvatarColor(name = '') {
  if (!name) name = 'default'
  const colors = ['#0ea5e9','#8b5cf6','#00f5d4','#f43f5e','#fb923c','#22c55e','#eab308']
  const idx = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length
  return colors[idx]
}

export function truncate(str, max = 100) {
  if (!str) return ''
  return str.length > max ? str.slice(0, max) + '...' : str
}

// Consistent rating rounding: always 1 decimal place
export function roundRating(r) {
  return Math.round((Number(r) || 0) * 10) / 10
}

/**
 * Normalise a provider object — works for both DB records and mock data.
 * DB records have: skillsOffered, rating: {average, count}, location: {city, state}
 * Mock records have: skills, rating (number), reviewCount, location (string)
 */
export function normalizeProvider(p) {
  if (!p) return null
  const ratingAvg   = typeof p.rating === 'object' ? (p.rating?.average ?? 0) : (p.rating ?? 0)
  const ratingCount = typeof p.rating === 'object' ? (p.rating?.count   ?? 0) : (p.reviewCount ?? 0)

  const skills = p.skills || p.skillsOffered || []

  const locationStr = typeof p.location === 'string'
    ? p.location
    : p.locationStr
    || [p.location?.city, p.location?.state, p.location?.country].filter(Boolean).join(', ')
    || ''

  const hourlyRate = p.hourlyRate
    || p.pricing?.amount
    || p.services?.[0]?.pricing?.amount
    || 0

  // Map backend category aliases to frontend category ids
  const CATEGORY_ALIAS = { technology: 'coding', other: 'music', stem: 'tutoring' }
  const rawCat = p.category || ''
  const category = CATEGORY_ALIAS[rawCat] || rawCat

  return {
    ...p,
    skills,
    skillsOffered: skills,
    rating:        Math.round(ratingAvg * 10) / 10,
    reviewCount:   ratingCount,
    hourlyRate,
    location:      locationStr,
    category,
    // Keep originals for detail pages that need nested structure
    _rawLocation:  p.location,
    _rawRating:    p.rating,
  }
}

export const CATEGORIES = [
  { id: 'coding',       label: 'Coding',       icon: '💻', color: '#0ea5e9' },
  { id: 'design',       label: 'Design',        icon: '🎨', color: '#8b5cf6' },
  { id: 'tutoring',     label: 'Tutoring',      icon: '📚', color: '#22c55e' },
  { id: 'fitness',      label: 'Fitness',       icon: '🏋️', color: '#f43f5e' },
  { id: 'music',        label: 'Music',         icon: '🎵', color: '#eab308' },
  { id: 'plumbing',     label: 'Plumbing',      icon: '🔧', color: '#fb923c' },
  { id: 'cooking',      label: 'Cooking',       icon: '🍳', color: '#00f5d4' },
  { id: 'photography',  label: 'Photography',   icon: '📷', color: '#ec4899' },
  { id: 'language',     label: 'Language',      icon: '🌍', color: '#06b6d4' },
  { id: 'business',     label: 'Business',      icon: '💼', color: '#84cc16' },
]

export const MOCK_PROVIDERS = [
  { _id: '1', name: 'Alex Chen',        avatar: null, category: 'coding',   skills: ['React','Node.js','Python'],    rating: 4.9, reviewCount: 127, hourlyRate: 85,  location: 'San Francisco, CA', bio: 'Full-stack developer with 8 years experience.',           available: true  },
  { _id: '2', name: 'Sarah Kim',        avatar: null, category: 'design',   skills: ['UI/UX','Figma','Branding'],    rating: 4.8, reviewCount:  93, hourlyRate: 75,  location: 'New York, NY',      bio: 'Creative designer specializing in user-centered design.',   available: true  },
  { _id: '3', name: 'Marcus Williams',  avatar: null, category: 'tutoring', skills: ['Math','Physics','SAT Prep'],   rating: 5.0, reviewCount:  64, hourlyRate: 55,  location: 'Chicago, IL',       bio: 'PhD candidate helping students excel in STEM subjects.',     available: false },
  { _id: '4', name: 'Priya Patel',      avatar: null, category: 'fitness',  skills: ['Yoga','HIIT','Nutrition'],     rating: 4.7, reviewCount: 156, hourlyRate: 60,  location: 'Austin, TX',        bio: 'Certified personal trainer with a holistic approach.',       available: true  },
  { _id: '5', name: "James O'Brien",    avatar: null, category: 'music',    skills: ['Guitar','Piano','Theory'],     rating: 4.9, reviewCount:  48, hourlyRate: 70,  location: 'Nashville, TN',     bio: 'Professional musician offering lessons for all levels.',     available: true  },
  { _id: '6', name: 'Maria Santos',     avatar: null, category: 'language', skills: ['Spanish','Portuguese','ESL'],  rating: 4.8, reviewCount:  82, hourlyRate: 45,  location: 'Miami, FL',         bio: 'Native Spanish speaker offering academic language lessons.', available: true  },
]

export const MOCK_REVIEWS = [
  { _id: '1', author: 'John D.',  rating: 5, comment: 'Absolutely incredible work! Delivered beyond expectations.', date: '2024-01-15' },
  { _id: '2', author: 'Emma L.',  rating: 5, comment: 'Professional, punctual, and highly skilled. Would recommend!', date: '2024-01-10' },
  { _id: '3', author: 'Mike R.',  rating: 4, comment: 'Great session, helped me understand complex concepts quickly.', date: '2024-01-05' },
]

export const MOCK_BOOKINGS_CUSTOMER = [
  { _id: '1', providerName: 'Alex Chen',      service: 'React Development Session', date: '2024-02-15', time: '10:00', status: 'upcoming',  amount: 85, providerId: 'mock-1' },
  { _id: '2', providerName: 'Sarah Kim',       service: 'UI/UX Design Review',       date: '2024-02-20', time: '14:00', status: 'upcoming',  amount: 75, providerId: 'mock-2' },
  { _id: '3', providerName: 'Marcus Williams', service: 'Math Tutoring',             date: '2024-01-10', time: '11:00', status: 'completed', amount: 55, providerId: 'mock-3' },
  { _id: '4', providerName: 'Priya Patel',     service: 'Yoga Session',              date: '2024-01-05', time: '09:00', status: 'completed', amount: 60, providerId: 'mock-4' },
]
