import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Users, Star, Shield, Zap, Target, Heart } from 'lucide-react'

const TEAM = [
  { name: 'Alex Rivera', role: 'Co-founder & CEO', bio: 'Former engineer at Airbnb. Passionate about connecting local talent.', initials: 'AR', color: '#0ea5e9' },
  { name: 'Priya Sharma', role: 'Co-founder & CTO', bio: 'Full-stack engineer and product designer with 10+ years experience.', initials: 'PS', color: '#8b5cf6' },
  { name: 'James Lee', role: 'Head of Community', bio: 'Community builder and educator focused on skill-sharing economies.', initials: 'JL', color: '#00f5d4' },
]

export default function AboutPage() {
  return (
    <div className="page-container py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-4xl font-black mb-4">About <span className="text-gradient">SkillSwap</span></h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            We believe everyone has a skill worth sharing. SkillSwap connects local talent with people who need it — making expertise accessible to everyone.
          </p>
        </motion.div>

        <div className="glass-card p-8 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                SkillSwap was founded in 2023 with a simple idea: the best teacher is often someone in your own community. We built a platform to make that connection easy, safe, and fair for everyone.
              </p>
              <p className="text-slate-300 leading-relaxed">
                Whether you need a coding tutor, a yoga instructor, a Spanish teacher, or a plumber — SkillSwap helps you find verified local providers in minutes.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Users, label: '50,000+', sub: 'Active Users', color: 'text-brand-400' },
                { icon: Star, label: '4.9/5', sub: 'Avg Rating', color: 'text-amber-400' },
                { icon: Target, label: '200+', sub: 'Categories', color: 'text-accent-400' },
                { icon: Heart, label: '99%', sub: 'Satisfaction', color: 'text-rose-400' },
              ].map(s => (
                <div key={s.label} className="glass p-4 rounded-xl text-center">
                  <s.icon size={20} className={`${s.color} mx-auto mb-2`} />
                  <p className={`text-xl font-bold ${s.color}`}>{s.label}</p>
                  <p className="text-xs text-slate-500">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center mb-8">Meet the Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {TEAM.map((member, i) => (
            <motion.div key={member.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="glass-card p-6 text-center"
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-slate-900 mx-auto mb-4"
                style={{ background: member.color }}>
                {member.initials}
              </div>
              <h3 className="font-bold text-white">{member.name}</h3>
              <p className="text-sm text-brand-400 mb-3">{member.role}</p>
              <p className="text-xs text-slate-400 leading-relaxed">{member.bio}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center glass-card p-8">
          <h3 className="text-xl font-bold mb-2">Want to Join Us?</h3>
          <p className="text-slate-400 mb-4">We're always looking for passionate people to help grow SkillSwap.</p>
          <Link to="/careers" className="btn-primary inline-flex">View Open Roles</Link>
        </div>
      </div>
    </div>
  )
}
