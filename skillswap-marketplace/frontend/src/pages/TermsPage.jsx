import { motion } from 'framer-motion'

const SECTIONS = [
  { title: '1. Acceptance of Terms', content: 'By accessing or using SkillSwap, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform. We reserve the right to update these terms at any time with notice.' },
  { title: '2. User Accounts', content: 'You are responsible for maintaining the security of your account and all activities under your credentials. You must be 18 or older to use SkillSwap. You agree to provide accurate information and update it as needed.' },
  { title: '3. Provider Responsibilities', content: 'Providers are independent contractors, not employees of SkillSwap. Providers are responsible for the accuracy of their profiles, the quality of their services, and complying with applicable laws including tax obligations.' },
  { title: '4. Payments and Fees', content: 'SkillSwap charges a 5% platform fee on completed bookings. All payments are processed securely. Refunds are available within 24 hours of a booking if cancelled. Disputes must be reported within 7 days of the session.' },
  { title: '5. Prohibited Conduct', content: 'You may not use SkillSwap for illegal activities, harassment, fraud, or circumventing the platform (e.g., arranging direct payments to avoid fees). Violations may result in permanent account termination.' },
  { title: '6. Intellectual Property', content: 'SkillSwap and its logo are trademarks of SkillSwap Inc. User-generated content (reviews, profiles) remains the property of the creator, with a license granted to SkillSwap to display it on the platform.' },
  { title: '7. Limitation of Liability', content: 'SkillSwap is a marketplace platform and is not responsible for the actions of providers or customers. Our liability is limited to the amount paid for the specific booking in question.' },
]

export default function TermsPage() {
  return (
    <div className="page-container py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-black mb-2">Terms of <span className="text-gradient">Service</span></h1>
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
