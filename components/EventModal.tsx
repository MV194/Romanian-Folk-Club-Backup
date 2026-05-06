import { useEffect, useState, useRef, useCallback } from 'react'
import { X, Calendar, MapPin, Users, CheckCircle, ChevronLeft, ChevronRight, Camera, Trash2, Upload } from 'lucide-react'
import type { Event, RegistrationStatus } from '../types'
import { useEventImages } from '../hooks/useEventImages'
import DownloadButton from './DownloadButton'
import { useAuth } from '../hooks/useAuth'
import { useT } from '../lib/i18n.jsx'

interface EventModalProps {
  event:        Event
  status:       RegistrationStatus
  isPast?:      boolean
  onClose:      () => void
  onRegister:   (ev: Event) => void
  onUnregister: (ev: Event) => void
  onConfirm:    (ev: Event) => void
}

// Shared toast — passed down from parent; we keep a module-level ref for the hook
let _showToast = (msg: string) => { console.log(msg) }

export default function EventModal({
  event: ev, status, isPast = false,
  onClose, onRegister, onUnregister, onConfirm,
}: EventModalProps) {
  const auth = useAuth()
  const profile = auth?.profile
  const t = useT()
  const regCount  = ev._regCount       ?? 0
  const confCount = ev._confirmedCount ?? 0
  const cap       = ev.capacity        ?? 0
  const isFull    = cap > 0 && regCount >= cap
  const isRegistered = status === 'registered' || status === 'confirmed'
  const isConfirmed  = status === 'confirmed'

  // ── Image carousel state ──────────────────────────────────────────────────
  const { images, loading: imagesLoading, uploading, uploadImage, deleteImage } =
    useEventImages(ev.id, ev.image_url, _showToast, t)

  // Combine cover image + uploaded images into one list for the carousel
  const allImages = [
    ...(ev.image_url ? [{ id: -1, url: ev.image_url, caption: ev.title, uploader_name: 'Club', event_id: ev.id, user_id: null, uploaded_at: '' }] : []),
    ...images,
  ]

  const [slideIndex, setSlideIndex] = useState(0)
  const [showUpload, setShowUpload] = useState(false)
  const [caption, setCaption]       = useState('')
  const [dragOver, setDragOver]     = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Clamp index when images change
  useEffect(() => {
    if (slideIndex >= allImages.length && allImages.length > 0) {
      setSlideIndex(allImages.length - 1)
    }
  }, [allImages.length])

  // Auto-advance carousel every 4s when not hovered
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    if (allImages.length <= 1 || paused) return
    const t = setInterval(() => setSlideIndex(i => (i + 1) % allImages.length), 4000)
    return () => clearInterval(t)
  }, [allImages.length, paused])

  const prev = () => setSlideIndex(i => (i - 1 + allImages.length) % allImages.length)
  const next = () => setSlideIndex(i => (i + 1) % allImages.length)

  // ── File handling ─────────────────────────────────────────────────────────
  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return
    await uploadImage(files[0], caption)
    setCaption('')
    setShowUpload(false)
  }, [uploadImage, caption])

  // Lock scroll + escape key
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, allImages.length])

  const currentImg = allImages[slideIndex]

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(26,10,0,.8)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        animation: 'modalFadeIn .2s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: '16px',
          maxWidth: '640px', width: '100%',
          maxHeight: '92vh', overflowY: 'auto',
          boxShadow: '0 24px 80px rgba(0,0,0,.5)',
          animation: 'modalSlideUp .25s ease',
          position: 'relative',
        }}
      >

        {/* ── CAROUSEL ───────────────────────────────────────────────────── */}
        <div
          style={{ position: 'relative', height: '280px', background: '#111', borderRadius: '16px 16px 0 0', overflow: 'hidden', flexShrink: 0 }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Slides */}
          {allImages.length > 0 ? (
            <>
              {allImages.map((img, i) => (
                <div key={img.id} style={{
                  position: 'absolute', inset: 0,
                  opacity: i === slideIndex ? 1 : 0,
                  transition: 'opacity .5s ease',
                  pointerEvents: i === slideIndex ? 'auto' : 'none',
                }}>
                  <img
                    src={img.url}
                    alt={img.caption || ev.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.55) 0%, transparent 55%)' }} />
                  {/* Caption + uploader */}
                  {(img.caption || img.uploader_name) && (
                    <div style={{ position: 'absolute', bottom: '44px', left: '16px', right: '60px' }}>
                      {img.caption && <p style={{ color: '#fff', fontSize: '13px', fontWeight: '500', margin: 0, textShadow: '0 1px 4px rgba(0,0,0,.6)' }}>{img.caption}</p>}
                      {img.id !== -1 && <p style={{ color: 'rgba(255,255,255,.65)', fontSize: '11px', margin: '2px 0 0' }}>{t("modal.addedBy")} {img.uploader_name}</p>}
                    </div>
                  )}
                  {/* Download + Delete buttons */}
                  <div style={{ position: 'absolute', bottom: '12px', right: '12px', display: 'flex', gap: '6px' }}>
                    {img.url && (
                      <DownloadButton
                        url={img.url}
                        filename={(img.caption || currentImg?.caption || 'event-photo')}
                        label={null}
                        iconSize={13}
                        style={{ background: 'rgba(212,175,55,.7)', border: 'none', color: '#fff', width: '28px', height: '28px', borderRadius: '50%' }}
                      />
                    )}
                    {img.id !== -1 && profile && (img.user_id === profile?.id || (profile as any)?.role === 'admin') && (
                      <button
                        onClick={() => deleteImage(img)}
                        style={{ background: 'rgba(196,30,58,.85)', border: 'none', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '.2s' }}
                        title="Remove photo"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Prev / Next arrows */}
              {allImages.length > 1 && (
                <>
                  <button onClick={e => { e.stopPropagation(); prev() }} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,.45)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', transition: '.2s', zIndex: 2 }}>
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); next() }} style={{ position: 'absolute', right: '44px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,.45)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', transition: '.2s', zIndex: 2 }}>
                    <ChevronRight size={18} />
                  </button>

                  {/* Dot indicators */}
                  <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '5px', zIndex: 2 }}>
                    {allImages.map((_, i) => (
                      <button key={i} onClick={e => { e.stopPropagation(); setSlideIndex(i) }} style={{ width: i === slideIndex ? '18px' : '6px', height: '6px', borderRadius: '3px', background: i === slideIndex ? '#fff' : 'rgba(255,255,255,.45)', border: 'none', cursor: 'pointer', padding: 0, transition: '.3s' }} />
                    ))}
                  </div>
                </>
              )}

              {/* Image count badge */}
              <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,.5)', color: '#fff', fontSize: '11px', padding: '3px 9px', borderRadius: '20px', backdropFilter: 'blur(4px)' }}>
                {slideIndex + 1} / {allImages.length}
              </div>
            </>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '72px' }}>🎭</div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,.5)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', zIndex: 3, transition: '.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,.85)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,.5)'}
          >
            <X size={15} />
          </button>

          {/* Status badge */}
          {isPast && <div style={{ position: 'absolute', bottom: '12px', left: '16px', background: 'rgba(0,0,0,.6)', color: '#fff', fontSize: '11px', padding: '3px 10px', borderRadius: '20px', backdropFilter: 'blur(4px)' }}>Past Event</div>}
          {isConfirmed && <div style={{ position: 'absolute', bottom: '12px', left: '16px', background: '#2e7d32', color: '#fff', fontSize: '11px', padding: '3px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={11} /> Confirmed</div>}
        </div>

        {/* ── ADD PHOTO BUTTON ─────────────────────────────────────────────── */}
        {profile && (
          <div style={{ borderBottom: '1px solid var(--border)' }}>
            {!showUpload ? (
              <button
                onClick={() => setShowUpload(true)}
                style={{ width: '100%', padding: '11px 20px', background: 'var(--parchment)', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', transition: '.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f0e0c8'; e.currentTarget.style.color = 'var(--text)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--parchment)'; e.currentTarget.style.color = 'var(--muted)' }}
              >
                <Camera size={15} /> {t('modal.addPhoto')}
              </button>
            ) : (
              <div style={{ padding: '16px 20px', background: 'var(--parchment)' }}>
                {/* Drop zone */}
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
                  onClick={() => fileRef.current?.click()}
                  style={{
                    border: `2px dashed ${dragOver ? 'var(--red)' : '#d0b890'}`,
                    borderRadius: '10px', padding: '24px', textAlign: 'center',
                    cursor: 'pointer', transition: '.2s', marginBottom: '10px',
                    background: dragOver ? '#fff5f0' : '#fff',
                  }}
                >
                  <Upload size={22} style={{ color: 'var(--muted)', margin: '0 auto 8px', display: 'block' }} />
                  <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
                    {uploading ? t('modal.uploading') : t('modal.dragDrop')}
                  </p>
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />

                {/* Optional caption */}
                <input
                  type="text"
                  placeholder={t("modal.caption")}
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e0d0c0', borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit', outline: 'none', marginBottom: '10px', boxSizing: 'border-box' }}
                />

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    style={{ flex: 1, background: 'var(--red)', color: '#fff', border: 'none', padding: '9px', borderRadius: '8px', fontFamily: 'inherit', fontSize: '13px', fontWeight: '500', cursor: uploading ? 'default' : 'pointer', opacity: uploading ? .6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Camera size={14} /> {uploading ? t('modal.uploading') : t('modal.choosePhoto')}
                  </button>
                  <button
                    onClick={() => { setShowUpload(false); setCaption('') }}
                    style={{ padding: '9px 16px', background: '#fff', color: 'var(--muted)', border: '1.5px solid #e0d0c0', borderRadius: '8px', fontFamily: 'inherit', fontSize: '13px', cursor: 'pointer' }}
                  >
                    {t('modal.cancelUpload')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── CONTENT ──────────────────────────────────────────────────────── */}
        <div style={{ padding: '24px' }}>
          {/* Type badge */}
          <div style={{ display: 'inline-block', background: isPast ? '#f5f5f5' : '#FFF0F0', color: isPast ? '#888' : 'var(--red)', fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '500', marginBottom: '10px', border: `1px solid ${isPast ? '#e0e0e0' : '#ffd0d0'}` }}>
            {isPast ? t('events.past') : t('events.upcoming')}
          </div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.5rem', color: 'var(--ink)', marginBottom: '14px', lineHeight: 1.2 }}>{ev.title}</h2>

          {/* Meta */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '18px', padding: '14px 16px', background: 'var(--parchment)', borderRadius: '10px', border: '1px solid var(--border)' }}>
            {ev.date && <div style={{ display: 'flex', alignItems: 'center', gap: '9px', fontSize: '14px', color: 'var(--text)' }}><Calendar size={15} color="var(--red)" /><span>{ev.date}{ev.time ? ' ' + t('time.at') + ' ' + ev.time : ''}</span></div>}
            {ev.location && <div style={{ display: 'flex', alignItems: 'center', gap: '9px', fontSize: '14px', color: 'var(--text)' }}><MapPin size={15} color="var(--red)" /><span>{ev.location}</span></div>}
            {cap > 0 && <div style={{ display: 'flex', alignItems: 'center', gap: '9px', fontSize: '14px', color: 'var(--text)' }}><Users size={15} color="var(--red)" /><span>{regCount} {t('time.registered')} · {confCount} {t('time.confirmed')} · {cap} {t('time.capacity')}</span></div>}
          </div>

          {/* Description */}
          {ev.description && (
            <p style={{ fontFamily: "'Crimson Pro',serif", fontStyle: 'italic', fontSize: '1.05rem', color: 'var(--muted)', lineHeight: 1.75, marginBottom: '20px' }}>
              {ev.description}
            </p>
          )}

          {/* Stats */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <StatBox label={t("events.registered")} value={regCount}             color="var(--red)"   />
            <StatBox label={t("events.confirmed")}  value={confCount}            color="#2e7d32"       />
            {cap > 0 && <StatBox label={t("events.capacity")}  value={cap}       color="var(--muted)" />}
            <StatBox label={t("modal.photos")}     value={imagesLoading ? 0 : images.length} color="var(--gold)" />
          </div>

          {/* Action buttons */}
          {!isPast && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => { isRegistered ? onUnregister(ev) : onRegister(ev) }}
                disabled={!isRegistered && isFull}
                style={{
                  width: '100%', padding: '13px', borderRadius: '8px', border: 'none',
                  fontFamily: 'inherit', fontSize: '14px', fontWeight: '500',
                  cursor: (!isRegistered && isFull) ? 'default' : 'pointer',
                  background: isRegistered ? '#ffeef0' : isFull ? '#f5f5f5' : 'var(--red)',
                  color:      isRegistered ? 'var(--red)' : isFull ? '#aaa' : '#fff',
                  transition: '.2s',
                }}
              >
                {isRegistered ? t('modal.cancelReg') : isFull ? t('events.full') : t('events.register')}
              </button>

              {status === 'registered' && (
                <button
                  onClick={() => { onConfirm(ev); onClose() }}
                  style={{ width: '100%', padding: '13px', borderRadius: '8px', fontFamily: 'inherit', fontSize: '14px', fontWeight: '500', cursor: 'pointer', background: '#2e7d32', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#1b5e20'}
                  onMouseLeave={e => e.currentTarget.style.background = '#2e7d32'}
                >
                  {t('modal.confirmPart')}
                </button>
              )}
            </div>
          )}

          {isPast && (
            <button onClick={onClose} style={{ width: '100%', padding: '12px', borderRadius: '8px', fontFamily: 'inherit', fontSize: '14px', cursor: 'pointer', background: 'var(--parchment)', color: 'var(--muted)', border: '1px solid var(--border)' }}>
              {t('modal.close')}
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes modalFadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes modalSlideUp { from { transform: translateY(24px); opacity: 0 } to { transform: none; opacity: 1 } }
      `}</style>
    </div>
  )
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ flex: 1, background: 'var(--parchment)', borderRadius: '8px', padding: '10px 8px', textAlign: 'center', border: '1px solid var(--border)' }}>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.4rem', color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: '4px' }}>{label}</div>
    </div>
  )
}
