import { Calendar, MapPin, CheckCircle, ChevronRight } from 'lucide-react'
import type { Event, RegistrationStatus } from '../types'
import { useT } from '../lib/i18n.jsx'

interface EventCardProps {
  event:        Event
  status:       RegistrationStatus
  isPast?:      boolean
  onRegister:   (ev: Event) => void
  onUnregister: (ev: Event) => void
  onConfirm:    (ev: Event) => void
  onClick:      (ev: Event) => void
}

export default function EventCard({
  event: ev, status, isPast = false,
  onRegister, onUnregister, onConfirm, onClick,
}: EventCardProps) {
  const t = useT()
  const regCount  = ev._regCount       ?? 0
  const confCount = ev._confirmedCount ?? 0
  const cap       = ev.capacity        ?? 0
  const isFull    = cap > 0 && regCount >= cap
  const pct       = cap > 0 ? Math.min(100, Math.round((regCount / cap) * 100)) : 0

  const isRegistered = status === 'registered' || status === 'confirmed'
  const isConfirmed  = status === 'confirmed'

  const spotsLabel = isPast
    ? t('events.past')
    : isFull
      ? t('events.full')
      : cap > 0
        ? `${cap - regCount} ${t('events.spotsLeft')}`
        : t('events.open')

  return (
    <div
      style={{
        background: '#fff', borderRadius: '14px', overflow: 'hidden',
        border: '1px solid #f0e4d4', transition: 'transform .25s, box-shadow .25s',
        boxShadow: '0 2px 12px rgba(0,0,0,.04)',
        opacity: isPast ? 0.85 : 1, cursor: 'default',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,.1)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,.04)' }}
    >
      {/* Banner */}
      <div role="button" tabIndex={0} onClick={() => onClick(ev)} onKeyDown={e => e.key === 'Enter' && onClick(ev)}
        style={{ cursor: 'pointer', position: 'relative', outline: 'none' }}
      >
        {ev.image_url
          ? <img src={ev.image_url} alt={ev.title} style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }} />
          : <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px', background: 'linear-gradient(135deg,var(--parchment),#f5dfc0)' }}>🎭</div>
        }
        <div style={{
          position: 'absolute', bottom: '12px', right: '12px',
          background: isPast ? 'rgba(0,0,0,.55)' : isFull ? 'var(--red)' : 'var(--gold)',
          color: (isPast || isFull) ? '#fff' : 'var(--ink)',
          fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: '20px',
          backdropFilter: 'blur(4px)',
        }}>
          {spotsLabel}
        </div>
        {isConfirmed && (
          <div style={{ position: 'absolute', top: '12px', left: '12px', background: '#2e7d32', color: '#fff', fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle size={11} /> {t('events.confirmed')}
          </div>
        )}
      </div>

      <div style={{ padding: '22px' }}>
        {/* Type badge */}
        <div style={{ display: 'inline-block', background: isPast ? '#f5f5f5' : '#FFF0F0', color: isPast ? '#888' : 'var(--red)', fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '500', marginBottom: '10px', border: `1px solid ${isPast ? '#e0e0e0' : '#ffd0d0'}` }}>
          {isPast ? t('events.past') : t('events.upcoming')}
        </div>

        {/* Title */}
        <h3 role="button" tabIndex={0} onClick={() => onClick(ev)} onKeyDown={e => e.key === 'Enter' && onClick(ev)}
          style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.15rem', color: 'var(--ink)', marginBottom: '10px', cursor: 'pointer', lineHeight: 1.3, outline: 'none' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--red)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink)')}
        >{ev.title}</h3>

        {/* Meta */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '12px' }}>
          {ev.date && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', color: 'var(--muted)' }}>
              <Calendar size={13} color="var(--red)" />
              <span>{ev.date}{ev.time ? ' ' + t('time.at') + ' ' + ev.time : ''}</span>
            </div>
          )}
          {ev.location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', color: 'var(--muted)' }}>
              <MapPin size={13} color="var(--red)" />
              <span>{ev.location}</span>
            </div>
          )}
        </div>

        {ev.description && (
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {ev.description}
          </p>
        )}

        {/* Counts + bar */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div style={{ display: 'flex', gap: '14px' }}>
              <CountPill label={t('events.registered')} value={regCount}  color="var(--red)" />
              <CountPill label={t('events.confirmed')}  value={confCount} color="#2e7d32" />
            </div>
            {cap > 0 && <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{cap} {t('events.capacity')}</span>}
          </div>
          <div style={{ height: '5px', background: '#f0e8e0', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: '3px', transition: 'width .4s ease', background: isFull ? 'var(--red)' : 'linear-gradient(90deg,var(--gold),var(--red))', width: cap > 0 ? pct + '%' : '0%' }} />
          </div>
          {confCount > 0 && cap > 0 && (
            <div style={{ height: '3px', background: 'transparent', borderRadius: '3px', marginTop: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: '3px', background: '#2e7d32', width: Math.min(100, Math.round((confCount / cap) * 100)) + '%', transition: 'width .4s ease', opacity: .7 }} />
            </div>
          )}
        </div>

        {/* Buttons */}
        {!isPast ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            <button
              onClick={() => isRegistered ? onUnregister(ev) : onRegister(ev)}
              disabled={!isRegistered && isFull}
              style={{
                width: '100%', border: 'none', padding: '10px', borderRadius: '8px',
                fontFamily: 'inherit', fontSize: '13px', fontWeight: '500', transition: '.2s',
                cursor: (!isRegistered && isFull) ? 'default' : 'pointer',
                background: isRegistered ? '#e8f5e9' : isFull ? '#f5f5f5' : 'var(--red)',
                color:      isRegistered ? '#2e7d32' : isFull ? '#aaa'    : '#fff',
                outline:    isRegistered ? '1px solid #c8e6c9' : 'none',
              }}
            >
              {isRegistered ? t('events.cancel') : isFull ? t('events.full') : t('events.register')}
            </button>

            {status === 'registered' && (
              <button
                onClick={() => onConfirm(ev)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', fontFamily: 'inherit', fontSize: '13px', fontWeight: '500', cursor: 'pointer', background: '#e8f5e9', color: '#2e7d32', border: '1px solid #c8e6c9', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: '.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#2e7d32'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#e8f5e9'; e.currentTarget.style.color = '#2e7d32' }}
              >
                <CheckCircle size={14} /> {t('events.confirm')}
              </button>
            )}

            <button
              onClick={() => onClick(ev)}
              style={{ width: '100%', padding: '8px', borderRadius: '8px', fontFamily: 'inherit', fontSize: '12px', cursor: 'pointer', background: 'none', color: 'var(--muted)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', transition: '.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
            >
              {t('events.details')} <ChevronRight size={13} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onClick(ev)}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', fontFamily: 'inherit', fontSize: '13px', cursor: 'pointer', background: 'var(--parchment)', color: 'var(--muted)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            {t('events.details')} <ChevronRight size={13} />
          </button>
        )}
      </div>
    </div>
  )
}

function CountPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
      <span style={{ fontWeight: '700', color }}>{value}</span>
      <span style={{ color: 'var(--muted)' }}>{label}</span>
    </div>
  )
}
