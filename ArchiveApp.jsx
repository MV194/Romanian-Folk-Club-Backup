// ArchiveApp.jsx — full app shell for /events/archive
// Same Navbar, Login, Dashboards as main App — just shows ArchivePage as content

import { useState, useCallback, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import Navbar from './components/Navbar'
import LoginModal from './components/LoginModal'
import Toast from './components/Toast'
import MemberDashboard from './components/MemberDashboard'
import AdminDashboard from './components/AdminDashboard'
import ArchivePage from './pages/ArchivePage'
import LogoutConfirmModal from './components/LogoutConfirmModal'
import { useT, useLang } from './lib/i18n.jsx'

const EMPTY_CONTENT = {
  hero:    { title: '', subtitle: '', description: '' },
  about:   { mission: '', history: '', values: '' },
  contact: { email: 'info@kwromanianfolk.com', phone: '(519) 555-0123', address: 'KW Community Center, Waterloo, ON' },
}

export default function ArchiveApp() {
  const { profile, loading, signOut } = useAuth()
  const t = useT()
  const { lang, setLang, currentLang } = useLang()
  const [showLogin, setShowLogin] = useState(false)

  // Update favicon and title based on language
  useEffect(() => {
    const favicon = document.getElementById('dynamic-favicon')
    if (favicon) favicon.href = currentLang.logo
    document.title = t('site.name') + ' - ' + t('nav.pastEvents')
  }, [currentLang, t])
  const [showDash,  setShowDash]  = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [toast,     setToast]     = useState(null)

  const showToast = useCallback((msg) => setToast(msg), [])

  // Nav links on archive page navigate back to homepage sections
  const scrollTo = useCallback((id) => {
    window.location.href = `/#${id}`
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

      {/* Archive page content */}
      <ArchivePage />

      {/* Dashboards work here too */}
      {showDash && profile?.role === 'member' && (
        <MemberDashboard showToast={showToast} onClose={() => setShowDash(false)} />
      )}
      {showDash && profile?.role === 'admin' && (
        <AdminDashboard
          pageContent={EMPTY_CONTENT}
          setPageContent={() => {}}
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
          window.location.href = '/'
        }}
      />
    </div>
  )
}
