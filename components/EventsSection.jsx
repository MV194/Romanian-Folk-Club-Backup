import { useState } from 'react'
import { useEvents } from '../hooks/useEvents'
import { SectionHeader } from './PublicSections'
import { useT } from '../lib/i18n.jsx'
import EventCard from './EventCard'
import EventModal from './EventModal'

export default function EventsSection({ showToast, onLoginClick }) {
  const t = useT()
  const [selectedEvent, setSelectedEvent] = useState(null)

  const {
    upcomingEvents, loading,
    getStatus,
    handleRegister, handleUnregister, handleConfirm,
  } = useEvents(onLoginClick, showToast, t)

  return (
    <section id="events" style={{ padding: '100px 0', background: 'var(--cream)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <SectionHeader
          label={t('events.label')}
          title={t('events.title')}
          sub={t('events.sub')}
        />

        {loading && (
          <p style={{ color: 'var(--muted)', marginTop: '40px', fontFamily: "'Crimson Pro',serif", fontStyle: 'italic' }}>
            {t('events.loading')}
          </p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: '24px', marginTop: '56px' }}>
          {!loading && upcomingEvents.length === 0 && (
            <p style={{ fontFamily: "'Crimson Pro',serif", fontStyle: 'italic', color: 'var(--muted)', fontSize: '1.1rem' }}>
              {t('events.none')}
            </p>
          )}
          {upcomingEvents.map(ev => (
            <EventCard
              key={ev.id}
              event={ev}
              status={getStatus(ev.id)}
              onRegister={handleRegister}
              onUnregister={handleUnregister}
              onConfirm={handleConfirm}
              onClick={setSelectedEvent}
            />
          ))}
        </div>

        {!loading && (
          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <a href="/events/archive" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              color: 'var(--muted)', fontSize: '14px', textDecoration: 'none',
              border: '1px solid var(--border)', padding: '10px 24px', borderRadius: '8px',
              background: '#fff', transition: '.2s', fontFamily: 'inherit',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' }}
            >
              {t('events.archive')}
            </a>
          </div>
        )}
      </div>

      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          status={getStatus(selectedEvent.id)}
          onClose={() => setSelectedEvent(null)}
          onRegister={handleRegister}
          onUnregister={handleUnregister}
          onConfirm={handleConfirm}
        />
      )}
    </section>
  )
}
