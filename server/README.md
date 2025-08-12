# Voty — API (Node.js / Express / TypeScript)

## Lancer l’API

### En local (recommandé avec Mongo en Docker)

1) Créer `./.env.development` :
```dotenv
MONGO_URI=mongodb://root:rootpassword@127.0.0.1:27017/voty?authSource=admin&directConnection=true
PORT=3000
JWT_SECRET=dev-secret-change-me
CLIENT_URL=http://localhost
```

2) Installer & démarrer :
```bash
pnpm install
pnpm dev
```
- API : http://localhost:3000/api  
- Health : http://localhost:3000/api/health

### En Docker
L’API est buildée + lancée par `docker-compose.yml` via le profil `app` :
```bash
pnpm stack:up     # depuis la racine du repo
```
Le `MONGO_URI` est fourni par Compose :
```
mongodb://root:rootpassword@mongo:27017/voty?authSource=admin
```

## Scripts usuels
```bash
pnpm dev      # dev (ts-node-dev)
pnpm build    # compile TypeScript -> dist
pnpm start    # lance dist/index.js
# pnpm test   # (si tests configurés)
```

## Healthcheck

Route publique **GET `/api/health`** (liveness/readiness) :
- `200` si DB connectée
- `503` sinon

Réponse :
```json
{
  "ok": true,
  "db": "connected",
  "uptime": 3.14,
  "timestamp": "2025-08-12T11:45:00.000Z",
  "env": "development"
}
```

## Documentation OpenAPI (JSDoc)

Les handlers sont commentés en JSDoc `@openapi`.  
Exemple (extrait) :

```ts
/**
 * @openapi
 * /api/health:
 *   get:
 *     summary: Health check (liveness & readiness)
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Service healthy
 *       503:
 *         description: Service not ready
 */
```
