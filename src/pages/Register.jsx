import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import { USE_BACKEND, saveLocalUser, setLocalToken } from '../utils/localDemo'
import BackButton from '../components/BackButton'

const ACCOUNT_TYPES = [
  { value: 'particulier', label: 'Particulier' },
  { value: 'entreprise', label: 'Entreprise / Organisateur' },
]

function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    accountType: 'particulier',
    companyName: '',
    companyPhone: '',
    companyAddress: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isEntreprise = form.accountType === 'entreprise'

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (USE_BACKEND) {
        const payload = {
          email: form.email,
          password: form.password,
          name: form.name,
          accountType: form.accountType,
        }
        if (isEntreprise) {
          payload.companyName = form.companyName
          payload.companyPhone = form.companyPhone
          payload.companyAddress = form.companyAddress
        }
        await authAPI.register(payload)
        navigate('/login')
      } else {
        const user = {
          email: form.email,
          password: form.password,
          name: form.name,
          accountType: form.accountType,
          companyName: isEntreprise ? form.companyName : undefined,
          companyPhone: isEntreprise ? form.companyPhone : undefined,
          companyAddress: isEntreprise ? form.companyAddress : undefined,
        }
        saveLocalUser(user)
        setLocalToken('demo-' + form.email)
        navigate('/dashboard')
      }
    } catch (err) {
      if (!USE_BACKEND) {
        const user = {
          email: form.email,
          password: form.password,
          name: form.name,
          accountType: form.accountType,
          companyName: isEntreprise ? form.companyName : undefined,
          companyPhone: isEntreprise ? form.companyPhone : undefined,
          companyAddress: isEntreprise ? form.companyAddress : undefined,
        }
        saveLocalUser(user)
        setLocalToken('demo-' + form.email)
        navigate('/dashboard')
      } else {
        setError(err.response?.data?.message || "Erreur lors de l'inscription.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page register-page">
      <BackButton to="/dashboard" />
      <div className="auth-card register-card">
        <h1>Inscription</h1>
        {!USE_BACKEND && (
          <p className="demo-badge-inline">Mode local : votre compte est enregistré sur cet appareil.</p>
        )}
        <form onSubmit={handleSubmit}>
          {error && <p className="error-message">{error}</p>}

          <label>
            Je m'inscris en tant que
            <select
              name="accountType"
              value={form.accountType}
              onChange={handleChange}
              className="register-select"
            >
              {ACCOUNT_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>

          {isEntreprise && (
            <div className="register-company-fields">
              <label>
                Nom de l'entreprise *
                <input
                  type="text"
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  placeholder="Ma Société SARL"
                  required={isEntreprise}
                />
              </label>
              <label>
                Téléphone de l'entreprise
                <input
                  type="tel"
                  name="companyPhone"
                  value={form.companyPhone}
                  onChange={handleChange}
                  placeholder="+225 07 00 00 00 00"
                />
              </label>
              <label>
                Adresse / Siège
                <input
                  type="text"
                  name="companyAddress"
                  value={form.companyAddress}
                  onChange={handleChange}
                  placeholder="Abidjan, Cocody..."
                />
              </label>
              <p className="register-company-hint">
                En tant qu'entreprise, vous pourrez créer des événements et publier vos billets après connexion.
              </p>
            </div>
          )}

          <label>
            {isEntreprise ? 'Nom du responsable' : 'Nom complet'} *
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Email *
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </label>
          <label>
            Mot de passe *
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </label>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Inscription...' : "S'inscrire"}
          </button>
        </form>
        <p>
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </main>
  )
}

export default Register
