import { useState } from 'react'

const PAYMENT_METHODS = [
  { id: 'card', name: 'Carte bancaire', icon: '💳' },
  { id: 'orange_money', name: 'Orange Money', icon: '🟠' },
  { id: 'wave', name: 'Wave', icon: '🌊' },
]

function PaymentModal({ isOpen, onClose, total, onConfirm, submitting }) {
  const [selectedMethod, setSelectedMethod] = useState('card')

  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm(selectedMethod)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Choisir le moyen de paiement</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Fermer">
            ×
          </button>
        </div>
        <div className="modal-body">
          <p className="payment-modal-total">
            Montant à payer : <strong>{total > 0 ? `${total} €` : 'Gratuit'}</strong>
          </p>
          <div className="payment-methods-list">
            {PAYMENT_METHODS.map((method) => (
              <label key={method.id} className="payment-method-item">
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={selectedMethod === method.id}
                  onChange={() => setSelectedMethod(method.id)}
                />
                <span className="payment-method-icon">{method.icon}</span>
                <span className="payment-method-name">{method.name}</span>
              </label>
            ))}
          </div>
          <p className="payment-modal-hint">
            Paiement sécurisé. Connexion aux opérateurs (Orange Money, Wave) à venir côté backend.
          </p>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Annuler
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={submitting}
          >
            {submitting ? 'Traitement...' : 'Payer maintenant'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentModal
