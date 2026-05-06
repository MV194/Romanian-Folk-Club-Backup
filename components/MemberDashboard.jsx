import { useState, useEffect } from 'react'
import { Calendar, Palette, BookOpen, MessageSquare, X, LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useT } from '../lib/i18n.jsx'
import StarRating from './StarRating'
import DownloadButton from './DownloadButton'

const COLORS = ['#C41E3A','#8B0000','#D4AF37','#1B4D3E','#1A237E','#4A0072','#BF360C','#212121']

export default function MemberDashboard({ showToast, onClose }) {
  const { profile, updateProfile, signOut } = useAuth()
  const t = useT()
  const [activeTab, setActiveTab]         = useState('schedule')
  const [myEvents, setMyEvents]           = useState([])
  const [resources, setResources]         = useState([])
  const [eventsLoading, setEventsLoading] = useState(true)
  const [storyText, setStoryText]         = useState('')
  const [rating, setRating]               = useState(5)
  const [avatarColor,   setAvatarColor]   = useState(profile?.avatar_color   || '#C41E3A')
  const [avatarLetters, setAvatarLetters] = useState(profile?.avatar_letters || '')

  const TABS = [
    { key: 'schedule',  icon: Calendar,      label: t('member.tab.sched') },
    { key: 'avatar',    icon: Palette,       label: t('member.tab.avatar') },
    { key: 'resources', icon: BookOpen,      label: t('member.tab.res') },
    { key: 'feedback',  icon: MessageSquare, label: t('member.tab.story') },
  ]

  useEffect(() => {
    if (!profile) return
    supabase.from('event_registrations').select('event_id, events(*)').eq('user_id', profile.id)
      .then(({ data }) => { setMyEvents((data||[]).map(r=>r.events).filter(Boolean)); setEventsLoading(false) })
  }, [profile])

  useEffect(() => {
    supabase.from('resources').select('*').order('created_at',{ascending:false})
      .then(({ data }) => setResources(data||[]))
  }, [])

  const handleUnregister = async (eventId) => {
    await supabase.from('event_registrations').delete().eq('event_id',eventId).eq('user_id',profile.id)
    setMyEvents(prev => prev.filter(e => e.id !== eventId))
    showToast(t('toast.cancelled'))
  }

  const handleAvatarSave = async () => {
    const letters = (avatarLetters||profile?.name?.slice(0,2)||'AB').toUpperCase().slice(0,2)
    await updateProfile({ avatar_color: avatarColor, avatar_letters: letters })
    showToast(t('toast.avatarSaved'))
  }

  const handleStorySubmit = async () => {
    if (!storyText.trim()) { showToast(t('member.story.ph')); return }
    const { error } = await supabase.from('testimonials').insert({
      user_id: profile.id, author_name: profile.name, text: storyText, status: 'pending', rating,
    })
    if (error) { showToast('Error: ' + error.message); return }
    setStoryText('')
    setRating(5)
    showToast(t('toast.storySent'))
  }

  const handleLogout = async () => {
    await signOut(); onClose(); showToast(t('toast.signout'))
  }

  const displayLetters = (avatarLetters||profile?.avatar_letters||profile?.name?.slice(0,2)||'MB').toUpperCase().slice(0,2)

  return (
    <div style={{ position:'fixed', inset:0, zIndex:1500, background:'rgba(26,10,0,.6)', backdropFilter:'blur(6px)', display:'flex', alignItems:'stretch', justifyContent:'flex-end', animation:'fadeIn .2s ease' }}>
      <div style={{ flex:1 }} onClick={onClose} />
      <div style={{ width:'100%', maxWidth:'780px', background:'var(--cream)', display:'flex', flexDirection:'column', height:'100%', boxShadow:'-8px 0 40px rgba(0,0,0,.3)', animation:'slideInRight .25s ease', overflowY:'auto' }}>

        {/* Header */}
        <div style={{ background:'var(--ink)', padding:'24px 28px', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'16px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
              <div style={{ width:'52px', height:'52px', borderRadius:'50%', background:profile?.avatar_color||'var(--red)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', fontWeight:'700', color:'#fff', border:'3px solid var(--gold)', flexShrink:0 }}>
                {profile?.avatar_letters||profile?.name?.slice(0,2).toUpperCase()||'MB'}
              </div>
              <div>
                <h2 style={{ fontFamily:"'Playfair Display',serif", color:'#fff', fontSize:'1.4rem', marginBottom:'2px' }}>
                  {t('member.welcome')}, {profile?.name?.split(' ')[0]}
                </h2>
                <p style={{ color:'rgba(255,255,255,.45)', fontSize:'12px' }}>{t('role.member')} · {profile?.email}</p>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <button onClick={handleLogout} style={{ background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.15)', color:'rgba(255,255,255,.7)', padding:'7px 14px', borderRadius:'8px', cursor:'pointer', fontFamily:'inherit', fontSize:'12px', display:'flex', alignItems:'center', gap:'6px' }}>
                <LogOut size={13}/> {t('nav.signout')}
              </button>
              <button onClick={onClose} style={{ background:'rgba(255,255,255,.1)', border:'none', color:'rgba(255,255,255,.8)', width:'34px', height:'34px', borderRadius:'8px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'.2s' }}>
                <X size={18}/>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginTop:'20px' }}>
            {TABS.map(({ key, icon: Icon, label }) => (
              <button key={key} onClick={() => setActiveTab(key)} style={{
                background: activeTab===key ? 'var(--gold)' : 'rgba(255,255,255,.08)',
                color:      activeTab===key ? 'var(--ink)'  : 'rgba(255,255,255,.65)',
                border:     activeTab===key ? 'none'        : '1px solid rgba(255,255,255,.12)',
                padding:'7px 16px', borderRadius:'20px', cursor:'pointer',
                fontFamily:'inherit', fontSize:'12px', fontWeight: activeTab===key ? '600' : '400',
                display:'flex', alignItems:'center', gap:'6px', transition:'.2s',
              }}>
                <Icon size={13}/> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding:'28px', flex:1 }}>

          {/* Schedule */}
          {activeTab==='schedule' && (
            <Card title={t('member.sched.title')}>
              {eventsLoading && <Muted>Loading…</Muted>}
              {!eventsLoading && myEvents.length===0 && <EmptyState>{t('member.sched.empty')}</EmptyState>}
              {myEvents.map(ev => (
                <div key={ev.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0', borderBottom:'1px solid var(--border)', gap:'12px', flexWrap:'wrap' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
                    {ev.image_url
                      ? <img src={ev.image_url} alt="" style={{ width:'48px', height:'48px', borderRadius:'8px', objectFit:'cover' }}/>
                      : <div style={{ width:'48px', height:'48px', borderRadius:'8px', background:'var(--parchment)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', border:'1px solid var(--border)' }}>🎭</div>
                    }
                    <div>
                      <div style={{ fontWeight:'600', fontSize:'14px', color:'var(--ink)', marginBottom:'3px' }}>{ev.title}</div>
                      <div style={{ fontSize:'12px', color:'var(--muted)' }}>
                        {ev.date && `📅 ${ev.date}`}{ev.time && ` ${t('time.at')} ${ev.time}`}{ev.location && ` · 📍 ${ev.location}`}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleUnregister(ev.id)} style={{ background:'#ffeef0', color:'var(--red)', border:'1px solid #ffccd0', padding:'6px 14px', borderRadius:'8px', cursor:'pointer', fontSize:'12px', fontFamily:'inherit', whiteSpace:'nowrap' }}>
                    {t('member.sched.cancel')}
                  </button>
                </div>
              ))}
              <div style={{ marginTop:'20px', paddingTop:'20px', borderTop:'1px solid var(--border)' }}>
                <button onClick={onClose} style={{ background:'var(--red)', color:'#fff', border:'none', padding:'9px 20px', borderRadius:'8px', cursor:'pointer', fontFamily:'inherit', fontSize:'13px', fontWeight:'500' }}>
                  {t('member.sched.browse')}
                </button>
              </div>
            </Card>
          )}

          {/* Avatar */}
          {activeTab==='avatar' && (
            <div style={{ maxWidth:'420px' }}>
              <Card title={t('member.avatar.title')}>
                <div style={{ textAlign:'center', marginBottom:'28px' }}>
                  <div style={{ width:'90px', height:'90px', borderRadius:'50%', background:avatarColor, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'30px', fontWeight:'700', color:'#fff', margin:'0 auto 12px', border:'4px solid var(--gold)', transition:'.2s' }}>
                    {displayLetters}
                  </div>
                  <p style={{ fontSize:'13px', color:'var(--muted)' }}>{t('member.avatar.preview')}</p>
                </div>
                <FieldLabel>{t('member.avatar.color')}</FieldLabel>
                <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', marginBottom:'20px' }}>
                  {COLORS.map(c => (
                    <div key={c} onClick={() => setAvatarColor(c)} style={{ width:'34px', height:'34px', borderRadius:'50%', background:c, cursor:'pointer', border: avatarColor===c ? '3px solid var(--ink)' : '3px solid transparent', transform: avatarColor===c ? 'scale(1.15)' : 'none', transition:'.2s' }}/>
                  ))}
                </div>
                <FieldLabel>{t('member.avatar.letters')}</FieldLabel>
                <input type="text" maxLength={2}
                  value={avatarLetters||profile?.avatar_letters||''}
                  onChange={e => setAvatarLetters(e.target.value.toUpperCase())}
                  placeholder={profile?.name?.slice(0,2).toUpperCase()||'AB'}
                  style={{ padding:'10px 14px', border:'1.5px solid #e0d0c0', borderRadius:'8px', fontSize:'16px', fontFamily:'inherit', width:'72px', textAlign:'center', outline:'none', marginBottom:'20px', letterSpacing:'.1em' }}
                />
                <br/>
                <button onClick={handleAvatarSave} style={{ background:'var(--red)', color:'#fff', border:'none', padding:'10px 24px', borderRadius:'8px', fontFamily:'inherit', fontWeight:'500', fontSize:'14px', cursor:'pointer' }}>
                  {t('member.avatar.save')}
                </button>
              </Card>
            </div>
          )}

          {/* Resources */}
          {activeTab==='resources' && (
            <Card title={t('member.res.title')}>
              {resources.length===0 && <EmptyState>{t('member.res.empty')}</EmptyState>}
              {resources.map(r => (
                <div key={r.id} style={{ display:'flex', alignItems:'center', gap:'14px', padding:'12px 0', borderBottom:'1px solid var(--border)' }}>
                  <div style={{ width:'38px', height:'38px', borderRadius:'8px', background:'var(--parchment)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', flexShrink:0 }}>
                    {r.type==='PDF'?'📄':r.type==='Video'?'🎬':r.type==='Audio'?'🎵':'📝'}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:'500', fontSize:'14px', color:'var(--text)', marginBottom:'2px' }}>{r.title}</div>
                    <div style={{ fontSize:'12px', color:'var(--muted)' }}>{r.type}{r.description ? ' · '+r.description : ''}</div>
                  </div>
                  {r.file_url && r.file_url!=='#' && (
                    <DownloadButton
                      url={r.file_url}
                      filename={r.title || 'resource'}
                      label={t('download.resource')}
                      style={{ background:'var(--parchment)', color:'var(--text)', border:'1px solid var(--border)', padding:'6px 12px', borderRadius:'8px', fontSize:'12px', fontFamily:'inherit', whiteSpace:'nowrap' }}
                    />
                  )}
                </div>
              ))}
            </Card>
          )}

          {/* Share Story */}
          {activeTab==='feedback' && (
            <div style={{ maxWidth:'640px' }}>
              <Card title={t('member.story.title')}>
                <p style={{ fontFamily:"'Crimson Pro',serif", fontStyle:'italic', fontSize:'1rem', color:'var(--muted)', marginBottom:'16px', lineHeight:1.7 }}>
                  {t('member.story.sub')}
                </p>
                {/* Star rating */}
                <div style={{ marginBottom:'18px' }}>
                  <label style={{ display:'block', fontSize:'12px', textTransform:'uppercase', letterSpacing:'.08em', color:'var(--muted)', fontWeight:'500', marginBottom:'8px' }}>{t('member.story.rating')}</label>
                  <StarRating value={rating} onChange={setRating} size={28} />
                  <p style={{ fontSize:'12px', color:'var(--muted)', marginTop:'6px' }}>{t('member.story.ratingPh')}</p>
                </div>
                <textarea
                  value={storyText} onChange={e => setStoryText(e.target.value)}
                  placeholder={t('member.story.ph')}
                  style={{ width:'100%', padding:'14px', border:'1.5px solid #e0d0c0', borderRadius:'8px', fontSize:'14px', fontFamily:'inherit', minHeight:'140px', resize:'vertical', outline:'none', marginBottom:'16px', lineHeight:1.65, boxSizing:'border-box' }}
                />
                <button onClick={handleStorySubmit} style={{ background:'var(--red)', color:'#fff', border:'none', padding:'10px 24px', borderRadius:'8px', fontFamily:'inherit', fontWeight:'500', fontSize:'14px', cursor:'pointer' }}>
                  {t('member.story.submit')}
                </button>
                <p style={{ fontSize:'12px', color:'var(--muted)', marginTop:'12px' }}>{t('member.story.note')}</p>
              </Card>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from{opacity:0}to{opacity:1} }
        @keyframes slideInRight { from{transform:translateX(40px);opacity:0}to{transform:none;opacity:1} }
      `}</style>
    </div>
  )
}

function Card({ title, children }) {
  return (
    <div style={{ background:'#fff', borderRadius:'12px', border:'1px solid var(--border)', padding:'24px', marginBottom:'16px' }}>
      <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.1rem', color:'var(--ink)', marginBottom:'18px' }}>{title}</h3>
      {children}
    </div>
  )
}
function FieldLabel({ children }) {
  return <label style={{ display:'block', fontSize:'11px', textTransform:'uppercase', letterSpacing:'.08em', color:'var(--muted)', fontWeight:'500', marginBottom:'8px' }}>{children}</label>
}
function EmptyState({ children }) {
  return <p style={{ fontFamily:"'Crimson Pro',serif", fontStyle:'italic', color:'var(--muted)', fontSize:'1rem', padding:'16px 0', textAlign:'center' }}>{children}</p>
}
function Muted({ children }) {
  return <p style={{ color:'var(--muted)', fontSize:'14px' }}>{children}</p>
}
