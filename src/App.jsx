import { Routes, Route } from 'react-router-dom'
import Layout from './marketing/Layout'
import Home from './marketing/pages/Home'
import HowItWorks from './marketing/pages/HowItWorks'
import ProcessTimeline from './marketing/pages/ProcessTimeline'
import Benefits from './marketing/pages/Benefits'
import Gallery from './marketing/pages/Gallery'
import Testimonials from './marketing/pages/Testimonials'
import Pricing from './marketing/pages/Pricing'
import FAQ from './marketing/pages/FAQ'
import Contact from './marketing/pages/Contact'
import ConfiguratorApp from './ConfiguratorApp'
import AdminApp from './admin/AdminApp'

export default function App() {
  return (
    <Routes>
      {/* Marketing site — all pages share the nav layout */}
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="how-it-works" element={<HowItWorks />} />
        <Route path="process" element={<ProcessTimeline />} />
        <Route path="benefits" element={<Benefits />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="testimonials" element={<Testimonials />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="faq" element={<FAQ />} />
        <Route path="contact" element={<Contact />} />
      </Route>

      {/* Phase 1 configurator — full-screen, no marketing nav */}
      <Route path="configurator" element={<ConfiguratorApp />} />

      {/* Internal admin panel — orders, pricing, discounts */}
      <Route path="admin" element={<AdminApp />} />
    </Routes>
  )
}
