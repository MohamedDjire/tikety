import { useNavigate } from 'react-router-dom'

/**
 * Bouton Retour : retour arrière ou vers une route de repli.
 * @param {{ to?: string, label?: string }} props - to = route de repli (ex: /dashboard), label = texte du lien
 */
function BackButton({ to, label = 'Retour' }) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (to) {
      navigate(to)
    } else {
      navigate(-1)
    }
  }

  return (
    <button
      type="button"
      className="back-button"
      onClick={handleClick}
      aria-label={label}
    >
      <span className="back-button-icon">←</span>
      <span>{label}</span>
    </button>
  )
}

export default BackButton
