/**
 * Formate une date pour l'affichage
 * @param {string|Date} date
 * @param {string} locale
 * @returns {string}
 */
export function formatDate(date, locale = 'fr-FR') {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
