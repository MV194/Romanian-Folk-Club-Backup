// ── Core domain types ──────────────────────────────────────────────────────────

export interface Event {
  id: number
  title: string
  description: string | null
  date: string          // ISO date string "YYYY-MM-DD"
  time: string | null
  location: string | null
  capacity: number | null
  image_url: string | null
  created_at: string

  // Computed client-side from event_registrations (not DB columns)
  _regCount?: number
  _confirmedCount?: number
}

export interface Profile {
  id: string            // uuid
  name: string
  email: string
  role: 'member' | 'admin'
  avatar_color: string
  avatar_letters: string
  created_at: string
}

export interface EventRegistration {
  id: number
  event_id: number
  user_id: string
  confirmed: boolean    // new column — add to DB with: ALTER TABLE event_registrations ADD COLUMN confirmed boolean DEFAULT false;
  registered_at: string
}

// ── Joined shapes (returned by Supabase select with relations) ────────────────

export interface RegistrationWithProfile extends EventRegistration {
  profiles: Pick<Profile, 'id' | 'name' | 'email' | 'avatar_color' | 'avatar_letters'>
}

// ── UI state helpers ──────────────────────────────────────────────────────────

export type RegistrationStatus =
  | 'none'          // not registered
  | 'registered'    // registered but not confirmed
  | 'confirmed'     // registered and confirmed

export function getRegistrationStatus(
  eventId: number,
  registeredIds: Set<number>,
  confirmedIds: Set<number>
): RegistrationStatus {
  if (confirmedIds.has(eventId)) return 'confirmed'
  if (registeredIds.has(eventId)) return 'registered'
  return 'none'
}

export function isUpcoming(event: Event): boolean {
  return event.date >= new Date().toISOString().split('T')[0]
}

export function isPast(event: Event): boolean {
  return event.date < new Date().toISOString().split('T')[0]
}
