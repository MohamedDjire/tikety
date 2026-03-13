import { Link } from 'react-router-dom'

function Button({ children, variant = 'primary', type = 'button', disabled, onClick, to, className = '' }) {
  const baseClass = 'btn'
  const variantClass = `btn-${variant}`
  const classes = `${baseClass} ${variantClass} ${className}`.trim()

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default Button
