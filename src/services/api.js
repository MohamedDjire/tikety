/**
 * Configuration API – Tikety
 * Base URL : VITE_API_URL (ex: http://localhost:3000/api)
 * Activer le backend : VITE_USE_BACKEND=true dans .env
 *
 * CONTRAT BACKEND (à respecter pour brancher le front) :
 *
 * Auth
 * - POST /auth/login   Body: { email, password }   → Réponse: { token: string }
 * - POST /auth/register Body: { email, password, name, accountType?, companyName?, companyPhone?, companyAddress? }  → 201
 * - GET  /auth/me      Headers: Authorization: Bearer <token>  → Réponse: { user }
 *
 * Events
 * - GET    /events       → Réponse: tableau d’événements ou { events: [] }
 * - GET    /events/:id   → Réponse: { id, title, date, location, price, description?, imageUrl?, category?, ticketTemplateId? }
 * - POST   /events       Headers: Authorization  Body: même forme qu’un événement  → Réponse: { id, ... } ou l’événement créé
 *
 * Tickets
 * - GET  /tickets     Headers: Authorization  → Réponse: tableau ou { tickets: [] } (chaque ticket: id, eventTitle?, eventDate?, eventLocation?, code?)
 * - GET  /tickets/:id → Réponse: { id, eventTitle, eventDate, eventLocation, code, ticketTemplateId? }
 * - POST /events/:eventId/tickets  Body: { quantity? }  → selon backend
 *
 * Paiement
 * - POST /payments  Body: { eventId, quantity, paymentMethod, email?, name? }
 *   paymentMethod: 'card' | 'orange_money' | 'wave'
 *   → Réponse: { ticketId: string } (obligatoire pour rediriger vers /ticket/:ticketId)
 *
 * Erreurs : en cas de 401, le front retire le token et redirige vers /login.
 */

import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
}

export const eventsAPI = {
  getAll: () => api.get('/events'),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
}

export const ticketsAPI = {
  create: (eventId, data) => api.post(`/events/${eventId}/tickets`, data),
  getByUser: () => api.get('/tickets'),
  getById: (id) => api.get(`/tickets/${id}`),
}

export const paymentAPI = {
  /** Body: { eventId, quantity, paymentMethod, email?, name? }. Réponse attendue: { ticketId } */
  create: (data) => api.post('/payments', data),
}
