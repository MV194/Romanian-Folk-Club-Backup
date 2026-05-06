import { useEffect } from 'react'

export default function Toast({ msg, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="toast-enter" style={{
      position: 'fixed', bottom: '24px', right: '24px',
      background: 'var(--ink)', color: '#fff',
      padding: '14px 20px', borderRadius: '10px',
      fontSize: '14px', zIndex: 9999,
      borderLeft: '4px solid var(--gold)',
      maxWidth: '320px', fontFamily: 'DM Sans, sans-serif',
      boxShadow: '0 8px 32px rgba(0,0,0,.3)',
    }}>
      {msg}
    </div>
  )
}
