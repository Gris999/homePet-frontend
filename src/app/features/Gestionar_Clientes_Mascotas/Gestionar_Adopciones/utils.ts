const API_URL =
  import.meta.env.VITE_API_URL || 'https://pethome-backend-ujju.onrender.com/api'

function getBackendOrigin() {
  try {
    return new URL(API_URL).origin
  } catch {
    return window.location.origin
  }
}

export function resolveMediaUrl(value?: string | null) {
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value

  const path = value.startsWith('/') ? value : `/${value}`
  return `${getBackendOrigin()}${path}`
}
