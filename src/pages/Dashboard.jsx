import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import EventCard from '../components/EventCard'
import CreateEventModal from '../components/CreateEventModal'
import { eventsAPI } from '../services/api'
import { ticketsAPI } from '../services/api'
import { defaultEvents } from '../data/defaultEvents'
import { USE_BACKEND, getCurrentUser, getLocalEvents } from '../utils/localDemo'

function Dashboard() {
  const location = useLocation()
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [tickets, setTickets] = useState([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [loadingTickets, setLoadingTickets] = useState(true)
  const [useDefaultEvents, setUseDefaultEvents] = useState(false)
  const [errorTickets, setErrorTickets] = useState('')
  const [createEventModalOpen, setCreateEventModalOpen] = useState(false)

  useEffect(() => {
    if (!USE_BACKEND) {
      setEvents([...defaultEvents, ...getLocalEvents()])
      setUseDefaultEvents(true)
      setLoadingEvents(false)
      setLoadingTickets(false)
      return
    }
    const fetchEvents = async () => {
      try {
        const { data } = await eventsAPI.getAll()
        const list = Array.isArray(data) ? data : data?.events ?? []
        setEvents(list.length > 0 ? list : defaultEvents)
        setUseDefaultEvents(list.length === 0)
      } catch (err) {
        setEvents(defaultEvents)
        setUseDefaultEvents(true)
      } finally {
        setLoadingEvents(false)
      }
    }
    fetchEvents()
  }, [])

  useEffect(() => {
    if (location.state?.openCreateModal) {
      setCreateEventModalOpen(true)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state?.openCreateModal, location.pathname, navigate])

  useEffect(() => {
    if (!USE_BACKEND) return
    const fetchTickets = async () => {
      try {
        const { data } = await ticketsAPI.getByUser()
        setTickets(Array.isArray(data) ? data : data?.tickets ?? [])
      } catch (err) {
        setErrorTickets('')
        setTickets([])
      } finally {
        setLoadingTickets(false)
      }
    }
    fetchTickets()
  }, [])

  const currentUser = getCurrentUser()
  const displayName = currentUser?.name || (USE_BACKEND ? '' : 'Visiteur')
  const isOrganisateur = currentUser?.accountType === 'entreprise'
  const eventsCount = events.length
  const ticketsCount = tickets.length

  return (
    <main className="page dashboard-page">
      <header className="dashboard-mobile-header">
        <div className="dashboard-greeting">
          <p className="dashboard-greeting-label">Bonjour</p>
          <p className="dashboard-greeting-name">{displayName || 'Visiteur'}</p>
          {isOrganisateur && <span className="dashboard-badge-organisateur">Organisateur</span>}
        </div>
        <div className="dashboard-stats">
          {isOrganisateur ? (
            <>
              <div className="dashboard-stat">
                <span className="dashboard-stat-value">{USE_BACKEND ? 0 : getLocalEvents().length}</span>
                <span className="dashboard-stat-label">événements créés</span>
              </div>
              <div className="dashboard-stat">
                <span className="dashboard-stat-value">0</span>
                <span className="dashboard-stat-label">billets vendus</span>
              </div>
              <div className="dashboard-stat">
                <span className="dashboard-stat-value">0</span>
                <span className="dashboard-stat-label">ventes</span>
              </div>
            </>
          ) : (
            <>
              <div className="dashboard-stat">
                <span className="dashboard-stat-value">{ticketsCount}</span>
                <span className="dashboard-stat-label">billets achetés</span>
              </div>
              <div className="dashboard-stat">
                <span className="dashboard-stat-value">{eventsCount}</span>
                <span className="dashboard-stat-label">événements à découvrir</span>
              </div>
            </>
          )}
        </div>
      </header>

      <section className="dashboard-section">
        <div className="section-header">
          <h1 className="page-title">Les événements</h1>
          <div className="section-header-actions">
            {useDefaultEvents && (
              <p className="demo-badge">Données de démonstration</p>
            )}
            {isOrganisateur && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setCreateEventModalOpen(true)}
              >
                Créer un événement
              </button>
            )}
          </div>
        </div>
        {loadingEvents ? (
          <p className="loading-text">Chargement des événements...</p>
        ) : (
          <div className="events-grid">
            {events.length === 0 ? (
              <p className="empty-text">Aucun événement pour le moment.</p>
            ) : (
              events.map((event) => <EventCard key={event.id} event={event} />)
            )}
          </div>
        )}
      </section>

      <section id="billets" className="dashboard-section dashboard-tickets">
        <h2 className="section-title">Mes billets</h2>
        {errorTickets && <p className="error-message">{errorTickets}</p>}
        {loadingTickets ? (
          <p className="loading-text">Chargement...</p>
        ) : tickets.length === 0 ? (
          <p className="empty-text">Aucun billet. Achetez un billet en cliquant sur un événement ci-dessus.</p>
        ) : (
          <ul className="tickets-list">
            {tickets.map((t) => (
              <li key={t.id}>
                <Link to={`/ticket/${t.id}`} className="ticket-link">
                  {t.eventTitle || `Ticket #${t.id}`}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <CreateEventModal
        isOpen={createEventModalOpen}
        onClose={() => setCreateEventModalOpen(false)}
        onSuccess={(newEvent) => {
          if (!USE_BACKEND) {
            setEvents([...defaultEvents, ...getLocalEvents()])
          }
          if (newEvent?.id) {
            navigate(`/events/${newEvent.id}`)
          }
        }}
      />
    </main>
  )
}

export default Dashboard
