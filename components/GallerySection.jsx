import { useState, useEffect } from 'react'
import { Eye } from 'lucide-react'
import DownloadButton from './DownloadButton'
import { supabase } from '../lib/supabase'
import { useT } from '../lib/i18n.jsx'

export default function GallerySection() {
  const t = useT()
  const [items, setItems] = useState([])
  const [lightbox, setLightbox] = useState(null)  // currently viewed image

  useEffect(() => {
    supabase.from('gallery').select('*').order('created_at', { ascending: false })
      .then(({ data }) => setItems(data || []))
  }, [])


  return (
    <section id="gallery" style={{ padding: '100px 0', background: 'var(--ink)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        {/* Section header */}
        <div style={{ marginBottom: '56px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', color: 'var(--gold)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.15em', marginBottom: '12px' }}>
            <span style={{ display: 'block', width: '24px', height: '1px', background: 'currentColor' }} />
            {t('gallery.label')}
            <span style={{ display: 'block', width: '24px', height: '1px', background: 'currentColor' }} />
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8rem,4vw,2.8rem)', color: '#fff', marginBottom: '12px' }}>{t('gallery.title')}</h2>
          <p style={{ fontFamily: "'Crimson Pro', serif", fontStyle: 'italic', fontSize: '1.15rem', color: 'rgba(255,255,255,.5)', maxWidth: '480px' }}>{t('gallery.sub')}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '16px' }}>
          {items.length === 0 && (
            <p style={{ color: 'rgba(255,255,255,.4)', fontFamily: "'Crimson Pro',serif", fontStyle: 'italic' }}>{t('gallery.empty')}</p>
          )}
          {items.map(g => (
            <div key={g.id} style={{ borderRadius: '10px', overflow: 'hidden', position: 'relative', aspectRatio: '4/3', cursor: 'pointer', background: '#2a1800' }}>
              {g.image_url
                ? <img src={g.image_url} alt={g.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: '.35s' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '52px' }}>🖼️</div>
              }

              {/* Hover overlay */}
              <div
                style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', transition: '.3s', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '12px' }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(0,0,0,.6)'
                  e.currentTarget.querySelectorAll('.go').forEach(el => { el.style.opacity = '1'; el.style.transform = 'none' })
                  const img = e.currentTarget.previousSibling
                  if (img?.tagName === 'IMG') img.style.transform = 'scale(1.06)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(0,0,0,0)'
                  e.currentTarget.querySelectorAll('.go').forEach(el => { el.style.opacity = '0'; el.style.transform = 'translateY(6px)' })
                  const img = e.currentTarget.previousSibling
                  if (img?.tagName === 'IMG') img.style.transform = 'none'
                }}
              >
                {/* Top: action buttons */}
                <div className="go" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', opacity: 0, transform: 'translateY(6px)', transition: '.25s' }}>
                  {/* View fullscreen */}
                  <button
                    onClick={() => setLightbox(g)}
                    title={t('gallery.view')}
                    style={{ width: '34px', height: '34px', background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,.2)', borderRadius: '8px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.3)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.15)'}
                  >
                    <Eye size={15} />
                  </button>
                  {/* Download */}
                  {g.image_url && (
                    <DownloadButton
                      url={g.image_url}
                      filename={g.title || 'kw-folk-club-photo'}
                      label={null}
                      iconSize={15}
                      style={{ width:'34px', height:'34px', background:'rgba(212,175,55,.25)', backdropFilter:'blur(6px)', border:'1px solid rgba(212,175,55,.4)', borderRadius:'8px', color:'var(--gold)' }}
                    />
                  )}
                </div>

                {/* Bottom: title + description */}
                <div className="go" style={{ opacity: 0, transform: 'translateY(6px)', transition: '.25s .05s' }}>
                  <div style={{ color: '#fff', fontSize: '14px', fontWeight: '600', marginBottom: '3px' }}>{g.title}</div>
                  <div style={{ color: 'rgba(255,255,255,.7)', fontSize: '12px' }}>{g.description}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', animation: 'lbFade .2s ease' }}
        >
          <div onClick={e => e.stopPropagation()} style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img src={lightbox.image_url} alt={lightbox.title} style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain', borderRadius: '8px', display: 'block' }} />
            <div style={{ position: 'absolute', top: 0, right: 0, display: 'flex', gap: '8px', padding: '12px' }}>
              {/* Download from lightbox */}
              <DownloadButton
                url={lightbox.image_url}
                filename={lightbox.title || 'kw-folk-club-photo'}
                label={null}
                iconSize={16}
                style={{ background:'rgba(212,175,55,.3)', border:'1px solid rgba(212,175,55,.5)', color:'var(--gold)', width:'38px', height:'38px', borderRadius:'8px', backdropFilter:'blur(8px)' }}
              />
              {/* Close */}
              <button
                onClick={() => setLightbox(null)}
                style={{ background: 'rgba(0,0,0,.5)', border: 'none', color: '#fff', width: '38px', height: '38px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', backdropFilter: 'blur(8px)' }}
              >✕</button>
            </div>
            {/* Caption */}
            {(lightbox.title || lightbox.description) && (
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,.8), transparent)', padding: '20px 16px 12px', borderRadius: '0 0 8px 8px' }}>
                {lightbox.title && <div style={{ color: '#fff', fontWeight: '600', fontSize: '15px', marginBottom: '3px' }}>{lightbox.title}</div>}
                {lightbox.description && <div style={{ color: 'rgba(255,255,255,.7)', fontSize: '13px' }}>{lightbox.description}</div>}
              </div>
            )}
          </div>
          <style>{`@keyframes lbFade { from{opacity:0} to{opacity:1} }`}</style>
        </div>
      )}
    </section>
  )
}
