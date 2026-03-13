import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { eventsAPI } from '../services/api'
import { getDefaultEventById } from '../data/defaultEvents'
import { USE_BACKEND, getLocalEventById } from '../utils/localDemo'
import BackButton from '../components/BackButton'

function EventDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    if (!USE_BACKEND) {
      const eventData = getDefaultEventById(id) || getLocalEventById(id)
      setEvent(eventData)
      if (!eventData) setError('Événement introuvable.')
      setLoading(false)
      return
    }
    const fetchEvent = async () => {
      try {
        const { data } = await eventsAPI.getById(id)
        setEvent(data)
      } catch (err) {
        const eventData = getDefaultEventById(id) || getLocalEventById(id)
        setEvent(eventData)
        if (!eventData) setError('Événement introuvable.')
      } finally {
        setLoading(false)
      }
    }
    fetchEvent()
  }, [id])

  const handleBuyTicket = () => {
    navigate(`/payment?eventId=${id}`)
  }

  if (loading) return <main className="page"><BackButton to="/dashboard" /><p className="loading-text">Chargement...</p></main>
  if (error && !event) return <main className="page"><BackButton to="/dashboard" /><p className="error-message">{error}</p></main>

  return (
    <main className="page event-details-page">
      <BackButton to="/dashboard" />
      <article className="event-details">
        {(event.imageUrl) && (
          <img src={event.imageUrl} alt={event.title} className="event-details-image" />
        )}
        <div className="event-details-content">
          {event.category && <span className="event-category-badge">{event.category}</span>}
          <h1>{event.title}</h1>
          <p className="event-date">{event.date}</p>
          <p className="event-location">{event.location}</p>
          {event.description && <p className="event-description">{event.description}</p>}
          <p className="event-price">
            {event.price != null && event.price > 0 ? `À partir de ${event.price} €` : 'Entrée gratuite'}
          </p>
          <button type="button" className="btn btn-primary" onClick={handleBuyTicket}>
            Acheter un billet
          </button>
        </div>
      </article>
    </main>
  )
}

export default EventDetails
