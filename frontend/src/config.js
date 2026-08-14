// Centralized API configuration derived from Vite environment variables.
// In Development: Defaults to local backend at http://localhost:8000
// In Production: Defaults to relative path (handled via Nginx reverse proxy) or VITE_API_BASE_URL
const rawBase = import.meta.env.VITE_API_BASE_URL

export const API_BASE_URL = rawBase !== undefined && rawBase !== null && rawBase !== ''
  ? rawBase.replace(/\/$/, '')
  : (import.meta.env.DEV ? 'http://localhost:8000' : '')
