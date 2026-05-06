import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { Event, RegistrationStatus } from '../types'
import { getRegistrationStatus, isUpcoming, isPast } from '../types'

interface UseEventsReturn {
  events: Event[]
  upcomingEvents: Event[]
  pastEvents: Event[]
  loading: boolean
  registeredIds: Set<number>
  confirmedIds: Set<number>
  getStatus: (eventId: number) => RegistrationStatus
  handleRegister: (ev: Event) => Promise<void>
  handleUnregister: (ev: Event) => Promise<void>
  handleConfirm: (ev: Event) => Promise<void>
  refetch: () => Promise<void>
}

export function useEvents(
  onLoginClick: () => void,
  showToast: (msg: string) => void,
  t: (key: string) => string = (k) => k,   // optional — defaults to key passthrough
): UseEventsReturn {
  const auth = useAuth()
  const profile = auth?.profile
  const [events, setEvents]               = useState<Event[]>([])
  const [registeredIds, setRegisteredIds] = useState<Set<number>>(new Set())
  const [confirmedIds, setConfirmedIds]   = useState<Set<number>>(new Set())
  const [loading, setLoading]             = useState(true)

  const fetchEvents = useCallback(async () => {
    const { data } = await supabase.from('events').select('*').order('date')
    if (!data) return
    const { data: regData } = await supabase.from('event_registrations').select('event_id, confirmed')
    const regCounts: Record<number, number>       = {}
    const confirmedCounts: Record<number, number> = {}
    ;(regData || []).forEach(r => {
      regCounts[r.event_id] = (regCounts[r.event_id] || 0) + 1
      if (r.confirmed) confirmedCounts[r.event_id] = (confirmedCounts[r.event_id] || 0) + 1
    })
    setEvents(data.map(ev => ({
      ...ev,
      _regCount:       regCounts[ev.id]       || 0,
      _confirmedCount: confirmedCounts[ev.id] || 0,
    })))
    setLoading(false)
  }, [])

  const fetchUserRegistrations = useCallback(async () => {
    if (!profile) { setRegisteredIds(new Set()); setConfirmedIds(new Set()); return }
    const { data } = await supabase.from('event_registrations').select('event_id, confirmed').eq('user_id', profile.id)
    const regIds  = new Set<number>()
    const confIds = new Set<number>()
    ;(data || []).forEach(r => { regIds.add(r.event_id); if (r.confirmed) confIds.add(r.event_id) })
    setRegisteredIds(regIds)
    setConfirmedIds(confIds)
  }, [profile])

  useEffect(() => { fetchEvents() }, [fetchEvents])
  useEffect(() => { fetchUserRegistrations() }, [fetchUserRegistrations])

  const handleRegister = useCallback(async (ev: Event) => {
    if (!profile) { onLoginClick(); return }
    if (registeredIds.has(ev.id)) { showToast(t('event.alreadyReg')); return }
    const { error } = await supabase.from('event_registrations').insert({ event_id: ev.id, user_id: profile.id, confirmed: false })
    if (error) { showToast(t('event.regFailed') + ': ' + error.message); return }
    setRegisteredIds(prev => new Set([...prev, ev.id]))
    setEvents(prev => prev.map(e => e.id === ev.id ? { ...e, _regCount: (e._regCount ?? 0) + 1 } : e))
    showToast(t('event.regFor') + ' ' + ev.title + '!')
  }, [profile, registeredIds, onLoginClick, showToast, t])

  const handleUnregister = useCallback(async (ev: Event) => {
    if (!profile) return
    const { error } = await supabase.from('event_registrations').delete().eq('event_id', ev.id).eq('user_id', profile.id)
    if (error) { showToast('Error: ' + error.message); return }
    const wasConfirmed = confirmedIds.has(ev.id)
    setRegisteredIds(prev => { const s = new Set(prev); s.delete(ev.id); return s })
    setConfirmedIds(prev => { const s = new Set(prev); s.delete(ev.id); return s })
    setEvents(prev => prev.map(e => e.id === ev.id ? {
      ...e,
      _regCount:       Math.max(0, (e._regCount ?? 1) - 1),
      _confirmedCount: wasConfirmed ? Math.max(0, (e._confirmedCount ?? 1) - 1) : e._confirmedCount,
    } : e))
    showToast(t('event.cancelOk'))
  }, [profile, confirmedIds, showToast, t])

  const handleConfirm = useCallback(async (ev: Event) => {
    if (!profile) return
    if (!registeredIds.has(ev.id)) { showToast(t('event.mustRegFirst')); return }
    if (confirmedIds.has(ev.id))   { showToast(t('event.alreadyConf')); return }
    const { error } = await supabase.from('event_registrations').update({ confirmed: true }).eq('event_id', ev.id).eq('user_id', profile.id)
    if (error) { showToast(t('event.confFailed') + ': ' + error.message); return }
    setConfirmedIds(prev => new Set([...prev, ev.id]))
    setEvents(prev => prev.map(e => e.id === ev.id ? { ...e, _confirmedCount: (e._confirmedCount ?? 0) + 1 } : e))
    showToast(t('event.confFor') + ' ' + ev.title + '!')
  }, [profile, registeredIds, confirmedIds, showToast, t])

  const getStatus = useCallback(
    (eventId: number) => getRegistrationStatus(eventId, registeredIds, confirmedIds),
    [registeredIds, confirmedIds]
  )

  return {
    events,
    upcomingEvents: events.filter(isUpcoming),
    pastEvents:     events.filter(isPast),
    loading,
    registeredIds, confirmedIds,
    getStatus,
    handleRegister, handleUnregister, handleConfirm,
    refetch: fetchEvents,
  }
}
