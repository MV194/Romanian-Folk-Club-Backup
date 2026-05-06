import { useState, useEffect } from 'react'
import { X, Users, CheckCircle, Mail } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useT } from '../lib/i18n.jsx'
import type { Event, RegistrationWithProfile } from '../types'

interface AdminEventDetailProps {
  event:   Event
  onClose: () => void
}

type ActiveTab = 'registered' | 'confirmed'

export default function AdminEventDetail({ event: ev, onClose }: AdminEventDetailProps) {
  const t = useT()
  const [rows, setRows]       = useState<RegistrationWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<ActiveTab>('registered')  // renamed from 'tab' to avoid shadowing t()

  useEffect(() => {
    supabase
      .from('event_registrations')
      .select('*, profiles(id, name, email, avatar_color, avatar_letters)')
      .eq('event_id', ev.id)
      .then(({ data, error }) => {
        if (error) console.error(error)
        setRows((data as RegistrationWithProfile[]) || [])
        setLoading(false)
      })
  }, [ev.id])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  const registeredRows = rows
  const confirmedRows  = rows.filter(r => r.confirmed)
  const displayRows    = activeTab === 'confirmed' ? confirmedRows : registeredRows

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 3000,
        background: 'rgba(26,10,0,.75)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px', animation: 'modalFadeIn .2s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: '16px',
          maxWidth: '560px', width: '100%', maxHeight: '85vh',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 80px rgba(0,0,0,.4)',
          animation: 'modalSlideUp .25s ease',
        }}
      >
        {/* Header */}
        <div style={{ padding: '24px 24px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
            <div>
              <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)', marginBottom: '6px' }}>
                {t('admin.tab.events')}
              </p>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.3rem', color: 'var(--ink)', lineHeight: 1.2 }}>{ev.title}</h2>
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>{ev.date}{ev.time ? ' ' + t('time.at') + ' ' + ev.time : ''}</p>
            </div>
            <button
              onClick={onClose}
              style={{ background: 'var(--parchment)', border: 'none', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--muted)', transition: '.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#e8d8c8'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--parchment)'}
            >
              <X size={16} />
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <StatChip icon={<Users size={14} />}       label={t('events.registered')} value={registeredRows.length} color="var(--red)"   />
            <StatChip icon={<CheckCircle size={14} />} label={t('events.confirmed')}  value={confirmedRows.length}  color="#2e7d32"       />
            {ev.capacity && <StatChip label={t('events.capacity')} value={ev.capacity} color="var(--muted)" />}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '2px solid var(--parchment)' }}>
            {(['registered', 'confirmed'] as ActiveTab[]).map(tabKey => (
              <button key={tabKey} onClick={() => setActiveTab(tabKey)} style={{
                background: 'none', border: 'none', padding: '10px 20px', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: '13px', fontWeight: '500',
                color:        activeTab === tabKey ? 'var(--red)' : 'var(--muted)',
                borderBottom: activeTab === tabKey ? '2px solid var(--red)' : '2px solid transparent',
                marginBottom: '-2px', transition: '.2s',
              }}>
                {tabKey === 'registered'
                  ? `${t('events.registered')} (${registeredRows.length})`
                  : `${t('events.confirmed')} (${confirmedRows.length})`
                }
              </button>
            ))}
          </div>
        </div>

        {/* Participant list */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '16px 24px 24px' }}>
          {loading && (
            <p style={{ color: 'var(--muted)', fontSize: '14px', padding: '20px 0', fontFamily: "'Crimson Pro',serif", fontStyle: 'italic' }}>
              {t('events.loading')}
            </p>
          )}

          {!loading && displayRows.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>
                {activeTab === 'confirmed' ? '✓' : '👥'}
              </div>
              <p style={{ fontFamily: "'Crimson Pro',serif", fontStyle: 'italic', color: 'var(--muted)', fontSize: '1rem' }}>
                {activeTab === 'confirmed' ? t('test.empty') : t('events.none')}
              </p>
            </div>
          )}

          {!loading && displayRows.map(r => (
            <ParticipantRow key={r.id} row={r} confirmedLabel={t('events.confirmed')} registeredLabel={t('events.registered')} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes modalFadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes modalSlideUp { from { transform: translateY(20px); opacity: 0 } to { transform: none; opacity: 1 } }
      `}</style>
    </div>
  )
}

function ParticipantRow({ row, confirmedLabel, registeredLabel }: { row: RegistrationWithProfile; confirmedLabel: string; registeredLabel: string }) {
  const p        = row.profiles
  const initials = p?.avatar_letters || p?.name?.slice(0, 2).toUpperCase() || '??'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0, background: p?.avatar_color || '#C41E3A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#fff' }}>
        {initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--ink)', marginBottom: '2px' }}>{p?.name || '—'}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--muted)' }}>
          <Mail size={11} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p?.email || '—'}</span>
        </div>
      </div>
      <div style={{
        flexShrink: 0,
        background: row.confirmed ? '#e8f5e9' : '#fff8e1',
        color:      row.confirmed ? '#2e7d32' : '#f57f17',
        border:     `1px solid ${row.confirmed ? '#c8e6c9' : '#ffe082'}`,
        padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '500',
        display: 'flex', alignItems: 'center', gap: '4px',
      }}>
        {row.confirmed ? <><CheckCircle size={11} /> {confirmedLabel}</> : registeredLabel}
      </div>
    </div>
  )
}

function StatChip({ icon, label, value, color }: { icon?: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--parchment)', borderRadius: '8px', padding: '8px 14px', border: '1px solid var(--border)' }}>
      {icon && <span style={{ color, display: 'flex' }}>{icon}</span>}
      <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.1rem', color, lineHeight: 1 }}>{value}</span>
      <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</span>
    </div>
  )
}
