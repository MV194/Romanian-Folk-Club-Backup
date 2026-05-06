import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface EventImage {
  id: number
  event_id: number
  user_id: string | null
  url: string
  caption: string | null
  uploaded_at: string
  uploader_name?: string
}

interface UseEventImagesReturn {
  images:      EventImage[]
  loading:     boolean
  uploading:   boolean
  uploadImage: (file: File, caption?: string) => Promise<void>
  deleteImage: (img: EventImage) => Promise<void>
}

export function useEventImages(
  eventId:       number,
  eventImageUrl: string | null,
  showToast:     (msg: string) => void,
  t:             (key: string) => string = (k) => k,
): UseEventImagesReturn {
  const [images,    setImages]    = useState<EventImage[]>([])
  const [loading,   setLoading]   = useState(true)
  const [uploading, setUploading] = useState(false)

  const fetchImages = useCallback(async () => {
    const { data, error } = await supabase
      .from('event_images')
      .select('*, profiles(name)')
      .eq('event_id', eventId)
      .order('uploaded_at', { ascending: false })
    if (error) { console.error(error); setLoading(false); return }
    setImages((data || []).map((r: any) => ({ ...r, uploader_name: r.profiles?.name ?? 'Member' })))
    setLoading(false)
  }, [eventId])

  useEffect(() => { fetchImages() }, [fetchImages])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`event_images:${eventId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'event_images', filter: `event_id=eq.${eventId}` },
        async (payload) => {
          const { data } = await supabase.from('event_images').select('*, profiles(name)').eq('id', (payload.new as EventImage).id).single()
          if (data) setImages(prev => [{ ...data, uploader_name: data.profiles?.name ?? 'Member' }, ...prev])
        }
      )
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'event_images', filter: `event_id=eq.${eventId}` },
        (payload) => setImages(prev => prev.filter(i => i.id !== (payload.old as EventImage).id))
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [eventId])

  const uploadImage = useCallback(async (file: File, caption = '') => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { showToast(t('photo.loginRequired')); return }
    if (!file.type.startsWith('image/')) { showToast(t('photo.invalidType')); return }
    if (file.size > 20 * 1024 * 1024) { showToast(t('photo.tooLarge')); return }

    setUploading(true)
    try {
      const ext      = file.name.split('.').pop()
      const filePath = `${user.id}/${eventId}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('event-images').upload(filePath, file, { upsert: false })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('event-images').getPublicUrl(filePath)
      const { error: dbError } = await supabase.from('event_images').insert({ event_id: eventId, user_id: user.id, url: publicUrl, caption: caption.trim() || null })
      if (dbError) throw dbError
      showToast(t('photo.added'))
    } catch (err: any) {
      showToast(t('photo.uploadFailed') + ': ' + (err.message ?? ''))
    } finally {
      setUploading(false)
    }
  }, [eventId, showToast, t])

  const deleteImage = useCallback(async (img: EventImage) => {
    if (!confirm(t('confirm.deleteGallery'))) return
    await supabase.from('event_images').delete().eq('id', img.id)
    try {
      const url  = new URL(img.url)
      const path = url.pathname.split('/event-images/')[1]
      if (path) await supabase.storage.from('event-images').remove([path])
    } catch { /* non-fatal */ }
    showToast(t('photo.removed'))
  }, [showToast, t])

  return { images, loading, uploading, uploadImage, deleteImage }
}
