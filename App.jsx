import { useState, useCallback } from 'react'
import { useAuth } from './hooks/useAuth'
import Navbar from './components/Navbar'
import LoginModal from './components/LoginModal'
import Toast from './components/Toast'
import HeroSection from './components/HeroSection'
import AboutSection from './components/AboutSection'
import EventsSection from './components/EventsSection'
import GallerySection from './components/GallerySection'
import TestimonialsSection from './components/TestimonialsSection'
import ContactSection from './components/ContactSection'
import Footer from './components/Footer'
import MemberDashboard from './components/MemberDashboard'
import AdminDashboard from './components/AdminDashboard'

const DEFAULT_PAGE_CONTENT = {
  hero: {
    title: 'KW Romanian Folk Club',
    subtitle: 'Preserving Heritage Through Music, Dance & Community',
    description: 'Experience the rich traditions of Romanian folk culture in Kitchener-Waterloo, Ontario',
  },
  about: {
    mission: 'To celebrate, preserve, and share Romanian folk traditions through music, dance, cultural events, and community gatherings in the Kitchener-Waterloo region.',
    history: 'Founded in 2010, the KW Romanian Folk Club has been a cornerstone of Romanian cultural preservation. We bring together Romanian-Canadians and culture enthusiasts to keep our traditions alive.',
    values: 'Community · Heritage · Tradition · Celebration · Inclusivity',
  },
  contact: {
    email: 'info@kwromanianfolk.com',
    phone: '(519) 555-0123',
    address: 'KW Community Center, Waterloo, ON, Canada',
  },
}

export default function App() {
  const { profile, loading } = useAuth()
  const [showLogin, setShowLogin]     = useState(false)
  const [showDash, setShowDash]       = useState(false)
  const [pageContent, setPageContent] = useState(DEFAULT_PAGE_CONTENT)
  const [toast, setToast]             = useState(null)

  const showToast = useCallback((msg) => setToast(msg), [])
  const scrollTo  = useCallback((id) => {
    const el = document.getElementById(id)
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' })
  }, [])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ink)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🪕</div>
          <p style={{ color: 'var(--gold)', fontFamily: 'DM Sans, sans-serif', letterSpacing: '.1em', fontSize: '14px', textTransform: 'uppercase' }}>Loading…</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar
        onLoginClick={() => setShowLogin(true)}
        onDashboardClick={() => setShowDash(true)}
        onScrollTo={scrollTo}
        showToast={showToast}
      />

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          showToast={showToast}
          onSuccess={() => { setShowLogin(false); setShowDash(true) }}
        />
      )}

      <HeroSection
        onScrollTo={scrollTo}
        onLoginClick={() => setShowLogin(true)}
        onDashboardClick={() => setShowDash(true)}
      />
      <AboutSection content={pageContent.about} />

      {/* EventsSection manages its own event state + modal internally */}
      <EventsSection
        showToast={showToast}
        onLoginClick={() => setShowLogin(true)}
      />

      <GallerySection />
      <TestimonialsSection />
      <ContactSection content={pageContent.contact} showToast={showToast} />
      <Footer onScrollTo={scrollTo} />

      {showDash && profile?.role === 'member' && (
        <MemberDashboard showToast={showToast} onClose={() => setShowDash(false)} />
      )}
      {showDash && profile?.role === 'admin' && (
        <AdminDashboard
          pageContent={pageContent}
          setPageContent={setPageContent}
          showToast={showToast}
          onClose={() => setShowDash(false)}
        />
      )}

      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  )
}
