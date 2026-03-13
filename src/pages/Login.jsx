import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import { USE_BACKEND, getLocalUserByEmail, setLocalToken } from '../utils/localDemo'
import BackButton from '../components/BackButton'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (USE_BACKEND) {
        const { data } = await authAPI.login(email, password)
        if (data.token) {
          localStorage.setItem('token', data.token)
          navigate('/dashboard')
        } else {
          setError('Réponse invalide du serveur.')
        }
      } else {
        const user = getLocalUserByEmail(email)
        if (user) {
          setLocalToken('demo-' + user.email)
          navigate('/dashboard')
        } else {
          setError('Aucun compte avec cet email. Inscrivez-vous d\'abord.')
        }
      }
    } catch (err) {
      if (!USE_BACKEND) {
        const user = getLocalUserByEmail(email)
        if (user) {
          setLocalToken('demo-' + user.email)
          navigate('/dashboard')
        } else {
          setError('Aucun compte avec cet email. Inscrivez-vous d\'abord.')
        }
      } else {
        setError(err.response?.data?.message || 'Erreur de connexion.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page login-page">
      <BackButton to="/dashboard" />
      <div className="auth-card">
        <h1>Connexion</h1>
        {!USE_BACKEND && (
          <p className="demo-badge-inline">Mode local : utilisez un compte créé via Inscription.</p>
        )}
        <form onSubmit={handleSubmit}>
          {error && <p className="error-message">{error}</p>}
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label>
            Mot de passe
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <p>
          Pas encore de compte ? <Link to="/register">S'inscrire</Link>
        </p>
      </div>
    </main>
  )
}

export default Login
