import { motion } from 'framer-motion'

const SECTIONS = [
  { title: '1. Information We Collect', content: 'We collect information you provide directly to us, such as when you create an account (name, email, password), create a provider profile (bio, skills, location), make a booking, send a message, or submit a review. We also collect usage data such as pages visited, features used, and device information.' },
  { title: '2. How We Use Your Information', content: 'We use your information to provide, maintain, and improve SkillSwap. This includes creating and managing your account, facilitating bookings and payments, enabling messaging between users, personalizing your experience, sending transactional emails, and improving our AI recommendation engine.' },
  { title: '3. Information Sharing', content: 'We do not sell your personal information to third parties. We share information with service providers who help operate our platform (e.g., cloud hosting, payment processing). Provider profiles are publicly visible. Booking and messaging details are shared only between the relevant parties.' },
  { title: '4. Data Security', content: 'We use industry-standard encryption (TLS/SSL) to protect data in transit. Passwords are hashed using bcrypt with a work factor of 12. We regularly review our security practices and conduct access controls to minimize unauthorized access.' },
  { title: '5. Your Rights', content: 'You may access, update, or delete your personal information at any time through your account settings. You may request a copy of your data or ask us to delete your account by contacting support. You may opt out of marketing communications by clicking "unsubscribe" in any email.' },
  { title: '6. Cookies', content: 'We use cookies and similar technologies to maintain your session, remember your preferences, and analyze how our service is used. You can disable cookies in your browser settings, though this may affect functionality.' },
  { title: '7. Contact Us', content: 'If you have questions about this Privacy Policy, please contact us at privacy@skillswap.dev. We will respond within 30 days.' },
]

export default function PrivacyPage() {
  return (
    <div className="page-container py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-black mb-2">Privacy <span className="text-gradient">Policy</span></h1>
          <p className="text-slate-400 mb-10">Last updated: January 1, 2025</p>
          <div className="space-y-8">
            {SECTIONS.map((s, i) => (
              <div key={i} className="glass-card p-6">
                <h2 className="font-bold text-white mb-3">{s.title}</h2>
                <p className="text-slate-300 leading-relaxed text-sm">{s.content}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
