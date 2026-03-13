import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Navbar() {
  const navigate = useNavigate()
  const { isLoggedIn, user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/dashboard')
  }

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="navbar-brand">
        Tikety
      </Link>
      <div className="navbar-right">
        {isLoggedIn ? (
          <>
            <span className="navbar-user">
              {user?.name || 'Mon espace'}
            </span>
            <button type="button" className="btn btn-outline" onClick={handleLogout}>
              Déconnexion
            </button>
          </>
        ) : (
          <Link to="/login" className="btn btn-primary">
            Connexion
          </Link>
        )}
      </div>
    </nav>
  )
}

export default Navbar
