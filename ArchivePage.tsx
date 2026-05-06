import { useState } from 'react'
import { useEvents } from '../hooks/useEvents'
import EventCard from '../components/EventCard'
import EventModal from '../components/EventModal'
import type { Event } from '../types'
import { useT } from '../lib/i18n.jsx'

export default function ArchivePage() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const t = useT()
  const noop = () => {}
  const { pastEvents, loading } = useEvents(noop, noop)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>

      {/* Dark header banner — sits below the fixed navbar */}
      <div style={{ background: 'var(--ink)', paddingTop: 'var(--nav-h)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px 48px' }}>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '13px', color: 'rgba(255,255,255,.4)' }}>
            <a href="/" style={{ color: 'rgba(255,255,255,.4)', textDecoration: 'none', transition: '.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,.4)')}
            >{t("archive.breadHome")}</a>
            <span>/</span>
            <a href="/#events" style={{ color: 'rgba(255,255,255,.4)', textDecoration: 'none', transition: '.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,.4)')}
            >Events</a>
            <span>/</span>
            <span style={{ color: 'var(--gold)' }}>{t("archive.breadArch")}</span>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(212,175,55,.15)', border: '1px solid rgba(212,175,55,.3)', borderRadius: '20px', padding: '6px 16px', color: 'var(--gold)', fontSize: '12px', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '16px' }}>
            {t("archive.label")}
          </div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(2rem,5vw,3.2rem)', color: '#fff', marginBottom: '12px', lineHeight: 1.1 }}>
            {t("archive.title")} <em style={{ color: 'var(--gold)', fontStyle: 'normal' }}>Archive</em>
          </h1>
          <p style={{ fontFamily: "'Crimson Pro',serif", fontStyle: 'italic', fontSize: '1.15rem', color: 'rgba(255,255,255,.55)', maxWidth: '480px' }}>
            {t("archive.sub")}
          </p>
        </div>
      </div>

      {/* Events grid */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 24px' }}>

        {loading && (
          <p style={{ fontFamily: "'Crimson Pro',serif", fontStyle: 'italic', color: 'var(--muted)', fontSize: '1.1rem' }}>
            {t("archive.loading")}
          </p>
        )}

        {!loading && pastEvents.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗓</div>
            <h3 style={{ fontFamily: "'Playfair Display',serif", color: 'var(--ink)', marginBottom: '8px' }}>{t("archive.empty")}</h3>
            <p style={{ color: 'var(--muted)', fontSize: '14px' }}>{t("archive.emptyNote")}</p>
          </div>
        )}

        {!loading && pastEvents.length > 0 && (
          <>
            <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '32px' }}>
              {pastEvents.length} {pastEvents.length === 1 ? t('archive.count1') : t('archive.countN')}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: '24px' }}>
              {pastEvents.map(ev => (
                <EventCard
                  key={ev.id}
                  event={ev}
                  status="none"
                  isPast={true}
                  onRegister={noop}
                  onUnregister={noop}
                  onConfirm={noop}
                  onClick={setSelectedEvent}
                />
              ))}
            </div>
          </>
        )}

        {/* Back link */}
        <div style={{ marginTop: '64px', textAlign: 'center' }}>
          <a href="/#events" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            color: 'var(--muted)', fontSize: '14px', textDecoration: 'none',
            border: '1px solid var(--border)', padding: '10px 24px', borderRadius: '8px',
            background: '#fff', transition: '.2s', fontFamily: 'inherit',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--red)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--red)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--muted)' }}
          >
            {t("archive.back")}
          </a>
        </div>
      </div>

      {/* Read-only modal */}
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          status="none"
          isPast={true}
          onClose={() => setSelectedEvent(null)}
          onRegister={noop}
          onUnregister={noop}
          onConfirm={noop}
        />
      )}
    </div>
  )
}
