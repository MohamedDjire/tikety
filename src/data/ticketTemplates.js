/**
 * Modèles de tickets électroniques.
 * Les organisateurs choisissent un modèle pour leurs événements.
 * La génération du ticket utilise ces infos + les données de l'événement.
 */
export const TICKET_TEMPLATES = [
  { id: 'classic', name: 'Classique', description: 'Mise en page sobre avec QR code central' },
  { id: 'modern', name: 'Moderne', description: 'Design épuré, fond dégradé' },
  { id: 'minimal', name: 'Minimal', description: 'Texte et QR uniquement, très lisible' },
]

export function getTicketTemplateById(id) {
  return TICKET_TEMPLATES.find((t) => t.id === id) || TICKET_TEMPLATES[0]
}
