import { useState, useEffect } from 'react'
import EventCard from '../components/EventCard'
import { eventsAPI } from '../services/api'

function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await eventsAPI.getAll()
        setEvents(Array.isArray(data) ? data : data?.events ?? [])
      } catch (err) {
        setError(err.response?.data?.message || 'Impossible de charger les événements.')
        setEvents([])
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  if (loading) return <main className="page"><p>Chargement des événements...</p></main>
  if (error) return <main className="page"><p className="error-message">{error}</p></main>

  return (
    <main className="page events-page">
      <h1>Événements</h1>
      <div className="events-grid">
        {events.length === 0 ? (
          <p>Aucun événement pour le moment.</p>
        ) : (
          events.map((event) => <EventCard key={event.id} event={event} />)
        )}
      </div>
    </main>
  )
}

export default Events
