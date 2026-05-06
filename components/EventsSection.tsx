// EventsSection — pure display component.
// Modal is rendered in App.jsx at root level, not here.

import { SectionHeader } from './PublicSections'
import EventCard from './EventCard'
import type { Event, RegistrationStatus } from '../types'

interface EventsSectionProps {
  upcomingEvents: Event[]
  loading:        boolean
  getStatus:      (id: number) => RegistrationStatus
  onRegister:     (ev: Event) => void
  onUnregister:   (ev: Event) => void
  onConfirm:      (ev: Event) => void
  onEventClick:   (ev: Event) => void
}

export default function EventsSection({
  upcomingEvents, loading, getStatus,
  onRegister, onUnregister, onConfirm, onEventClick,
}: EventsSectionProps) {
  return (
    <section id="events" style={{ padding: '100px 0', background: 'var(--cream)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <SectionHeader
          label="What's On"
          title="Upcoming Events"
          sub="Join us for authentic Romanian cultural experiences in KW"
        />

        {loading && (
          <p style={{ color: 'var(--muted)', marginTop: '40px', fontFamily: "'Crimson Pro',serif", fontStyle: 'italic' }}>
            Loading events…
          </p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: '24px', marginTop: '56px' }}>
          {!loading && upcomingEvents.length === 0 && (
            <p style={{ fontFamily: "'Crimson Pro',serif", fontStyle: 'italic', color: 'var(--muted)', fontSize: '1.1rem' }}>
              No upcoming events right now — check back soon!
            </p>
          )}
          {upcomingEvents.map(ev => (
            <EventCard
              key={ev.id}
              event={ev}
              status={getStatus(ev.id)}
              onRegister={onRegister}
              onUnregister={onUnregister}
              onConfirm={onConfirm}
              onClick={onEventClick}
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
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--red)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--red)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--muted)' }}
            >
              🗓 View Past Events Archive
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
