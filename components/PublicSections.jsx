import { useState, useEffect } from 'react'
import { Calendar, Users } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useT } from '../lib/i18n.jsx'
import StarRating from './StarRating'

// ─── HeroSection ──────────────────────────────────────────────────────────────
// All text comes from t() — fully translated, no more hardcoded content prop strings
export function HeroSection({ onScrollTo, onLoginClick, onDashboardClick }) {
  const { profile } = useAuth()
  const t = useT()

  return (
    <section id="home" style={{
      minHeight: '100vh', paddingTop: 'var(--nav-h)',
      background: 'linear-gradient(160deg,#1A0A00 0%,#3D1000 50%,#1A0A00 100%)',
      display: 'flex', alignItems: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Grid pattern */}
      <div style={{ position:'absolute', inset:0, opacity:.05, backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 40px,var(--gold) 40px,var(--gold) 41px),repeating-linear-gradient(90deg,transparent,transparent 40px,var(--gold) 40px,var(--gold) 41px)' }}/>
      {/* Decorative circles — hidden on small screens */}
      <div style={{ position:'absolute', right:'-80px', top:'50%', transform:'translateY(-50%)', width:'500px', height:'500px', borderRadius:'50%', border:'1px solid rgba(212,175,55,.12)', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', right:'-40px', top:'50%', transform:'translateY(-50%)', width:'380px', height:'380px', borderRadius:'50%', border:'1px solid rgba(212,175,55,.2)', pointerEvents:'none' }}/>

      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'clamp(40px,8vw,80px) 24px', position:'relative', zIndex:1, width:'100%' }}>

        {/* Badge */}
        <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(212,175,55,.15)', border:'1px solid rgba(212,175,55,.3)', borderRadius:'20px', padding:'6px 16px', color:'var(--gold)', fontSize:'clamp(10px,1.2vw,12px)', letterSpacing:'.1em', textTransform:'uppercase', marginBottom:'clamp(16px,3vw,24px)', flexWrap:'nowrap' }}>
          🪕 {t('hero.badge')}
        </div>

        {/* Title */}
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(2.2rem,6vw,5rem)', color:'#fff', lineHeight:1.05, maxWidth:'700px', marginBottom:'clamp(12px,2vw,20px)', wordBreak:'break-word' }}>
          KW{' '}
          <em style={{ color:'var(--gold)', fontStyle:'normal' }}>
            {t('hero.title').replace('KW ', '')}
          </em>
        </h1>

        {/* Subtitle */}
        <p style={{ fontFamily:"'Crimson Pro',serif", fontSize:'clamp(1rem,2.5vw,1.45rem)', color:'rgba(255,255,255,.75)', maxWidth:'560px', marginBottom:'clamp(10px,1.5vw,16px)', lineHeight:1.65 }}>
          {t('hero.subtitle')}
        </p>

        {/* Description */}
        <p style={{ fontSize:'clamp(13px,1.5vw,15px)', color:'rgba(255,255,255,.5)', maxWidth:'480px', marginBottom:'clamp(24px,4vw,40px)', lineHeight:1.7 }}>
          {t('hero.description')}
        </p>

        {/* CTA buttons */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:'12px' }}>
          <button onClick={() => onScrollTo('events')} style={{ background:'var(--gold)', color:'var(--ink)', border:'none', padding:'clamp(11px,1.5vw,14px) clamp(20px,3vw,32px)', borderRadius:'8px', fontFamily:'inherit', fontWeight:'500', fontSize:'clamp(13px,1.4vw,15px)', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px', transition:'.2s', whiteSpace:'nowrap' }}>
            <Calendar size={16}/> {t('hero.viewEvents')}
          </button>
          <button onClick={() => profile ? onDashboardClick() : onLoginClick()} style={{ background:'transparent', color:'#fff', border:'1.5px solid rgba(255,255,255,.4)', padding:'clamp(11px,1.5vw,14px) clamp(20px,3vw,32px)', borderRadius:'8px', fontFamily:'inherit', fontSize:'clamp(13px,1.4vw,15px)', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px', transition:'.2s', whiteSpace:'nowrap' }}>
            <Users size={16}/> {profile ? t('hero.myDash') : t('hero.joinClub')}
          </button>
        </div>

        {/* Stats */}
        <div style={{ display:'flex', gap:'clamp(20px,4vw,40px)', marginTop:'clamp(40px,6vw,64px)', paddingTop:'clamp(24px,4vw,40px)', borderTop:'1px solid rgba(212,175,55,.2)', flexWrap:'wrap' }}>
          {[
            ['hero.stat1.val','hero.stat1.lbl'],
            ['hero.stat2.val','hero.stat2.lbl'],
            ['hero.stat3.val','hero.stat3.lbl'],
            ['hero.stat4.val','hero.stat4.lbl'],
          ].map(([v,l]) => (
            <div key={l} style={{ minWidth:'60px' }}>
              <span style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(1.6rem,3vw,2.4rem)', color:'var(--gold)', display:'block' }}>{t(v)}</span>
              <span style={{ fontSize:'clamp(9px,1vw,11px)', color:'rgba(255,255,255,.45)', textTransform:'uppercase', letterSpacing:'.08em' }}>{t(l)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── AboutSection ─────────────────────────────────────────────────────────────
// Uses t() for both labels AND body text — fully translated
export function AboutSection({ content }) {
  const t = useT()
  const cards = [
    { icon:'🎯', titleKey:'about.mission', bodyKey:'about.missionText', body: content?.mission },
    { icon:'📖', titleKey:'about.history', bodyKey:'about.historyText', body: content?.history },
    { icon:'💎', titleKey:'about.values',  bodyKey:'about.valuesText',  body: content?.values, italic:true },
  ]
  return (
    <section id="about" style={{ padding:'clamp(60px,8vw,100px) 0', background:'var(--parchment)' }}>
      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'0 24px' }}>
        <SectionHeader label={t('about.label')} title={t('about.title')} sub={t('about.sub')}/>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:'20px', marginTop:'clamp(32px,5vw,56px)' }}>
          {cards.map(c => (
            <div key={c.titleKey} style={{ background:'#fff', borderRadius:'12px', padding:'clamp(20px,3vw,32px)', borderTop:'4px solid var(--red)', boxShadow:'0 2px 12px rgba(0,0,0,.04)' }}>
              <div style={{ fontSize:'28px', marginBottom:'14px' }}>{c.icon}</div>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(1rem,1.8vw,1.25rem)', color:'var(--ink)', marginBottom:'10px' }}>{t(c.titleKey)}</h3>
              {/* Use translation if available, fall back to admin-edited content */}
              <p style={{ lineHeight:1.75, color:'var(--muted)', fontFamily:c.italic?"'Crimson Pro',serif":'inherit', fontStyle:c.italic?'italic':'normal', fontSize:c.italic?'clamp(0.9rem,1.2vw,1rem)':'clamp(12px,1.2vw,14px)' }}>
                {t(c.bodyKey) !== c.bodyKey ? t(c.bodyKey) : c.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── TestimonialsSection ──────────────────────────────────────────────────────
export function TestimonialsSection() {
  const t = useT()
  const [rows, setRows] = useState([])

  useEffect(() => {
    supabase.from('testimonials').select('*').eq('status','approved')
      .order('created_at',{ascending:false})
      .then(({ data }) => setRows(data || []))
  }, [])

  const nameToColor = (name = '') => {
    const palette = ['#C41E3A','#1B4D3E','#D4AF37','#1A237E','#4A0072','#BF360C']
    let hash = 0
    for (const ch of name) hash = ch.charCodeAt(0) + ((hash << 5) - hash)
    return palette[Math.abs(hash) % palette.length]
  }

  return (
    <section id="testimonials" style={{ padding:'clamp(60px,8vw,100px) 0', background:'var(--parchment)' }}>
      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'0 24px' }}>
        <SectionHeader label={t('test.label')} title={t('test.title')} sub={t('test.sub')}/>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'20px', marginTop:'clamp(32px,5vw,56px)' }}>
          {rows.length === 0 && (
            <p style={{ fontFamily:"'Crimson Pro',serif", fontStyle:'italic', color:'var(--muted)' }}>{t('test.empty')}</p>
          )}
          {rows.map(row => {
            const letters = row.author_name?.split(' ').filter(Boolean).map(w=>w[0]).slice(0,2).join('').toUpperCase() || '??'
            return (
              <div key={row.id} style={{ background:'#fff', borderRadius:'12px', padding:'clamp(18px,2.5vw,28px)', border:'1px solid var(--border)' }}>
                <div style={{ marginBottom:'10px' }}><StarRating value={row.rating ?? 5} readOnly size={16} /></div>
                <p style={{ fontFamily:"'Crimson Pro',serif", fontSize:'clamp(0.9rem,1.2vw,1rem)', fontStyle:'italic', color:'var(--text)', lineHeight:1.7, marginBottom:'18px' }}>"{row.text}"</p>
                <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                  <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:nameToColor(row.author_name), display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'700', color:'#fff', flexShrink:0 }}>{letters}</div>
                  <div>
                    <div style={{ fontWeight:'500', fontSize:'13px', color:'var(--ink)' }}>{row.author_name}</div>
                    <div style={{ fontSize:'11px', color:'var(--muted)' }}>{row.created_at?.split('T')[0]}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── ContactSection ───────────────────────────────────────────────────────────
export function ContactSection({ content, showToast }) {
  const t = useT()
  const [form, setForm]       = useState({ name:'', email:'', message:'' })
  const [sending, setSending] = useState(false)
  const [sent, setSent]       = useState(false)

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) { showToast(t('contact.namePh')); return }
    setSending(true)
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-contact`,
        { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setSent(true)
      setForm({ name:'', email:'', message:'' })
      showToast(t('toast.msgSent'))
    } catch {
      showToast(t('toast.msgFail') + ' ' + content.email)
    } finally { setSending(false) }
  }

  const iSt = { width:'100%', padding:'11px 14px', border:'1.5px solid #e0d0c0', borderRadius:'8px', fontSize:'clamp(13px,1.3vw,14px)', fontFamily:'inherit', marginBottom:'12px', outline:'none', transition:'.2s', boxSizing:'border-box' }

  return (
    <section id="contact" style={{ padding:'clamp(60px,8vw,100px) 0', background:'var(--cream)' }}>
      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'0 24px' }}>
        <SectionHeader label={t('contact.label')} title={t('contact.title')} sub={t('contact.sub')}/>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:'clamp(32px,5vw,60px)', marginTop:'clamp(32px,5vw,56px)', alignItems:'start' }}>

          <div style={{ display:'flex', flexDirection:'column', gap:'clamp(16px,2.5vw,24px)' }}>
            {[
              ['📧', t('contact.email'),    content.email],
              ['📞', t('contact.phone'),    content.phone],
              ['📍', t('contact.address'),  content.address],
              ['🕐', t('contact.meetings'), t('contact.meetTime')],
            ].map(([icon, label, val]) => (
              <div key={label} style={{ display:'flex', gap:'14px', alignItems:'flex-start' }}>
                <div style={{ width:'42px', height:'42px', background:'var(--parchment)', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', flexShrink:0, border:'1px solid var(--border)' }}>{icon}</div>
                <div>
                  <div style={{ fontSize:'11px', textTransform:'uppercase', letterSpacing:'.08em', color:'var(--muted)', marginBottom:'3px' }}>{label}</div>
                  <div style={{ fontSize:'clamp(13px,1.4vw,15px)', color:'var(--text)', fontWeight:'500', wordBreak:'break-word' }}>{val}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background:'#fff', borderRadius:'14px', padding:'clamp(20px,3vw,36px)', border:'1px solid var(--border)' }}>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(1.1rem,2vw,1.4rem)', color:'var(--ink)', marginBottom:'18px' }}>{t('contact.formTitle')}</h3>
            {sent ? (
              <div style={{ textAlign:'center', padding:'28px 0' }}>
                <div style={{ fontSize:'44px', marginBottom:'14px' }}>✉️</div>
                <h4 style={{ fontFamily:"'Playfair Display',serif", color:'var(--ink)', fontSize:'1.1rem', marginBottom:'8px' }}>{t('contact.sentTitle')}</h4>
                <p style={{ color:'var(--muted)', fontSize:'13px', lineHeight:1.65, marginBottom:'18px' }}>{t('contact.sentBody')}</p>
                <button onClick={() => setSent(false)} style={{ background:'none', border:'1.5px solid var(--border)', color:'var(--muted)', padding:'8px 18px', borderRadius:'8px', fontFamily:'inherit', fontSize:'13px', cursor:'pointer' }}>
                  {t('contact.sendAnother')}
                </button>
              </div>
            ) : (
              <>
                <input type="text"  placeholder={t('contact.namePh')}  value={form.name}    onChange={e => setForm({...form,name:e.target.value})}    style={iSt}/>
                <input type="email" placeholder={t('contact.emailPh')} value={form.email}   onChange={e => setForm({...form,email:e.target.value})}   style={iSt}/>
                <textarea          placeholder={t('contact.msgPh')}   value={form.message} onChange={e => setForm({...form,message:e.target.value})} style={{...iSt,minHeight:'110px',resize:'vertical',marginBottom:'14px'}}/>
                <button onClick={handleSubmit} disabled={sending} style={{ width:'100%', background:sending?'#aaa':'var(--red)', color:'#fff', border:'none', padding:'clamp(10px,1.5vw,13px)', borderRadius:'8px', fontFamily:'inherit', fontWeight:'500', fontSize:'clamp(13px,1.4vw,15px)', cursor:sending?'default':'pointer', transition:'.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
                  {sending ? <><Spinner/> {t('contact.sending')}</> : t('contact.send')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function Spinner() {
  return (
    <div style={{ width:'14px', height:'14px', border:'2px solid rgba(255,255,255,.3)', borderTop:'2px solid #fff', borderRadius:'50%', animation:'spin .7s linear infinite' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
export function Footer({ onScrollTo }) {
  const t = useT()
  const sections = [
    { key:'home',         lbl:'nav.home'         },
    { key:'about',        lbl:'nav.about'        },
    { key:'events',       lbl:'nav.events'       },
    { key:'gallery',      lbl:'nav.gallery'      },
    { key:'testimonials', lbl:'nav.testimonials' },
    { key:'contact',      lbl:'nav.contact'      },
  ]
  return (
    <footer style={{ background:'var(--ink)', padding:'clamp(32px,5vw,48px) 0', borderTop:'1px solid rgba(212,175,55,.2)', textAlign:'center' }}>
      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'0 24px' }}>
        <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:'12px', marginBottom:'16px' }}>
          <div style={{ width:'34px', height:'34px', background:'var(--gold)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', flexShrink:0 }}>🪕</div>
          <span style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(13px,1.5vw,15px)', color:'rgba(255,255,255,.9)' }}>KW Romanian Folk Club</span>
        </div>
        <div style={{ display:'flex', justifyContent:'center', flexWrap:'wrap', gap:'6px 16px', marginBottom:'16px' }}>
          {sections.map(s => (
            <button key={s.key} onClick={() => onScrollTo(s.key)} style={{ background:'none', border:'none', color:'rgba(255,255,255,.45)', fontFamily:'inherit', fontSize:'clamp(11px,1.2vw,13px)', cursor:'pointer', transition:'.2s', padding:'2px 0' }}
              onMouseEnter={e => e.target.style.color='var(--gold)'}
              onMouseLeave={e => e.target.style.color='rgba(255,255,255,.45)'}
            >{t(s.lbl)}</button>
          ))}
        </div>
        <p style={{ fontSize:'clamp(10px,1.1vw,12px)', color:'rgba(255,255,255,.25)', lineHeight:1.6 }}>{t('footer.copyright')}</p>
      </div>
    </footer>
  )
}

// ─── SectionHeader ────────────────────────────────────────────────────────────
export function SectionHeader({ label, title, sub, dark }) {
  return (
    <div>
      <div style={{ display:'inline-flex', alignItems:'center', gap:'10px', color:dark?'var(--gold)':'var(--red)', fontSize:'clamp(9px,1vw,11px)', textTransform:'uppercase', letterSpacing:'.15em', marginBottom:'10px' }}>
        <span style={{ display:'block', width:'24px', height:'1px', background:'currentColor' }}/>
        {label}
        <span style={{ display:'block', width:'24px', height:'1px', background:'currentColor' }}/>
      </div>
      <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(1.5rem,4vw,2.8rem)', color:dark?'#fff':'var(--ink)', marginBottom:'10px', lineHeight:1.1 }}>{title}</h2>
      {sub && <p style={{ fontFamily:"'Crimson Pro',serif", fontStyle:'italic', fontSize:'clamp(0.95rem,1.5vw,1.15rem)', color:dark?'rgba(255,255,255,.5)':'var(--muted)', maxWidth:'480px' }}>{sub}</p>}
    </div>
  )
}
