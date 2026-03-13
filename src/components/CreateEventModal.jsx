import { useState } from 'react'
import { saveLocalEvent } from '../utils/localDemo'
import { USE_BACKEND } from '../utils/localDemo'
import { TICKET_TEMPLATES } from '../data/ticketTemplates'
import { eventsAPI } from '../services/api'

const CATEGORIES = ['Concert', 'Soirée', 'Festival', 'Formation', 'Sport', 'Culture', 'Autre']

function CreateEventModal({ isOpen, onClose, onSuccess }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    date: '',
    location: '',
    price: '',
    description: '',
    category: 'Concert',
    imageUrl: '',
    ticketTemplateId: 'classic',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const priceNum = form.price === '' ? 0 : parseFloat(form.price)
    const eventData = {
      title: form.title.trim(),
      date: form.date.trim() || 'Date à préciser',
      location: form.location.trim() || 'Lieu à préciser',
      price: isNaN(priceNum) ? 0 : priceNum,
      description: form.description.trim() || '',
      category: form.category,
      imageUrl: form.imageUrl.trim() || undefined,
      ticketTemplateId: form.ticketTemplateId,
    }
    if (!eventData.title) {
      setError('Le titre est obligatoire.')
      setLoading(false)
      return
    }
    try {
      if (USE_BACKEND) {
        const { data } = await eventsAPI.create(eventData)
        onClose()
        onSuccess?.(data || eventData)
      } else {
        const created = saveLocalEvent(eventData)
        onClose()
        onSuccess?.(created)
      }
    } catch (err) {
      if (!USE_BACKEND) {
        const created = saveLocalEvent(eventData)
        onClose()
        onSuccess?.(created)
      } else {
        setError(err.response?.data?.message || 'Erreur lors de la création.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal create-event-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Créer un événement</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Fermer">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="create-event-form create-event-form-modal">
          <div className="modal-body">
            {error && <p className="error-message">{error}</p>}

            <label>
              Titre de l'événement *
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Ex: Soirée Gala 2026"
                required
              />
            </label>

            <label>
              Date et heure
              <input
                type="text"
                name="date"
                value={form.date}
                onChange={handleChange}
                placeholder="Ex: Sam. 15 mars 2026 · 20h00"
              />
            </label>

            <label>
              Lieu
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Ex: Abidjan, Palais de la Culture"
              />
            </label>

            <label>
              Prix (€) — 0 pour gratuit
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </label>

            <label>
              Catégorie
              <select name="category" value={form.category} onChange={handleChange}>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </label>

            <label>
              Modèle de ticket
              <select name="ticketTemplateId" value={form.ticketTemplateId} onChange={handleChange}>
                {TICKET_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </label>

            <label>
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Décrivez votre événement..."
                rows={3}
              />
            </label>

            <label>
              URL de l'image (optionnel)
              <input
                type="url"
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="https://..."
              />
            </label>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Création...' : 'Créer l\'événement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateEventModal
