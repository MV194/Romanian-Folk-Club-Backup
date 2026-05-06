// StarRating — reusable star picker and display component
// Usage (interactive): <StarRating value={3} onChange={setRating} />
// Usage (display only): <StarRating value={4} readOnly />

import { useState } from 'react'

export default function StarRating({ value = 5, onChange, readOnly = false, size = 22 }) {
  const [hovered, setHovered] = useState(0)
  const display = hovered || value

  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => !readOnly && onChange?.(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          style={{
            background: 'none',
            border: 'none',
            padding: '1px',
            cursor: readOnly ? 'default' : 'pointer',
            lineHeight: 1,
            transition: 'transform .15s',
            transform: !readOnly && hovered >= star ? 'scale(1.2)' : 'none',
          }}
        >
          <svg
            width={size} height={size}
            viewBox="0 0 24 24"
            fill={display >= star ? '#D4AF37' : 'none'}
            stroke={display >= star ? '#D4AF37' : '#d0c0a0'}
            strokeWidth="1.5"
          >
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
        </button>
      ))}
    </div>
  )
}
