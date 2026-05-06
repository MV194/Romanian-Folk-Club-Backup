// DownloadButton — downloads files via a server-side proxy edge function
// This bypasses CORS entirely — the edge function fetches the file and
// returns it with Content-Disposition: attachment, forcing a real download.

import { useState } from 'react'
import { Download } from 'lucide-react'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

function getFilename(url, hint) {
  // Use the hint if provided, otherwise extract from URL
  if (hint && hint.trim() && hint !== 'download') {
    const clean = hint.trim().replace(/[^a-z0-9\-_.]/gi, '-')
    // Append extension from URL if missing
    const urlExt = url?.split('?')[0].split('.').pop()?.toLowerCase()
    const imageExts = ['jpg','jpeg','png','gif','webp','svg','bmp','pdf','mp3','mp4']
    if (urlExt && imageExts.includes(urlExt) && !clean.includes('.')) {
      return `${clean}.${urlExt}`
    }
    return clean
  }
  // Extract from URL
  try {
    const path = new URL(url).pathname
    return path.split('/').pop() || 'download'
  } catch {
    return 'download'
  }
}

export default function DownloadButton({
  url,
  filename,
  label,
  style = {},
  iconSize = 15,
}) {
  const [busy, setBusy] = useState(false)

  const handleDownload = async (e) => {
    e.stopPropagation()
    e.preventDefault()
    if (!url || busy) return
    setBusy(true)

    const name = getFilename(url, filename)

    try {
      // Route through our edge function — server fetches, returns with attachment header
      const proxyUrl = `${SUPABASE_URL}/functions/v1/download-file?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(name)}`

      const res = await fetch(proxyUrl)
      if (!res.ok) throw new Error('Proxy error: ' + res.status)

      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = blobUrl
      a.download = name
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()

      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(blobUrl)
      }, 300)
    } catch (err) {
      console.error('Download failed:', err)
      // Last resort: open directly — at least user can save manually
      window.open(url, '_blank', 'noopener')
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={busy}
      title={label || 'Download'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        cursor: busy ? 'wait' : 'pointer',
        opacity: busy ? 0.6 : 1,
        transition: 'opacity .2s, transform .15s',
        ...style,
      }}
      onMouseEnter={e => { if (!busy) e.currentTarget.style.transform = 'scale(1.08)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none' }}
    >
      <Download size={iconSize} style={{ flexShrink: 0 }} />
      {label && <span style={{ fontSize: 'inherit', fontFamily: 'inherit' }}>{busy ? '…' : label}</span>}
    </button>
  )
}
