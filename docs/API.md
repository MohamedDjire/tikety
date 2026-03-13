# Contrat API – Frontend Tikety

Quand le backend est prêt, mettre dans `.env` à la racine du projet :

```env
VITE_USE_BACKEND=true
VITE_API_URL=http://localhost:XXXX/api
```

Le front envoie déjà les requêtes suivantes et s’attend aux réponses indiquées.

---

## Auth

| Méthode | URL | Body (request) | Réponse attendue |
|--------|-----|-----------------|------------------|
| POST | `/auth/login` | `{ email, password }` | `{ token: string }` |
| POST | `/auth/register` | `{ email, password, name, accountType?, companyName?, companyPhone?, companyAddress? }` | 201 (créé) |
| GET | `/auth/me` | — (header `Authorization: Bearer <token>`) | `{ user }` (optionnel) |

---

## Événements

| Méthode | URL | Body / query | Réponse attendue |
|--------|-----|----------------|------------------|
| GET | `/events` | — | tableau d’événements ou `{ events: [] }` |
| GET | `/events/:id` | — | `{ id, title, date, location, price, description?, imageUrl?, category?, ticketTemplateId? }` |
| POST | `/events` | objet événement (title, date, location, price, etc.) | `{ id, ... }` (événement créé) |

---

## Billets (tickets)

| Méthode | URL | Body | Réponse attendue |
|--------|-----|------|------------------|
| GET | `/tickets` | — | tableau ou `{ tickets: [] }` (chaque élément : `id`, `eventTitle?`, `eventDate?`, `eventLocation?`, `code?`) |
| GET | `/tickets/:id` | — | `{ id, eventTitle, eventDate, eventLocation, code, ticketTemplateId? }` |

---

## Paiement

| Méthode | URL | Body | Réponse attendue |
|--------|-----|------|------------------|
| POST | `/payments` | `{ eventId, quantity, paymentMethod, email?, name? }` | `{ ticketId: string }` |

- `paymentMethod` : `'card'` \| `'orange_money'` \| `'wave'`
- Le front redirige vers `/ticket/:ticketId` avec le `ticketId` renvoyé.

---

## Comportement commun

- **Header** : le front envoie `Authorization: Bearer <token>` sur toutes les requêtes quand l’utilisateur est connecté.
- **401** : le front supprime le token et redirige vers `/login`.

Si le backend renvoie des champs avec d’autres noms, il suffit d’adapter soit le backend pour respecter ce contrat, soit les appels dans `src/services/api.js` et les pages qui utilisent les réponses.
