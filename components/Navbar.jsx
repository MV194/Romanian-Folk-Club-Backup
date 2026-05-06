import { useState } from 'react'
import { LogOut, Menu, X, Users } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useT, useLang, LANGUAGES } from '../lib/i18n.jsx'

const NAV_SECTIONS = ['home', 'about', 'events', 'gallery', 'testimonials', 'contact']
const NAV_KEYS = {
  home: 'nav.home', about: 'nav.about', events: 'nav.events',
  gallery: 'nav.gallery', testimonials: 'nav.testimonials', contact: 'nav.contact',
}

export default function Navbar({ onLoginClick, onDashboardClick, onScrollTo, showToast }) {
  const { profile, signOut } = useAuth()
  const t = useT()
  const { lang, setLang } = useLang()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await signOut()
    onScrollTo('home')
    showToast(t('toast.signout'))
  }

  const handleNav = (section) => {
    onScrollTo(section)
    setMobileOpen(false)
  }

  return (
    <>
      {/* ── Main bar ── always one line, never wraps ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: 'var(--ink)', borderBottom: '3px solid var(--gold)',
      }}>
        <div className="nav-inner" style={{
          maxWidth: '1280px', margin: '0 auto',
          padding: '0 20px', height: 'var(--nav-h)',
          display: 'flex', alignItems: 'center', gap: '6px',
          overflow: 'hidden', width: '100%',
        }}>

          {/* Logo */}
          <div onClick={() => handleNav('home')} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flexShrink: 0 }}>
            <div style={{ width: '38px', height: '38px', background: 'var(--gold)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>🪕</div>
            <div className="logo-full">
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '14px', color: '#fff', lineHeight: 1.15, whiteSpace: 'nowrap' }}>KW Romanian Folk Club</div>
              <div style={{ fontSize: '9.5px', color: 'var(--gold)', letterSpacing: '.03em', whiteSpace: 'nowrap' }}>Kitchener-Waterloo, Ontario</div>
            </div>
            <div className="logo-short" style={{ display: 'none' }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '13px', color: '#fff', whiteSpace: 'nowrap' }}>KW Folk Club</div>
            </div>
          </div>

          {/* Nav links — desktop */}
          <div className="nav-links" style={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'center', gap: '1px' }}>
            {NAV_SECTIONS.map(s => (
              <button key={s} onClick={() => handleNav(s)} style={{
                background: 'none', border: 'none', color: 'rgba(255,255,255,.7)',
                fontFamily: 'inherit', fontSize: '12.5px',
                padding: '6px 9px', borderRadius: '6px',
                cursor: 'pointer', transition: '.2s', whiteSpace: 'nowrap',
              }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,.1)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,.7)'; e.currentTarget.style.background = 'none' }}
              >{t(NAV_KEYS[s])}</button>
            ))}
            <a href="/events/archive" style={{
              color: 'rgba(255,255,255,.7)', fontSize: '12.5px',
              fontFamily: 'inherit', padding: '6px 9px', borderRadius: '6px',
              textDecoration: 'none', transition: '.2s', whiteSpace: 'nowrap',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,.1)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,.7)'; e.currentTarget.style.background = 'none' }}
            >{t('nav.pastEvents')}</a>
          </div>

          {/* Right: lang + auth */}
          <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>

            {/* Language switcher */}
            <div className="nav-lang" style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)', borderRadius: '20px', padding: '3px 4px' }}>
              {LANGUAGES.map(l => (
                <button key={l.code} onClick={() => setLang(l.code)} style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  background: lang === l.code ? 'rgba(212,175,55,.22)' : 'transparent',
                  border: lang === l.code ? '1px solid rgba(212,175,55,.45)' : '1px solid transparent',
                  color: lang === l.code ? 'var(--gold)' : 'rgba(255,255,255,.55)',
                  fontFamily: 'inherit', fontSize: '11.5px',
                  padding: '4px 7px', borderRadius: '14px',
                  cursor: 'pointer', transition: '.2s', letterSpacing: '.03em',
                }}>
                  <img src={l.flag} alt={l.name} style={{ width: '17px', height: '11px', borderRadius: '2px', objectFit: 'cover', display: 'block', flexShrink: 0 }} />
                  <span className="lang-label">{l.label}</span>
                </button>
              ))}
            </div>

            {/* Auth */}
            {profile ? (
              <>
                <button onClick={onDashboardClick} style={{
                  background: 'var(--gold)', color: 'var(--ink)', border: 'none',
                  padding: '6px 12px', borderRadius: '20px', cursor: 'pointer',
                  fontFamily: 'inherit', fontWeight: '600', fontSize: '12px',
                  display: 'flex', alignItems: 'center', gap: '6px', transition: '.2s', whiteSpace: 'nowrap',
                }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: profile.avatar_color || 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '700', color: '#fff', flexShrink: 0 }}>
                    {(profile.avatar_letters || profile.name?.slice(0, 2) || 'MB').toUpperCase().slice(0, 2)}
                  </div>
                  <span className="dash-label">{t('nav.dashboard')}</span>
                </button>
                <button onClick={handleLogout} title={t('nav.signout')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.5)', padding: '5px', borderRadius: '6px', display: 'flex', alignItems: 'center', transition: '.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.5)'}
                ><LogOut size={15} /></button>
              </>
            ) : (
              <button onClick={onLoginClick} style={{
                background: 'var(--gold)', color: 'var(--ink)', border: 'none',
                padding: '7px 14px', borderRadius: '20px', cursor: 'pointer',
                fontFamily: 'inherit', fontWeight: '600', fontSize: '12px',
                display: 'flex', alignItems: 'center', gap: '6px', transition: '.2s', whiteSpace: 'nowrap',
              }}>
                <Users size={13} />
                <span className="login-label">{t('nav.login')}</span>
              </button>
            )}

            {/* Hamburger */}
            <button onClick={() => setMobileOpen(o => !o)} className="hamburger"
              style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: '4px', alignItems: 'center' }}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* ── Mobile drawer ── */}
        {mobileOpen && (
          <div style={{ background: 'var(--ink)', borderTop: '1px solid rgba(212,175,55,.15)', padding: '6px 20px 20px' }}>
            {NAV_SECTIONS.map(s => (
              <button key={s} onClick={() => handleNav(s)} style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '13px 10px', background: 'none', border: 'none',
                color: 'rgba(255,255,255,.85)', fontFamily: 'inherit',
                fontSize: '15px', cursor: 'pointer',
                borderBottom: '1px solid rgba(255,255,255,.06)',
              }}>{t(NAV_KEYS[s])}</button>
            ))}
            <a href="/events/archive" style={{
              display: 'block', padding: '13px 10px',
              color: 'rgba(255,255,255,.85)', fontFamily: 'inherit',
              fontSize: '15px', textDecoration: 'none',
              borderBottom: '1px solid rgba(255,255,255,.06)',
            }}>{t('nav.pastEvents')}</a>

            {/* Lang */}
            <div style={{ display: 'flex', gap: '8px', margin: '16px 0 12px' }}>
              {LANGUAGES.map(l => (
                <button key={l.code} onClick={() => { setLang(l.code); setMobileOpen(false) }} style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  background: lang === l.code ? 'rgba(212,175,55,.15)' : 'rgba(255,255,255,.05)',
                  border: `1px solid ${lang === l.code ? 'rgba(212,175,55,.4)' : 'rgba(255,255,255,.1)'}`,
                  color: lang === l.code ? 'var(--gold)' : 'rgba(255,255,255,.65)',
                  padding: '8px 16px', borderRadius: '20px', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: '14px', fontWeight: lang === l.code ? '600' : '400',
                }}>
                  <img src={l.flag} alt={l.name} style={{ width: '20px', height: '13px', borderRadius: '2px', objectFit: 'cover' }} />
                  {l.label}
                </button>
              ))}
            </div>

            {/* Auth */}
            {profile ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => { onDashboardClick(); setMobileOpen(false) }} style={{ flex: 1, background: 'var(--gold)', color: 'var(--ink)', border: 'none', padding: '12px', borderRadius: '8px', fontFamily: 'inherit', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
                  {t('nav.dashboard')}
                </button>
                <button onClick={() => { handleLogout(); setMobileOpen(false) }} style={{ background: 'rgba(255,255,255,.08)', color: '#fff', border: '1px solid rgba(255,255,255,.15)', padding: '12px 16px', borderRadius: '8px', fontFamily: 'inherit', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <LogOut size={14} /> {t('nav.signout')}
                </button>
              </div>
            ) : (
              <button onClick={() => { onLoginClick(); setMobileOpen(false) }} style={{ width: '100%', background: 'var(--gold)', color: 'var(--ink)', border: 'none', padding: '12px', borderRadius: '8px', fontFamily: 'inherit', fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}>
                {t('nav.login')}
              </button>
            )}
          </div>
        )}
      </nav>

      <style>{`
        /* ── LARGE: ≥ 1100px — everything visible ── */
        @media (min-width: 1100px) {
          .hamburger      { display: none !important; }
          .nav-links      { display: flex !important; }
          .nav-lang       { display: flex !important; }
          .logo-full      { display: block !important; }
          .logo-short     { display: none !important; }
          .lang-label     { display: inline !important; }
          .dash-label     { display: inline !important; }
          .login-label    { display: inline !important; }
        }

        /* ── MEDIUM: 700px – 1099px — links visible, labels hidden ── */
        @media (min-width: 700px) and (max-width: 1099px) {
          .hamburger      { display: none !important; }
          .nav-links      { display: flex !important; }
          .nav-lang       { display: flex !important; }
          .logo-full      { display: none !important; }
          .logo-short     { display: block !important; }
          .lang-label     { display: none !important; }
          .dash-label     { display: none !important; }
          .login-label    { display: none !important; }
        }

        /* ── SMALL: < 700px — hamburger only ── */
        @media (max-width: 699px) {
          .nav-inner  { justify-content: space-between !important; gap: 0 !important; }
          .nav-right  { flex: 1 !important; display: flex !important; align-items: center !important; justify-content: space-evenly !important; gap: 0 !important; padding-left: 8px !important; }
          .hamburger      { display: flex !important; }
          .nav-links      { display: none !important; }
          .nav-lang       { display: none !important; }
          .logo-full      { display: none !important; }
          .logo-short     { display: block !important; }
          .lang-label     { display: none !important; }
          .dash-label     { display: none !important; }
          .login-label    { display: none !important; }
        }
      `}</style>
    </>
  )
}
