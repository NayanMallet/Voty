# Voty - Système de Sondage

## Description

Voty est une application web permettant la création, la gestion et la réponse à des sondages en ligne, similaire à Google Forms.  
Le backend est développé avec Node.js, Express et MongoDB, le frontend est prévu en Vue.js.  
Les utilisateurs peuvent s'inscrire, créer des sondages composés de questions ouvertes ou QCM, et collecter les réponses des participants.

---

## Fonctionnalités principales

- Inscription et authentification des utilisateurs (créateurs et répondants)
- Création, modification, suppression de sondages avec des questions multiples
- Types de questions : ouverte, choix multiples (QCM)
- Réponses associées à l'utilisateur et au sondage
- Consultation des sondages disponibles
- API REST sécurisée avec JSON Web Tokens (JWT)

---

## Tech Stack

- Backend : Node.js, Express, MongoDB, Mongoose
- Authentification : JWT, bcryptjs
- Frontend : Vue.js (à venir)
- Conteneurisation : Docker (Application complète)

---

## Prérequis

### Pour le développement local
- Node.js v16+
- pnpm ou npm
- MongoDB (via Docker ou installation locale)

### Pour le déploiement Docker
- Docker
- Docker Compose

---

## Installation & Lancement

### Backend

1. Cloner le repo :

```bash
git clone <url-du-repo>
cd voty/server
```

2. Installer les dépendances :

```bash
pnpm install
```

2. Installer les dépendances :

```bash
pnpm install
```

3. Lancer MongoDB avec Docker :

```bash
docker run -d --name voty-mongo -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=admin mongo
```

4. Configurer la base de données :

```bash
MONGO_URI=mongodb://admin:admin@localhost:27017/?authSource=admin
PORT=3000
JWT_SECRET=tonSecretJWT
```

5. Démarrer le serveur en mode développement :

```bash
pnpm dev
```

Le backend sera accessible sur : ```http://localhost:3000```


API Endpoints (exemples)

POST /api/auth/register - Inscription utilisateur
POST /api/auth/login - Connexion utilisateur
GET /api/sondages - Liste des sondages publics
POST /api/sondages - Création d’un sondage (auth requis)
PUT /api/sondages/:id - Mise à jour d’un sondage (auth requis)
DELETE /api/sondages/:id - Suppression d’un sondage (auth requis)
POST /api/sondages/:id/reponses - Soumission de réponses

Structure du projet
```bash
/server
  |-- index.js           # Point d'entrée backend
  |-- /models            # Schémas Mongoose
  |-- /routes            # Routes Express
  |-- .env               # Variables d'environnement
  |-- package.json
  |-- Dockerfile         # Configuration Docker pour le serveur
/client
  |-- /src               # Code source Vue.js
  |-- package.json
  |-- Dockerfile         # Configuration Docker pour le client
  |-- nginx.conf         # Configuration Nginx pour servir l'application
docker-compose.yml       # Configuration Docker Compose pour l'ensemble de l'application
```

---

## Déploiement avec Docker

Pour déployer l'application complète (client, serveur et base de données) avec Docker :

1. Cloner le repo :

```bash
git clone <url-du-repo>
cd voty
```

2. Lancer l'application avec Docker Compose :

```bash
docker-compose up -d
```

L'application sera accessible sur :
- Client (Frontend) : `http://localhost`
- API (Backend) : `http://localhost:3000/api`
- MongoDB : `mongodb://localhost:27017`

3. Pour arrêter l'application :

```bash
docker-compose down
```

4. Pour arrêter l'application et supprimer les volumes (données de la base de données) :

```bash
docker-compose down -v
```
