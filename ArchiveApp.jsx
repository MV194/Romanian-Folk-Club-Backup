// ArchiveApp.jsx — full app shell for /events/archive
// Same Navbar, Login, Dashboards as main App — just shows ArchivePage as content

import { useState, useCallback } from 'react'
import { useAuth } from './hooks/useAuth'
import Navbar from './components/Navbar'
import LoginModal from './components/LoginModal'
import Toast from './components/Toast'
import MemberDashboard from './components/MemberDashboard'
import AdminDashboard from './components/AdminDashboard'
import ArchivePage from './pages/ArchivePage'

const EMPTY_CONTENT = {
  hero:    { title: '', subtitle: '', description: '' },
  about:   { mission: '', history: '', values: '' },
  contact: { email: 'info@kwromanianfolk.com', phone: '(519) 555-0123', address: 'KW Community Center, Waterloo, ON' },
}

export default function ArchiveApp() {
  const { profile, loading } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  const [showDash,  setShowDash]  = useState(false)
  const [toast,     setToast]     = useState(null)

  const showToast = useCallback((msg) => setToast(msg), [])

  // Nav links on archive page navigate back to homepage sections
  const scrollTo = useCallback((id) => {
    window.location.href = `/#${id}`
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
    </div>
  )
}
