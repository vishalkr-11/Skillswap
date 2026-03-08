import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, X, Search } from 'lucide-react'
import { useProviders } from '../hooks/useApi'
import { useDebounce } from '../hooks/useUtils'
import ProviderCard from '../components/common/ProviderCard'
import { SkeletonList } from '../components/common/FullPageLoader'
import { CATEGORIES, MOCK_PROVIDERS, normalizeProvider } from '../utils/helpers'

const SORT_OPTIONS = [
  { value: 'rating',     label: 'Highest Rated' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'reviews',    label: 'Most Reviewed' },
]

// ── URL IS the state — no desync possible ───────────────────────────────
export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const category = searchParams.get('category') || ''
  const sort      = searchParams.get('sort')     || 'rating'
  const urlQuery  = searchParams.get('q')        || ''

  // Local input state only for the debounce buffer
  const [inputQuery,  setInputQuery]  = useState(urlQuery)
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange,  setPriceRange]  = useState([0, 500])

  // Sync input box when URL q changes externally
  useEffect(() => { setInputQuery(urlQuery) }, [urlQuery])

  const debouncedQuery = useDebounce(inputQuery, 400)

  // Reflect debounced query back into URL
  useEffect(() => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (debouncedQuery) next.set('q', debouncedQuery)
      else next.delete('q')
      return next
    }, { replace: true })
  }, [debouncedQuery]) // eslint-disable-line

  const apiParams = useMemo(() => ({
    q:        urlQuery || undefined,
    category: category || undefined,
    sort,
    minPrice: priceRange[0] > 0   ? priceRange[0] : undefined,
    maxPrice: priceRange[1] < 500 ? priceRange[1] : undefined,
  }), [urlQuery, category, sort, priceRange])

  const { data, isLoading, isFetching } = useProviders(apiParams)

  const providers = useMemo(() => {
    const raw = data?.providers?.length
      ? data.providers
      : MOCK_PROVIDERS.filter(p => {
          if (category && p.category !== category) return false
          if (urlQuery) {
            const q = urlQuery.toLowerCase()
            if (
              !p.name?.toLowerCase().includes(q) &&
              !(p.skills || []).some(s => s.toLowerCase().includes(q)) &&
              !p.location?.toLowerCase().includes(q)
            ) return false
          }
          if (priceRange[1] < 500 && (p.hourlyRate || 0) > priceRange[1]) return false
          return true
        })
    return raw.map(normalizeProvider)
  }, [data, category, urlQuery, priceRange])

  const setCategory = (cat) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (cat) next.set('category', cat)
      else next.delete('category')
      next.delete('q')
      setInputQuery('')
      return next
    })
  }

  const setSort = (s) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('sort', s)
      return next
    })
  }

  const clearAll = () => {
    setSearchParams({})
    setInputQuery('')
    setPriceRange([0, 500])
    setShowFilters(false)
  }

  const currentCat = CATEGORIES.find(c => c.id === category)
  const activeFilterCount = [category, priceRange[1] < 500].filter(Boolean).length

  return (
    <div className="page-container py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {currentCat ? <>{currentCat.icon} {currentCat.label} Providers</> : 'Explore Providers'}
          </h1>
          <p className="text-slate-400">
            {isFetching && !isLoading
              ? <span className="animate-pulse">Updating...</span>
              : `${providers.length} provider${providers.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {/* Search + controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Search skills, providers, or location..."
              className="input-field pl-9 w-full"
            />
            {inputQuery && (
              <button
                onClick={() => { setInputQuery(''); setSearchParams(p => { const n = new URLSearchParams(p); n.delete('q'); return n }) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              ><X size={14} /></button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`btn-secondary text-sm flex-shrink-0 relative ${showFilters ? 'border-brand-500/40 text-brand-400' : ''}`}
          >
            <SlidersHorizontal size={15} />Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-brand-500 rounded-full text-white text-xs flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
          <select value={sort} onChange={(e) => setSort(e.target.value)}
            className="input-field text-sm cursor-pointer flex-shrink-0 w-full sm:w-auto"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} className="glass-card p-5 mb-6 overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-slate-300">Category</h4>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setCategory('')}
                      className={`badge text-xs cursor-pointer transition-all ${!category ? 'badge-brand' : 'bg-white/5 text-slate-400 border border-white/10 hover:border-white/20'}`}
                    >All</button>
                    {CATEGORIES.map(c => (
                      <button key={c.id} onClick={() => setCategory(c.id === category ? '' : c.id)}
                        className={`badge text-xs cursor-pointer transition-all ${category === c.id ? 'badge-brand' : 'bg-white/5 text-slate-400 border border-white/10 hover:border-white/20'}`}
                      >{c.icon} {c.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-slate-300">
                    Max Rate: {priceRange[1] < 500 ? `$${priceRange[1]}/hr` : 'Any'}
                  </h4>
                  <input type="range" min={0} max={500} step={10} value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                    className="w-full accent-brand-500"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1"><span>$0</span><span>$500+</span></div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-slate-300">Availability</h4>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded accent-brand-500" />
                    <span className="text-sm text-slate-400">Available Now</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end mt-4 pt-4 border-t border-white/5">
                <button onClick={clearAll} className="btn-ghost text-sm text-rose-400 hover:text-rose-300 flex items-center gap-1">
                  <X size={13} /> Clear All
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          <button onClick={() => setCategory('')}
            className={`badge flex-shrink-0 px-4 py-1.5 text-sm cursor-pointer transition-all ${!category ? 'badge-brand' : 'bg-white/5 text-slate-400 border border-white/10 hover:border-white/20'}`}
          >All</button>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setCategory(c.id === category ? '' : c.id)}
              className={`badge flex-shrink-0 px-4 py-1.5 text-sm cursor-pointer transition-all ${category === c.id ? 'badge-brand' : 'bg-white/5 text-slate-400 border border-white/10 hover:border-white/20'}`}
            >{c.icon} {c.label}</button>
          ))}
        </div>

        {/* Results */}
        <div style={{ minHeight: '400px' }}>
          {isLoading ? (
            <SkeletonList count={9} />
          ) : providers.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No providers found</h3>
              <p className="text-slate-400 mb-6">
                {category
                  ? `No ${currentCat?.label || category} providers yet.`
                  : 'Try adjusting your search or filters.'}
              </p>
              <button onClick={clearAll} className="btn-secondary text-sm">Clear Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {providers.map((p, i) => (
                <ProviderCard key={p._id || p.id || i} provider={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
