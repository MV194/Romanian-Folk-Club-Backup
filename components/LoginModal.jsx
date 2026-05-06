import { useState, useMemo } from 'react'
import { X, Eye, EyeOff, Check } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useT, useLang, LANGUAGES } from '../lib/i18n.jsx'

// ── Common / breached passwords ───────────────────────────────────────────────
const COMMON_PASSWORDS = new Set([
  'password','password1','password123','123456','123456789','12345678','1234567',
  'qwerty','qwerty123','abc123','letmein','welcome','monkey','dragon','master',
  'iloveyou','sunshine','princess','football','baseball','superman','batman',
  'pass1234','pass123','test1234','admin123','login123','user1234','hello123',
  'welcome1','changeme','trustno1','shadow','michael','jessica','thomas','andrew',
  'charlie','donald','harley','ranger','solo','starwars','liverpool','arsenal',
  'chelsea','111111','000000','696969','121212','123123','654321','1q2w3e',
])

// ── Rules — each has a regex test and an i18n key ────────────────────────────
const RULES = [
  { key: 'Must be at least 8 characters long',   test: (pw) => pw.length >= 8 },
  { key: 'Include a capital letter',    test: (pw) => /[A-Z]/.test(pw) },
  { key: 'Include a lowercase letter',    test: (pw) => /[a-z]/.test(pw) },
  { key: 'Include at least one number',   test: (pw) => /[0-9]/.test(pw) },
  { key: 'Include at least one special character',  test: (pw) => /[^A-Za-z0-9]/.test(pw) },
  { key: 'Vulnerability Test',test: (pw) => !COMMON_PASSWORDS.has(pw.toLowerCase()) },
]

// ── Score: count how many rules pass ─────────────────────────────────────────
function scorePassword(pw) {
  if (!pw) return 0
  return RULES.filter(r => r.test(pw)).length
}

const SCORE_COLORS = ['', '#e53935', '#fb8c00', '#fdd835', '#43a047', '#2e7d32', '#1b5e20']

// ── Password show/hide input ──────────────────────────────────────────────────
function PasswordInput({ value, onChange, placeholder, style }) {
  const [show, setShow] = useState(false)
  return (
    <div style={{ position: 'relative', marginBottom: style?.marginBottom || '12px' }}>
      <input
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{ ...style, marginBottom: 0, paddingRight: '42px', boxSizing: 'border-box' }}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', display: 'flex', alignItems: 'center', padding: '2px' }}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  )
}

