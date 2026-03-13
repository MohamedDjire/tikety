import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import QRCode from 'qrcode'
import { ticketsAPI } from '../services/api'
import { getDefaultEventById } from '../data/defaultEvents'
import { getLocalEventById } from '../utils/localDemo'
import TicketTemplate from '../components/TicketTemplate'
import BackButton from '../components/BackButton'
import jsPDF from 'jspdf'

function Ticket() {
  const { ticketId } = useParams()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const isDemo = ticketId && ticketId.startsWith('demo-')
  const demoEventId = isDemo ? ticketId.replace('demo-', '') : null
  const demoEvent = demoEventId ? (getDefaultEventById(demoEventId) || getLocalEventById(demoEventId)) : null

  useEffect(() => {
    if (isDemo) {
      setLoading(false)
      return
    }
    const fetchTicket = async () => {
      try {
        const { data } = await ticketsAPI.getById(ticketId)
        setTicket(data)
      } catch (err) {
        setError(err.response?.data?.message || 'Ticket introuvable.')
      } finally {
        setLoading(false)
      }
    }
    if (ticketId) fetchTicket()
  }, [ticketId, isDemo])

  const displayTicket = ticket || (demoEvent ? {
    eventTitle: demoEvent.title,
    eventDate: demoEvent.date,
    eventLocation: demoEvent.location,
    code: ticketId,
    ticketTemplateId: demoEvent.ticketTemplateId,
  } : {
    eventTitle: 'Événement démo',
    eventDate: new Date().toLocaleDateString('fr-FR'),
    eventLocation: 'Lieu',
    code: ticketId,
    ticketTemplateId: 'classic',
  })

  const templateId = displayTicket.ticketTemplateId || 'classic'

  const downloadPDF = async () => {
    try {
      const code = displayTicket.code || ticketId
      const qrDataUrl = await QRCode.toDataURL(code, { width: 200, margin: 1 })
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' })
      const pageW = pdf.internal.page.getWidth()
      const margin = 15

      pdf.setFontSize(14)
      pdf.text(displayTicket.eventTitle, margin, 25)
      pdf.setFontSize(10)
      pdf.text(displayTicket.eventDate, margin, 35)
      pdf.text(displayTicket.eventLocation, margin, 42)
      const qrSize = 45
      pdf.addImage(qrDataUrl, 'PNG', (pageW - qrSize) / 2, 52, qrSize, qrSize)
      pdf.setFontSize(9)
      pdf.text(`Code : ${code}`, margin, 110)

      pdf.save(`ticket-${ticketId}.pdf`)
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <main className="page"><BackButton to="/dashboard" /><p className="loading-text">Chargement du ticket...</p></main>
  if (!isDemo && error && !ticket) return <main className="page"><BackButton to="/dashboard" /><p className="error-message">{error}</p></main>

  return (
    <main className="page ticket-page">
      <BackButton to="/dashboard" />
      <h1>Votre ticket</h1>
      <div className="ticket-container">
        <TicketTemplate
          templateId={templateId}
          eventTitle={displayTicket.eventTitle}
          eventDate={displayTicket.eventDate}
          eventLocation={displayTicket.eventLocation}
          code={displayTicket.code || ticketId}
        />
      </div>
      <button type="button" className="btn btn-primary" onClick={downloadPDF}>
        Télécharger en PDF
      </button>
    </main>
  )
}

export default Ticket
