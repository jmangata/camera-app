# Déploiement sur Railway.app

Railway est l'alternative recommandée à Render pour Node.js + Prisma.
Avantages : détection automatique de Prisma, PostgreSQL intégré, 5$/mois de crédit gratuit.

## Prérequis

- Compte Railway : https://railway.app (connexion via GitHub)
- Repository GitHub avec le code du projet

---

## Étape 1 : Créer le projet Railway

1. Va sur https://railway.app
2. **New Project** → **Deploy from GitHub repo**
3. Sélectionne ton repository `camera-app`
4. Railway détecte automatiquement Node.js

---

## Étape 2 : Ajouter PostgreSQL

1. Dans ton projet Railway, clique **+ New**
2. Sélectionne **Database** → **Add PostgreSQL**
3. Railway crée la base et génère automatiquement la variable `DATABASE_URL`
4. Cette variable est injectée automatiquement dans ton service backend

---

## Étape 3 : Configurer le service Backend

1. Clique sur le service Node.js créé
2. Va dans **Settings**
3. Configure :

| Champ | Valeur |
|---|---|
| **Root Directory** | `server` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |

4. Va dans **Variables** et ajoute :

```
JWT_SECRET=un_secret_long_et_securise_minimum_32_caracteres
JWT_EXPIRES_IN=7d
NODE_ENV=production
FRONTEND_URL=https://ton-frontend.up.railway.app
PORT=3001
```

> `DATABASE_URL` est déjà injectée automatiquement par Railway.

---

## Étape 4 : Déployer le Frontend

1. Dans le même projet Railway, clique **+ New** → **GitHub Repo**
2. Sélectionne le même repository
3. Configure :

| Champ | Valeur |
|---|---|
| **Root Directory** | `client` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npx serve dist -p $PORT` |

4. Ajoute la variable :

```
VITE_API_URL=https://ton-backend.up.railway.app/api
```

> Installe `serve` dans le client : `cd client && npm install serve`

---

## Étape 5 : Migration base de données

Une fois le backend déployé :

1. Dans le service backend Railway → **Settings** → **Deploy** → ouvre le terminal
2. Ou utilise Railway CLI :

```bash
npm install -g @railway/cli
railway login
railway link
railway run --service=cammap-backend npx prisma db push
railway run --service=cammap-backend npm run db:seed
```

---

## Étape 6 : Vérifier le déploiement

1. Clique sur le service backend → **View Logs**
2. Tu devrais voir : `Server started on port 3001`
3. Teste l'API : `https://ton-backend.up.railway.app/api/health`

---

## Structure Railway

```
Railway Project
├── cammap-backend  (Node.js - /server)
├── cammap-frontend (Static - /client)
└── PostgreSQL      (Base de données)
```

---

## Variables d'environnement complètes

### Backend
```
DATABASE_URL=        # Auto-injectée par Railway PostgreSQL
JWT_SECRET=          # Génère avec : openssl rand -base64 32
JWT_EXPIRES_IN=7d
NODE_ENV=production
FRONTEND_URL=        # URL du frontend Railway
PORT=3001
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend
```
VITE_API_URL=        # URL du backend Railway + /api
```

---

## Pourquoi Railway fonctionne mieux que Render pour Prisma

- Railway exécute les commandes dans le bon répertoire de travail
- Le `postinstall` de npm est respecté
- Pas de conflit de workspace npm
- Les variables d'environnement sont injectées avant le build

---

## Commandes utiles Railway CLI

```bash
# Installer Railway CLI
npm install -g @railway/cli

# Se connecter
railway login

# Lier le projet
railway link

# Voir les logs
railway logs

# Ouvrir un shell dans le service
railway shell

# Exécuter une commande dans le service
railway run npm run db:seed
```

---

## Support

- Documentation Railway : https://docs.railway.app
- Discord Railway : https://discord.gg/railway
