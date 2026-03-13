import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getDefaultEventById } from '../data/defaultEvents'
import { eventsAPI, paymentAPI } from '../services/api'
import { USE_BACKEND, getLocalEventById } from '../utils/localDemo'
import PaymentModal from '../components/PaymentModal'
import BackButton from '../components/BackButton'

function Payment() {
  const [searchParams] = useSearchParams()
  const eventId = searchParams.get('eventId')
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)

  const MIN_QUANTITY = 1
  const MAX_QUANTITY = 20

  useEffect(() => {
    if (!eventId) {
      setLoading(false)
      return
    }
    if (!USE_BACKEND) {
      setEvent(getDefaultEventById(eventId) || getLocalEventById(eventId))
      setLoading(false)
      return
    }
    const fetchEvent = async () => {
      try {
        const { data } = await eventsAPI.getById(eventId)
        setEvent(data)
      } catch (err) {
        setEvent(getDefaultEventById(eventId) || getLocalEventById(eventId))
      } finally {
        setLoading(false)
      }
    }
    fetchEvent()
  }, [eventId])

  const handleOpenPaymentModal = () => {
    setError('')
    setPaymentModalOpen(true)
  }

  const handleConfirmPayment = async (paymentMethod) => {
    if (!eventId) return
    setSubmitting(true)
    setPaymentModalOpen(false)
    if (!USE_BACKEND) {
      navigate(`/ticket/demo-${eventId}`)
      setSubmitting(false)
      return
    }
    try {
      const payload = {
        eventId,
        quantity,
        paymentMethod,
        email: email || undefined,
        name: name || undefined,
      }
      const { data } = await paymentAPI.create(payload)
      if (data?.ticketId) {
        navigate(`/ticket/${data.ticketId}`)
      } else {
        navigate(`/ticket/demo-${eventId}`)
      }
    } catch (err) {
      navigate(`/ticket/demo-${eventId}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="page payment-page">
        <p className="loading-text">Chargement...</p>
      </main>
    )
  }

  if (!eventId || !event) {
    return (
      <main className="page payment-page">
        <p className="error-message">Événement non sélectionné.</p>
      </main>
    )
  }

  const unitPrice = event.price != null && event.price > 0 ? event.price : 0
  const total = unitPrice * quantity

  return (
    <main className="page payment-page">
      <BackButton to={eventId ? `/events/${eventId}` : '/dashboard'} />
      <h1 className="payment-page-title">Finaliser votre achat</h1>

      <div className="payment-layout">
        <section className="payment-recap">
          <h2 className="payment-section-title">Récapitulatif de la commande</h2>
          <div className="payment-recap-card">
            {event.imageUrl && (
              <div className="payment-recap-image">
                <img src={event.imageUrl} alt={event.title} />
              </div>
            )}
            <div className="payment-recap-body">
              {event.category && <span className="payment-recap-category">{event.category}</span>}
              <h3>{event.title}</h3>
              <p className="payment-recap-date">{event.date}</p>
              <p className="payment-recap-location">{event.location}</p>
              <div className="payment-quantity">
                <span className="payment-quantity-label">Nombre de billets</span>
                <div className="payment-quantity-controls">
                  <button
                    type="button"
                    className="btn-quantity"
                    onClick={() => setQuantity((q) => Math.max(MIN_QUANTITY, q - 1))}
                    disabled={quantity <= MIN_QUANTITY}
                    aria-label="Diminuer"
                  >
                    −
                  </button>
                  <span className="payment-quantity-value">{quantity}</span>
                  <button
                    type="button"
                    className="btn-quantity"
                    onClick={() => setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))}
                    disabled={quantity >= MAX_QUANTITY}
                    aria-label="Augmenter"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="payment-recap-lines">
                <div className="payment-line">
                  <span>Billet × {quantity}</span>
                  <span>{unitPrice > 0 ? `${unitPrice} €` : 'Gratuit'}</span>
                </div>
                <div className="payment-line payment-total">
                  <span>Total</span>
                  <span>{total > 0 ? `${total} €` : 'Gratuit'}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="payment-form-section">
          <h2 className="payment-section-title">Vos coordonnées</h2>
          <div className="payment-form-card">
            <label>
              Nom complet
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jean Dupont"
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jean@exemple.com"
                required
              />
            </label>
          </div>

          <h2 className="payment-section-title">Moyen de paiement</h2>
          <div className="payment-form-card payment-method-preview">
            <p className="payment-method-preview-text">
              Carte bancaire, Orange Money et Wave disponibles. Choisissez au moment de confirmer.
            </p>
          </div>

          {error && <p className="error-message">{error}</p>}

          <button
            type="button"
            className="btn btn-primary payment-submit"
            onClick={handleOpenPaymentModal}
            disabled={submitting}
          >
            Confirmer le paiement — {total > 0 ? `${total} €` : 'Gratuit'}
          </button>
        </section>
      </div>

      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        total={total}
        onConfirm={handleConfirmPayment}
        submitting={submitting}
      />
    </main>
  )
}

export default Payment
