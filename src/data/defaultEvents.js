/**
 * Données d'événements par défaut (démonstration sans base de données).
 * Remplacées par l'API quand le backend est connecté.
 */
export const defaultEvents = [
  {
    id: '1',
    title: 'Concert La Fouine',
    date: 'Ven. 3 avril 2026 · 20h00',
    location: 'Abidjan, Palais de la Culture',
    price: 25,
    description: 'Soirée exceptionnelle avec La Fouine en concert. Promotion week-end Côte d\'Ivoire Tourisme. Une soirée inoubliable à ne pas manquer.',
    imageUrl: 'https://picsum.photos/seed/event1/600/340',
    category: 'Concert',
    ticketTemplateId: 'classic',
  },
  {
    id: '2',
    title: 'Sound Nest - Didi B',
    date: 'Sam. 12 avril 2026 · 22h00',
    location: 'Abidjan, Espace Latrille',
    price: 15,
    description: 'Sound Nest revient avec Didi B pour une nuit de musique et de bonne humeur. Ambiance garantie.',
    imageUrl: 'https://picsum.photos/seed/event2/600/340',
    category: 'Soirée',
    ticketTemplateId: 'modern',
  },
  {
    id: '3',
    title: 'Festival des cultures',
    date: 'Dim. 20 avril 2026 · 14h00',
    location: 'Bouaké, Stade municipal',
    price: 10,
    description: 'Grand festival annuel : musique, danse, artisanat et gastronomie. Toute la journée pour toute la famille.',
    imageUrl: 'https://picsum.photos/seed/event3/600/340',
    category: 'Festival',
    ticketTemplateId: 'minimal',
  },
  {
    id: '4',
    title: 'Concert Koffi Olomidé',
    date: 'Sam. 10 mai 2026 · 21h00',
    location: 'Abidjan, Stade Félix Houphouët-Boigny',
    price: 35,
    description: 'Le roi du rumba en tournée. Un show monumental à vivre en live.',
    imageUrl: 'https://picsum.photos/seed/event4/600/340',
    category: 'Concert',
    ticketTemplateId: 'classic',
  },
  {
    id: '5',
    title: 'Formation développement web',
    date: 'Lun. 18 mai 2026 · 09h00',
    location: 'Abidjan, Hub innovant',
    price: 0,
    description: 'Session intensive React et Node.js. Ouverte à tous les niveaux. Inscription gratuite, places limitées.',
    imageUrl: 'https://picsum.photos/seed/event5/600/340',
    category: 'Formation',
    ticketTemplateId: 'minimal',
  },
  {
    id: '6',
    title: 'Match amical football',
    date: 'Dim. 25 mai 2026 · 16h00',
    location: 'Yamoussoukro, Stade des sports',
    price: 5,
    description: 'Match amical entre sélections locales. Billetterie sur place et en ligne.',
    imageUrl: 'https://picsum.photos/seed/event6/600/340',
    category: 'Sport',
    ticketTemplateId: 'modern',
  },
]

/**
 * Retourne un événement par id depuis les données par défaut.
 */
export function getDefaultEventById(id) {
  return defaultEvents.find((e) => String(e.id) === String(id)) || null
}
