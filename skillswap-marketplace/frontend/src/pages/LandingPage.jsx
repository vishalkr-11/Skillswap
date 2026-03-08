import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, Star, Shield, Zap, Users, TrendingUp, CheckCircle2, Play } from 'lucide-react'
import SearchBar from '../components/common/SearchBar'
import ProviderCard from '../components/common/ProviderCard'
import { CATEGORIES, MOCK_PROVIDERS } from '../utils/helpers'

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] } }) }

function AnimatedSection({ children, className }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'} className={className}>
      {children}
    </motion.div>
  )
}

const STATS = [
  { value: '50K+', label: 'Skilled Providers', icon: Users },
  { value: '4.9★', label: 'Average Rating', icon: Star },
  { value: '200+', label: 'Skill Categories', icon: TrendingUp },
  { value: '99%', label: 'Satisfaction Rate', icon: CheckCircle2 },
]

const FEATURES = [
  { icon: '🔍', title: 'Smart Matching', desc: 'AI-powered recommendations find you the perfect provider based on your needs.' },
  { icon: '💬', title: 'Real-time Chat', desc: 'Communicate instantly with providers through our built-in messaging system.' },
  { icon: '📅', title: 'Easy Booking', desc: 'Schedule sessions with just a few clicks and manage your calendar effortlessly.' },
  { icon: '⭐', title: 'Verified Reviews', desc: 'Read authentic reviews from real customers to make confident hiring decisions.' },
  { icon: '🔒', title: 'Secure Payments', desc: 'Protected transactions with money-back guarantee for your peace of mind.' },
  { icon: '🤖', title: 'AI Assistant', desc: 'Get personalized recommendations and instant answers with our Gemini-powered AI.' },
]

export default function LandingPage() {
  return (
    <div className="overflow-hidden">
      {/* HERO */}
      <section className="relative min-h-screen flex items-center pt-16">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent-500/10 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]" style={{ background: 'radial-gradient(ellipse, rgba(0,245,212,0.04) 0%, transparent 70%)' }} />
          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-brand-500/20 text-sm text-brand-300 mb-6"
            >
              <Zap size={14} className="text-brand-400" />
              <span>The Future of Local Skill Exchange</span>
              <ArrowRight size={13} />
            </motion.div>

            <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1}
              className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6"
            >
              Find Local{' '}
              <span className="text-gradient">Experts</span>
              <br />
              For Any{' '}
              <span className="relative inline-block">
                <span className="text-gradient">Skill</span>
                <motion.span
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-brand-400 to-accent-500 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                />
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2}
              className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10"
            >
              Connect with verified local professionals — coders, designers, tutors, trainers, and more. Book instantly, pay securely, and grow together.
            </motion.p>

            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3} className="mb-10">
              <SearchBar large placeholder="Search coding, tutoring, yoga, design..." />
            </motion.div>

            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}
              className="flex flex-wrap items-center justify-center gap-2 text-sm text-slate-500"
            >
              <span>Popular:</span>
              {['React Developer', 'Yoga Instructor', 'Math Tutor', 'UI Designer', 'Guitar Lessons'].map((tag) => (
                <Link key={tag} to={`/explore?q=${encodeURIComponent(tag)}`}
                  className="px-3 py-1 glass rounded-full text-slate-400 hover:text-brand-400 hover:border-brand-500/30 border border-white/5 transition-all text-xs"
                >
                  {tag}
                </Link>
              ))}
            </motion.div>
          </div>

          {/* Floating provider cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="hidden lg:flex justify-center mt-16 gap-4 relative"
          >
            {MOCK_PROVIDERS.slice(0, 3).map((p, i) => (
              <motion.div
                key={p._id}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: i * 0.8, ease: 'easeInOut' }}
                className="glass-card p-4 w-60 flex-shrink-0"
                style={{ transform: `rotate(${(i - 1) * 3}deg)` }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                    style={{ background: ['#0ea5e9', '#8b5cf6', '#00f5d4'][i] }}>
                    {p.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{p.name}</p>
                    <div className="flex items-center gap-1">
                      <Star size={11} fill="currentColor" className="text-amber-400" />
                      <span className="text-xs text-amber-400 font-medium">{p.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {p.skills.slice(0, 2).map((s) => <span key={s} className="badge badge-brand text-xs">{s}</span>)}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <motion.div key={s.label} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                className="text-center"
              >
                <div className="text-4xl font-black text-gradient-brand mb-1">{s.value}</div>
                <div className="text-sm text-slate-500">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <h2 className="section-title mb-3">Browse by <span className="text-gradient">Category</span></h2>
              <p className="text-slate-400 max-w-xl mx-auto">Explore hundreds of skill categories and find the expertise you need</p>
            </motion.div>
          </AnimatedSection>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {CATEGORIES.map((cat, i) => (
              <motion.div key={cat.id} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}>
                <Link
                  to={`/explore?category=${cat.id}`}
                  className="glass-card p-5 text-center hover:border-brand-500/30 group flex flex-col items-center gap-3 cursor-pointer block"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-200 block">{cat.icon}</span>
                  <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{cat.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TOP PROVIDERS */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="section-title mb-2">Top <span className="text-gradient">Providers</span></h2>
              <p className="text-slate-400">Highly rated experts ready to help</p>
            </div>
            <Link to="/explore" className="btn-secondary text-sm hidden sm:flex">
              View All <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {MOCK_PROVIDERS.map((p, i) => <ProviderCard key={p._id} provider={p} index={i} />)}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link to="/explore" className="btn-secondary">View All Providers <ArrowRight size={15} /></Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title mb-3">Everything You <span className="text-gradient">Need</span></h2>
            <p className="text-slate-400 max-w-xl mx-auto">A complete platform for connecting talent with opportunity</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                className="glass-card p-6 group"
              >
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-200 inline-block">{f.icon}</div>
                <h3 className="font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="glass-card p-12 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-transparent to-accent-500/10" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 badge badge-brand mb-6 text-sm px-4 py-2">
                <Shield size={14} />
                Trusted by 50,000+ users
              </div>
              <h2 className="section-title mb-4">Ready to <span className="text-gradient">Get Started?</span></h2>
              <p className="text-slate-400 mb-8 max-w-lg mx-auto">Join thousands of customers and providers already on SkillSwap. It's free to sign up.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup" className="btn-primary py-3 px-8 text-base">
                  Find a Provider <ArrowRight size={16} />
                </Link>
                <Link to="/signup?role=provider" className="btn-secondary py-3 px-8 text-base">
                  Become a Provider
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
