/**
 * Mode démo / local : auth et données en localStorage, sans backend.
 * Actif par défaut en développement. Désactiver avec VITE_USE_BACKEND=true quand le backend est prêt.
 */
const STORAGE_USERS = 'tikety_demo_users'
const STORAGE_TOKEN = 'token'
const STORAGE_EVENTS = 'tikety_demo_events'

export const USE_BACKEND = import.meta.env.VITE_USE_BACKEND === 'true'

export function getLocalUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_USERS)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveLocalUser(user) {
  const users = getLocalUsers()
  const exists = users.some((u) => u.email.toLowerCase() === user.email.toLowerCase())
  if (exists) {
    const next = users.map((u) => (u.email.toLowerCase() === user.email.toLowerCase() ? { ...u, ...user } : u))
    localStorage.setItem(STORAGE_USERS, JSON.stringify(next))
  } else {
    localStorage.setItem(STORAGE_USERS, JSON.stringify([...users, { ...user, createdAt: new Date().toISOString() }]))
  }
}

export function getLocalUserByEmail(email) {
  return getLocalUsers().find((u) => u.email.toLowerCase() === email.toLowerCase()) || null
}

export function setLocalToken(token) {
  localStorage.setItem(STORAGE_TOKEN, token)
}

export function getLocalToken() {
  return localStorage.getItem(STORAGE_TOKEN)
}

export function removeLocalToken() {
  localStorage.removeItem(STORAGE_TOKEN)
}

/** Utilisateur connecté (mode démo) : token du type "demo-email" → user depuis localStorage */
export function getCurrentUser() {
  const token = getLocalToken()
  if (!token || !token.startsWith('demo-')) return null
  const email = token.replace('demo-', '')
  return getLocalUserByEmail(email)
}

/** Événements créés par les organisateurs (mode démo) */
export function getLocalEvents() {
  try {
    const raw = localStorage.getItem(STORAGE_EVENTS)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveLocalEvent(event) {
  const events = getLocalEvents()
  const newEvent = { ...event, id: event.id || `local-${Date.now()}` }
  localStorage.setItem(STORAGE_EVENTS, JSON.stringify([...events, newEvent]))
  return newEvent
}

export function getLocalEventById(id) {
  return getLocalEvents().find((e) => String(e.id) === String(id)) || null
}
