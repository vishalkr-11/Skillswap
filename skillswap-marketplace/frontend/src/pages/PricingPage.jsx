import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { CheckCircle2, Zap, Star, Shield } from 'lucide-react'

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    desc: 'Get started and explore providers',
    color: 'text-slate-300',
    features: ['Browse all providers', '3 booking requests/month', 'Basic messaging', 'Standard support'],
    cta: 'Get Started',
    to: '/signup',
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    desc: 'For power users and frequent learners',
    color: 'text-brand-400',
    badge: 'Most Popular',
    features: ['Unlimited bookings', 'AI-powered matching', 'Priority messaging', 'Calendar integration', 'Priority support', 'Booking history & receipts'],
    cta: 'Start Pro Trial',
    to: '/signup',
    highlight: true,
  },
  {
    name: 'Business',
    price: '$79',
    period: '/month',
    desc: 'For teams and organizations',
    color: 'text-accent-400',
    features: ['Everything in Pro', 'Team management', 'Bulk booking', 'Dedicated account manager', 'Custom contracts', 'Analytics dashboard'],
    cta: 'Contact Sales',
    to: '/about',
  },
]

export default function PricingPage() {
  return (
    <div className="page-container py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <h1 className="text-4xl font-black mb-4">Simple, Transparent <span className="text-gradient">Pricing</span></h1>
          <p className="text-slate-400 max-w-xl mx-auto">No hidden fees. Cancel anytime. Pay only for what you use.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan, i) => (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className={`glass-card p-7 relative ${plan.highlight ? 'border-brand-500/40 shadow-brand' : ''}`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 badge badge-brand px-4 py-1 text-xs">{plan.badge}</span>
              )}
              <h3 className={`font-bold text-lg mb-1 ${plan.color}`}>{plan.name}</h3>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-4xl font-black text-white">{plan.price}</span>
                <span className="text-slate-400 mb-1">{plan.period}</span>
              </div>
              <p className="text-sm text-slate-400 mb-6">{plan.desc}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle2 size={15} className="text-brand-400 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link to={plan.to} className={`w-full justify-center py-2.5 flex items-center gap-2 font-medium rounded-xl transition-all text-sm ${plan.highlight ? 'btn-primary' : 'btn-secondary'}`}>
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
        <div className="mt-12 text-center glass-card p-8">
          <Shield size={28} className="text-brand-400 mx-auto mb-3" />
          <h3 className="font-bold text-white mb-2">Provider Listing is Always Free</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">Providers list their services for free. We only charge a small 5% platform fee when a booking is completed.</p>
        </div>
      </div>
    </div>
  )
}
