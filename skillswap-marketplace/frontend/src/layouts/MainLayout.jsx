import { Outlet } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import { FloatingAIButton } from '../components/ai/AIAssistant'

export default function MainLayout() {
  return (
    <div className="min-h-screen mesh-bg flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <FloatingAIButton />
    </div>
  )
}
