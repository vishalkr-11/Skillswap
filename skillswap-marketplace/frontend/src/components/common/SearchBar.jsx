import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, SlidersHorizontal } from 'lucide-react'
import { motion } from 'framer-motion'

export default function SearchBar({ onSearch, placeholder = 'Search skills, services, or providers...', large = false, defaultValue = '' }) {
  const [query, setQuery] = useState(defaultValue)
  const [location, setLocation] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSearch) { onSearch({ query, location }) }
    else { navigate(`/explore?q=${encodeURIComponent(query)}${location ? `&loc=${encodeURIComponent(location)}` : ''}`) }
  }

  if (large) {
    return (
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onSubmit={handleSubmit}
        className="w-full max-w-3xl mx-auto"
      >
        <div className="glass rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-card">
          <div className="flex-1 flex items-center gap-3 px-4 py-2">
            <Search size={18} className="text-brand-400 flex-shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="bg-transparent outline-none text-white placeholder-slate-500 text-sm w-full"
            />
          </div>
          <div className="hidden sm:flex items-center gap-3 px-4 py-2 border-l border-white/10">
            <MapPin size={16} className="text-slate-500 flex-shrink-0" />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              className="bg-transparent outline-none text-white placeholder-slate-500 text-sm w-32"
            />
          </div>
          <button type="submit" className="btn-primary py-3 px-6 text-sm rounded-xl justify-center">
            <Search size={16} />
            Search
          </button>
        </div>
      </motion.form>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          onSearch?.({ query: e.target.value, location })
        }}
        placeholder={placeholder}
        className="input-field pl-9 pr-4"
      />
    </form>
  )
}
