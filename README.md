# Voty — Système de sondage (Vue 3 / Node.js / MongoDB)

Voty est une application web permettant de créer, publier et répondre à des sondages (questions ouvertes et QCM).
- **Client** : Vue 3 + Vite, servi par **Nginx**
- **API** : Node.js + Express + TypeScript + Mongoose
- **DB** : MongoDB 7
- **Infra dev** : Docker Compose avec **profils** (`app`), healthchecks et variables d’environnement

---

## TL;DR — Démarrer en 1 minute

> Prérequis : Docker + Docker Compose, `pnpm` conseillé.

```bash
# Lancer toute la stack (client + api + db)
pnpm stack:up

# Suivre les logs
pnpm stack:logs

# Arrêter
pnpm stack:down
```

- Front : http://localhost
- API :   http://localhost:3000/api
- Health: http://localhost:3000/api/health

---

## Scripts disponibles (racine)

```json
{
  "scripts": {
    "db:up": "docker compose up -d mongo",
    "db:down": "docker compose stop mongo",
    "db:logs": "docker compose logs -f mongo",

    "stack:up": "docker compose --profile app up -d --build",
    "stack:down": "docker compose --profile app down",
    "stack:logs": "docker compose logs -f server client mongo"
  }
}
```

- `db:*` : ne démarre **que Mongo** (pratique pour dev local hors Docker)
- `stack:*` : démarre **client + serveur + db** via le profil `app`

---

## Deux workflows de développement

### A) Dev local rapide (recommandé pour corriger le front)

1) **DB en Docker**
```bash
pnpm db:up
pnpm db:logs   # attendre "{ ok: 1 }"
```

2) **API en local** (dans `server/`)  
   Créer `server/.env.development` :
```dotenv
MONGO_URI=mongodb://root:rootpassword@127.0.0.1:27017/voty?authSource=admin&directConnection=true
PORT=3000
JWT_SECRET=dev-secret-change-me
CLIENT_URL=http://localhost
```
Lancer :
```bash
pnpm -F server dev
```

3) **Client en local** (dans `client/`)  
   Créer `client/.env.local` :
```dotenv
VITE_API_URL=http://localhost:3000/api
```
Lancer :
```bash
pnpm -F client dev
```

### B) E2E en Docker (parité démo/prod)

```bash
pnpm stack:up
# client : http://localhost
# api    : http://localhost:3000/api
```

> **Note Vite** : en mode Docker, `VITE_API_URL` est **injecté au build** (via `client/Dockerfile` et `docker-compose.yml` → `build.args`).  
> Pour le changer : modifie `docker-compose.yml` → `client.build.args.VITE_API_URL`, puis rebuild :
```bash
docker compose build client --no-cache
pnpm stack:up
```

---

## Endpoints utiles

- `GET /api/health` → liveness/readiness JSON (retourne 200 si DB connectée, sinon 503)
- Auth, polls, responses : voir le code dans `server/src/routes/*` (Swagger JSDoc dans les handlers)

---

## Structure du repo

```
.
├── docker-compose.yml
├── README.md
├── client/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── src/...
│   └── README.md
└── server/
    ├── Dockerfile
    ├── src/
    │   ├── index.ts
    │   ├── routes/
    │   │   ├── healthRoutes.ts
    │   │   ├── authRoutes.ts
    │   │   ├── pollRoutes.ts
    │   │   └── responsesRoutes.ts
    │   └── ...
    └── README.md
```

---

## Dépannage rapide

- **Mongo “unhealthy”** au démarrage :
  ```bash
  docker compose down -v     # ⚠️ supprime les données locales
  pnpm stack:up
  ```
- **Front appelle la mauvaise API** en Docker : vérifier `client.build.args.VITE_API_URL` et **rebuild le client**.
- **404 sur /api/health** : vérifier que `healthRoutes` est bien monté dans `server/src/index.ts` :
  ```ts
  import healthRoutes from "./routes/healthRoutes";
  app.use("/api", healthRoutes);
  ```
- **CORS** : l’API doit autoriser `http://localhost` (déjà le cas dans ta config).

---

## Versions conseillées

- Node 20.x (si exécution locale), pnpm 10.x
- Images Docker : `node:20-alpine`, `mongo:7`, `nginx:alpine`