// ── Live requirements checklist + strength bar ────────────────────────────────
function PasswordRequirements({ password, t }) {
  if (!password) return null
  const score = scorePassword(password)
  const color = SCORE_COLORS[Math.min(score, SCORE_COLORS.length - 1)]

  return (
    <div style={{ marginBottom: '14px', marginTop: '-6px' }}>
      {/* Strength bar */}
      <div style={{ display: 'flex', gap: '3px', marginBottom: '10px' }}>
        {RULES.map((_, i) => (
          <div key={i} style={{
            flex: 1, height: '4px', borderRadius: '2px', transition: 'background .25s',
            background: i < score ? color : '#f0e0d0',
          }} />
        ))}
      </div>

      {/* Checklist */}
      <div style={{ background: '#fafafa', border: '1px solid #f0e0d0', borderRadius: '8px', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '4px' }}>
          {t('Password Requirements:')}
        </p>
        {RULES.map(rule => {
          const pass = rule.test(password)
          return (
            <div key={rule.key} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <div style={{
                width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: pass ? '#e8f5e9' : '#ffeef0',
                border: `1px solid ${pass ? '#c8e6c9' : '#ffccd0'}`,
                transition: 'all .2s',
              }}>
                {pass
                  ? <Check size={10} color="#2e7d32" strokeWidth={3} />
                  : <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ffccd0', display: 'block' }} />
                }
              </div>
              <span style={{ fontSize: '12px', color: pass ? '#2e7d32' : 'var(--muted)', transition: 'color .2s' }}>
                {t(rule.key)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main modal ────────────────────────────────────────────────────────────────
export default function LoginModal({ onClose, showToast, onSuccess }) {
  const { signIn, signUp } = useAuth()
  const t = useT()
  const [isSignup, setIsSignup]     = useState(false)
  const [loading, setLoading]       = useState(false)
  const [loginData, setLoginData]   = useState({ email: '', password: '' })
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '' })
  const [error, setError]           = useState('')

  const allRulesPass = useMemo(
    () => RULES.every(r => r.test(signupData.password)),
    [signupData.password]
  )

  const { lang } = useLang()
  const currentLogo = LANGUAGES.find(l => l.code === lang)?.logo || '/logos/logo_en.png'

  const validatePassword = (pw) => {
    for (const rule of RULES) {
      if (!rule.test(pw)) return t(rule.key)
    }
    return null
  }

  const handleLogin = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      await signIn(loginData)
      showToast(t('toast.welcome'))
      onSuccess()
    } catch (err) {
      setError(err.message || 'Invalid email or password')
    } finally { setLoading(false) }
  }

  const handleSignup = async (e) => {
    e.preventDefault(); setError('')
    const pwError = validatePassword(signupData.password)
    if (pwError) { setError(pwError); return }
    setLoading(true)
    try {
      await signUp(signupData)
      showToast(t('login.create'))
      setIsSignup(false)
    } catch (err) {
      setError(err.message || 'Could not create account')
    } finally { setLoading(false) }
  }

  const iSt = {
    width: '100%', padding: '12px 16px',
    border: '1.5px solid #e0d0c0', borderRadius: '8px',
    fontSize: '14px', fontFamily: 'inherit',
    marginBottom: '12px', outline: 'none', transition: '.2s',
    boxSizing: 'border-box',
  }

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.72)', backdropFilter:'blur(4px)', zIndex:2001, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:'16px', padding:'36px', maxWidth:'420px', width:'100%', position:'relative', borderTop:'5px solid var(--red)', maxHeight:'90vh', overflowY:'auto' }}>
        <button onClick={onClose} style={{ position:'absolute', top:'14px', right:'14px', background:'none', border:'none', cursor:'pointer', color:'#aaa' }}>
          <X size={20}/>
        </button>

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',    // Changed from 'right' to 'center' and fixed capitalization
          justifyContent: 'center', // Ensures vertical centering if the div has a height
          textAlign: 'center', 
          marginBottom: '6px', 
          fontSize: '40px' 
        }}>
          <img src={currentLogo} alt="Logo" style={{ width: '90px', height: '90px' }} />
        </div>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'24px', color:'var(--ink)', marginBottom:'5px', textAlign:'center' }}>
          {isSignup ? t('Sign Up & Join!') : t('Welcome!')}
        </h2>
        <p style={{ textAlign:'center', color:'var(--muted)', fontSize:'13px', marginBottom:'20px' }}>
          {isSignup ? t('Sign Up!') : t('Log In!')}
        </p>

        {error && (
          <div style={{ background:'#ffeef0', border:'1px solid #ffccd0', borderRadius:'8px', padding:'10px 14px', marginBottom:'14px', fontSize:'13px', color:'var(--red)', lineHeight:1.5 }}>
            {error}
          </div>
        )}

        {!isSignup ? (
          <form onSubmit={handleLogin}>
            <input style={iSt} type="email" placeholder={t('Email...')} value={loginData.email} onChange={e => setLoginData({...loginData,email:e.target.value})} required/>
            <PasswordInput style={iSt} placeholder={t('Password...')} value={loginData.password} onChange={e => setLoginData({...loginData,password:e.target.value})}/>
            <button type="submit" disabled={loading} style={{ width:'100%', background:'var(--red)', color:'#fff', border:'none', padding:'13px', borderRadius:'8px', fontFamily:'inherit', fontWeight:'500', fontSize:'15px', cursor:loading?'default':'pointer', opacity:loading?.7:1, transition:'.2s' }}>
              {loading ? t('Logging in!') : t('Log in!')}
            </button>
            <p style={{ textAlign:'center', marginTop:'14px', fontSize:'13px', color:'#888' }}>
              {t("Don't have an account yet? ")}{' '}
              <button type="button" onClick={() => { setIsSignup(true); setError('') }} style={{ background:'none', border:'none', color:'var(--red)', cursor:'pointer', fontWeight:'600', fontFamily:'inherit', fontSize:'13px' }}>
                {t('Create an account!')}
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleSignup}>
            <input style={iSt} type="text"  placeholder={t('Full Name...')} value={signupData.name}  onChange={e => setSignupData({...signupData,name:e.target.value})}  required/>
            <input style={iSt} type="email" placeholder={t('Email...')}    value={signupData.email} onChange={e => setSignupData({...signupData,email:e.target.value})} required/>
            <PasswordInput
              style={iSt}
              placeholder={t('Password...')}
              value={signupData.password}
              onChange={e => setSignupData({...signupData,password:e.target.value})}
            />
            <PasswordRequirements password={signupData.password} t={t} />
            <button
              type="submit"
              disabled={loading || !allRulesPass}
              style={{ width:'100%', background: allRulesPass ? 'var(--red)' : '#ccc', color:'#fff', border:'none', padding:'13px', borderRadius:'8px', fontFamily:'inherit', fontWeight:'500', fontSize:'15px', cursor:(loading||!allRulesPass)?'default':'pointer', transition:'.2s' }}
            >
              {loading ? t('Creating Account!') : t('Create Account!')}
            </button>
            <p style={{ textAlign:'center', marginTop:'14px', fontSize:'13px', color:'#888' }}>
              {t('Already have an account?')}{' '}
              <button type="button" onClick={() => { setIsSignup(false); setError('') }} style={{ background:'none', border:'none', color:'var(--red)', cursor:'pointer', fontWeight:'600', fontFamily:'inherit', fontSize:'13px' }}>
                {t('Log back in!')}
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
