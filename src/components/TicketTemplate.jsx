import { QRCodeSVG } from 'qrcode.react'

/**
 * Affiche le ticket selon le modèle choisi par l'organisateur.
 * @param {{ templateId: string, eventTitle: string, eventDate: string, eventLocation: string, code: string }} props
 */
function TicketTemplate({ templateId, eventTitle, eventDate, eventLocation, code }) {
  const t = templateId || 'classic'

  if (t === 'modern') {
    return (
      <div className="ticket-card ticket-template-modern">
        <div className="ticket-modern-header" />
        <h2>{eventTitle}</h2>
        <p className="ticket-meta">{eventDate}</p>
        <p className="ticket-meta">{eventLocation}</p>
        <div className="ticket-qr">
          <QRCodeSVG value={code} size={120} level="H" />
        </div>
        <p className="ticket-code">Code : {code}</p>
      </div>
    )
  }

  if (t === 'minimal') {
    return (
      <div className="ticket-card ticket-template-minimal">
        <h2>{eventTitle}</h2>
        <p>{eventDate}</p>
        <p>{eventLocation}</p>
        <div className="ticket-qr">
          <QRCodeSVG value={code} size={128} level="H" />
        </div>
        <p className="ticket-code">{code}</p>
      </div>
    )
  }

  return (
    <div className="ticket-card ticket-template-classic">
      <h2>{eventTitle}</h2>
      <p>{eventDate}</p>
      <p>{eventLocation}</p>
      <div className="ticket-qr">
        <QRCodeSVG value={code} size={128} level="H" />
      </div>
      <p className="ticket-code">Code : {code}</p>
    </div>
  )
}

export default TicketTemplate
