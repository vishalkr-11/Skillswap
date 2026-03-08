import { Link } from 'react-router-dom'
import { Zap, Twitter, Github, Linkedin, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
              <span className="font-bold text-gradient">SkillSwap</span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed">Connect with talented local skill providers. Hire, collaborate, and grow together.</p>
            <div className="flex gap-3 mt-4">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="p-2 text-slate-500 hover:text-brand-400 hover:bg-brand-500/10 rounded-lg transition-all">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
          {[
            { title: 'Platform', links: [['Explore', '/explore'], ['How it Works', '/how-it-works'], ['Pricing', '/pricing'], ['Blog', '/blog']] },
            { title: 'Providers', links: [['Join as Provider', '/signup?role=provider'], ['Provider Dashboard', '/provider-dashboard'], ['Resources', '/resources'], ['Community', '/community']] },
            { title: 'Company', links: [['About Us', '/about'], ['Careers', '/careers'], ['Privacy Policy', '/privacy'], ['Terms of Service', '/terms']] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-slate-300 mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map(([label, to]) => (
                  <li key={label}>
                    <Link to={to} className="text-sm text-slate-500 hover:text-slate-300 transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-600">© {new Date().getFullYear()} SkillSwap. All rights reserved.</p>
          <p className="text-xs text-slate-600 flex items-center gap-1">Made with <Heart size={11} className="text-rose-500" /> for the community</p>
        </div>
      </div>
    </footer>
  )
}
