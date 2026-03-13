import { Link, useLocation } from 'react-router-dom'

function BottomNav() {
  const location = useLocation()
  const isLoggedIn = !!localStorage.getItem('token')

  return (
    <nav className="bottom-nav" aria-label="Navigation principale">
      <Link
        to="/dashboard"
        className={`bottom-nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
      >
        <span className="bottom-nav-icon">⌂</span>
        <span>Accueil</span>
      </Link>
      <Link
        to="/dashboard#billets"
        className={`bottom-nav-item ${location.pathname === '/dashboard' && location.hash === '#billets' ? 'active' : ''}`}
      >
        <span className="bottom-nav-icon">🎫</span>
        <span>Billets</span>
      </Link>
      <Link
        to={isLoggedIn ? '/dashboard' : '/login'}
        className={`bottom-nav-item ${location.pathname === '/login' ? 'active' : ''}`}
      >
        <span className="bottom-nav-icon">👤</span>
        <span>{isLoggedIn ? 'Profil' : 'Connexion'}</span>
      </Link>
    </nav>
  )
}

export default BottomNav
