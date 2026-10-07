import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import './index.css'
import App from './App.jsx'

// Only active when a DSN is configured (local dev has none, so this is a
// no-op there). A DSN is an ingestion endpoint, not a secret - it ends up
// in the shipped JS bundle regardless, same as VITE_API_URL.
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'production',
    tracesSampleRate: 0,
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>,
)

function ErrorFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 text-center">
      <div>
        <h1 className="text-lg font-semibold text-white">Something went wrong.</h1>
        <p className="mt-2 text-sm text-text-muted">
          Try refreshing the page. The error has been reported.
        </p>
      </div>
    </div>
  )
}