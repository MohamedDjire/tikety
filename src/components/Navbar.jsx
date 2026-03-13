import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCurrentUser } from '../utils/localDemo'

function Navbar() {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
    const user = getCurrentUser()
    setUserName(user?.name || '')
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
    setUserName('')
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
              {userName || 'Mon espace'}
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
