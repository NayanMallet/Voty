# Voty — Client (Vue 3 + Vite)

## Dev local

1) Installer :
```bash
pnpm install
```

2) Configurer l’URL de l’API :
   Créer `./.env.local` :
```dotenv
VITE_API_URL=http://localhost:3000/api
```

3) Lancer :
```bash
pnpm dev
```
- App : http://localhost

## Build & preview

```bash
pnpm build
pnpm preview
```

## Exécution en Docker

Le client est servi par **Nginx**. L’URL API est **baked** au build via l’arg `VITE_API_URL`.

- Défini dans `docker-compose.yml` → `client.build.args.VITE_API_URL`
- Utilisé dans `client/Dockerfile` :
  ```dockerfile
  ARG VITE_API_URL=/api
  ENV VITE_API_URL=$VITE_API_URL
  RUN pnpm build
  ```

Changer l’URL → **rebuild** le client :
```bash
docker compose build client --no-cache
docker compose --profile app up -d
```

## Nginx

`nginx.conf` sert la SPA et fait `try_files` vers `index.html`.  
Les appels API vont directement vers `http://localhost:3000/api` (pas de proxy Nginx par défaut).
