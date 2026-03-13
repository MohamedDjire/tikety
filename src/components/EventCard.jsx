import { Link } from 'react-router-dom'

const PLACEHOLDER_IMAGE = 'https://picsum.photos/seed/placeholder/600/340'

function EventCard({ event }) {
  const { id, title, date, location, price, imageUrl, category } = event
  const imgSrc = imageUrl || PLACEHOLDER_IMAGE

  return (
    <article className="event-card">
      <Link to={`/events/${id}`} className="event-card-link">
        <div className="event-card-image">
          <img src={imgSrc} alt={title} loading="lazy" />
          {category && <span className="event-card-category">{category}</span>}
        </div>
        <div className="event-card-content">
          <h3 className="event-card-title">{title}</h3>
          <p className="event-card-date">{date}</p>
          <p className="event-card-location">{location}</p>
          <p className="event-card-price">
            {price != null && price > 0 ? `À partir de ${price} €` : 'Entrée gratuite'}
          </p>
          <span className="event-card-cta">Voir les détails</span>
        </div>
      </Link>
    </article>
  )
}

export default EventCard
