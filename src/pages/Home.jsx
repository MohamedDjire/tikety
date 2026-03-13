import { Link } from 'react-router-dom'

function Home() {
  return (
    <main className="page home-page">
      <section className="hero">
        <h1>Bienvenue sur Tikety</h1>
        <p>Réservez vos billets pour les meilleurs événements.</p>
        <Link to="/dashboard" className="btn btn-primary">
          Voir les événements
        </Link>
      </section>
    </main>
  )
}

export default Home
