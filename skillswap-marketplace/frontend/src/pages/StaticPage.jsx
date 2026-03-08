// Generic placeholder for routes not yet fully built
import { useLocation } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Construction } from 'lucide-react'

const PAGE_META = {
  '/blog':        { title: 'Blog',        desc: 'Tips, stories, and insights from the SkillSwap community.' },
  '/careers':     { title: 'Careers',     desc: 'Join our team and help shape the future of local skill exchange.' },
  '/how-it-works':{ title: 'How It Works', desc: 'Learn how SkillSwap connects customers with skilled local providers.' },
  '/resources':   { title: 'Resources',   desc: 'Guides, tutorials, and tools to help you make the most of SkillSwap.' },
  '/community':   { title: 'Community',   desc: 'Connect with other SkillSwap users and share your experiences.' },
}

export default function StaticPage() {
  const { pathname } = useLocation()
  const meta = PAGE_META[pathname] || { title: 'Coming Soon', desc: 'This page is under construction.' }

  return (
    <div className="page-container flex items-center justify-center py-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center mx-auto mb-6">
          <Construction size={28} className="text-brand-400" />
        </div>
        <h1 className="text-3xl font-bold mb-3 text-gradient">{meta.title}</h1>
        <p className="text-slate-400 mb-8">{meta.desc}</p>
        <p className="text-slate-500 text-sm mb-6">This section is coming soon. Check back soon for updates!</p>
        <Link to="/" className="btn-primary inline-flex">← Back to Home</Link>
      </motion.div>
    </div>
  )
}
