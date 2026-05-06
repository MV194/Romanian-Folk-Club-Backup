import React from 'react'
import ReactDOM from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import { AuthProvider } from './hooks/useAuth.jsx'
import { I18nProvider } from './lib/i18n.jsx'
import './index.css'

const path = window.location.pathname

async function mount() {
  if (path.startsWith('/events/archive')) {
    const { default: ArchiveApp } = await import('./ArchiveApp.jsx')
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <I18nProvider>
          <AuthProvider>
            <ArchiveApp />
            <Analytics />
          </AuthProvider>
        </I18nProvider>
      </React.StrictMode>
    )
  } else {
    const { default: App } = await import('./App.jsx')
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <I18nProvider>
          <AuthProvider>
            <App />
            <Analytics />
          </AuthProvider>
        </I18nProvider>
      </React.StrictMode>
    )
  }
}

mount()
