export function getApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_URL
  if (configured && configured.trim().length > 0) {
    return configured.trim().replace(/\/+$/, '')
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return 'http://localhost:8000'
}
