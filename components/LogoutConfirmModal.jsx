import { useEffect } from 'react'
import { LogOut, X } from 'lucide-react'
import { useT } from '../lib/i18n.jsx'

export default function LogoutConfirmModal({ isOpen, onClose, onConfirm }) {
  const t = useT()

  // Lock scroll when open
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [isOpen])

  // Escape key to close
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 3000,
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
          maxWidth: '400px', width: '100%',
          boxShadow: '0 24px 80px rgba(0,0,0,.5)',
          animation: 'modalSlideUp .25s ease',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{ padding: '24px 24px 16px', textAlign: 'center' }}>
          <div style={{ 
            width: '60px', height: '60px', background: 'rgba(196,30,58,.1)', 
            color: 'var(--red)', borderRadius: '50%', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' 
          }}>
            <LogOut size={28} />
          </div>
          <h3 style={{ 
            fontFamily: "'Playfair Display', serif", fontSize: '22px', 
            color: 'var(--ink)', margin: '0 0 8px' 
          }}>
            {t('logout.confirmTitle')}
          </h3>
          <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.5, margin: 0 }}>
            {t('logout.confirmMessage')}
          </p>
        </div>

        {/* Actions */}
        <div style={{ padding: '16px 24px 24px', display: 'flex', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '12px', borderRadius: '10px',
              background: 'var(--parchment)', border: '1px solid rgba(0,0,0,.05)',
              color: 'var(--ink)', fontFamily: 'inherit', fontWeight: '600',
              fontSize: '14px', cursor: 'pointer', transition: '.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f0e0c8'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--parchment)'}
          >
            {t('logout.cancelButton')}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '12px', borderRadius: '10px',
              background: 'var(--red)', border: 'none',
              color: '#fff', fontFamily: 'inherit', fontWeight: '600',
              fontSize: '14px', cursor: 'pointer', transition: '.2s',
              boxShadow: '0 4px 12px rgba(196,30,58,.3)'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#a01830'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--red)'}
          >
            {t('logout.confirmButton')}
          </button>
        </div>

        {/* Close X */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '12px', right: '12px',
            background: 'none', border: 'none', color: 'var(--muted)',
            cursor: 'pointer', padding: '4px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: '.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--ink)'}
        >
          <X size={18} />
        </button>
      </div>

      <style>{`
        @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
