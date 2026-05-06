import { useState, useCallback, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import { useT, useLang } from './lib/i18n.jsx'
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
import LogoutConfirmModal from './components/LogoutConfirmModal'

const DEFAULT_PAGE_CONTENT = {
  hero: {
    title: 'KW Folk Club',
    subtitle: 'Preserving Heritage Through Music, Dance & Community',
    description: 'Experience the rich traditions of Romanian folk culture in Kitchener-Waterloo, Ontario',
  },
  about: {
    mission: 'To celebrate, preserve, and share Romanian folk traditions through music, dance, cultural events, and community gatherings in the Kitchener-Waterloo region.',
    history: 'Founded in 2025, the KW Folk Club is dedicated to Romanian cultural preservation. We bring together Romanian-Canadians and culture enthusiasts to keep our traditions alive.',
    values: 'Community · Heritage · Tradition · Celebration · Inclusivity',
  },
  contact: {
    email: 'folk.club.kw@gmail.com',
    phone: '(519) 555-0123',
    address: 'Every Sunday, 3 PM - 5 PM',
  },
}

export default function App() {
  const { profile, loading, signOut } = useAuth()
  const t = useT()
  const { lang, setLang, currentLang } = useLang()
  const [showLogin, setShowLogin]     = useState(false)

  // Update favicon and title based on language
  useEffect(() => {
    const favicon = document.getElementById('dynamic-favicon')
    if (favicon) favicon.href = currentLang.logo
    document.title = t('site.name')
  }, [currentLang, t])
  const [showDash, setShowDash]       = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [pageContent, setPageContent] = useState(DEFAULT_PAGE_CONTENT)
  const [toast, setToast]             = useState(null)

  const showToast = useCallback((msg) => setToast(msg), [])
  const scrollTo  = useCallback((id) => {
    const el = document.getElementById(id)
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' })
  }, [])

  const handleLogout = useCallback(() => {
    setShowLogoutConfirm(true)
  }, [])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ink)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
            <img 
              src={currentLang.logo} 
              alt="Logo"
              style={{ width: '100px', height: '100px', objectFit: 'contain' }} 
            />
          </div>
          <p style={{ color: 'var(--gold)', fontFamily: 'DM Sans, sans-serif', letterSpacing: '.1em', fontSize: '64px', textTransform: 'uppercase', margin: 0 }}>
            {t('common.loading')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar
        onLoginClick={() => setShowLogin(true)}
        onDashboardClick={() => setShowDash(true)}
        onLogoutClick={handleLogout}
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

      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={async () => {
          setShowLogoutConfirm(false)
          await signOut()
          scrollTo('home')
          showToast(t('toast.signout'))
        }}
      />
    </div>
  )
}
