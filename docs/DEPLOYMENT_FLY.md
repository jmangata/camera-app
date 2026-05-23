# Déploiement sur Fly.io

Fly.io est recommandé pour Node.js + Prisma : plan gratuit permanent, Docker natif, Prisma fonctionne sans configuration spéciale.

## Plan gratuit Fly.io

- 3 VMs partagées (256MB RAM)
- 3GB stockage
- PostgreSQL inclus (Fly Postgres)
- Pas de carte bancaire requise

---

## Prérequis

1. Créer un compte : https://fly.io/app/sign-up
2. Installer le CLI Fly :

```bash
# macOS / Linux
curl -L https://fly.io/install.sh | sh

# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex
```

3. Se connecter :

```bash
fly auth login
```

---

## Étape 1 : Déployer la base de données PostgreSQL

```bash
fly postgres create --name cammap-db --region cdg
```

> `cdg` = Paris (le plus proche des Antilles françaises)

Note le nom de l'app et les credentials affichés.

---

## Étape 2 : Configurer le Backend

### Créer le fichier fly.toml dans /server

```bash
cd server
fly launch --name cammap-backend --region cdg --no-deploy
```

Remplace le contenu du fichier `server/fly.toml` généré par :

```toml
app = "cammap-backend"
primary_region = "cdg"

[build]

[env]
  NODE_ENV = "production"
  PORT = "3001"

[http_service]
  internal_port = 3001
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

[[vm]]
  memory = "256mb"
  cpu_kind = "shared"
  cpus = 1
```

### Attacher la base de données

```bash
fly postgres attach cammap-db --app cammap-backend
```

Cela injecte automatiquement `DATABASE_URL` dans les secrets de l'app.

### Ajouter les secrets (variables d'environnement)

```bash
fly secrets set \
  JWT_SECRET="un_secret_long_et_securise_minimum_32_caracteres" \
  JWT_EXPIRES_IN="7d" \
  FRONTEND_URL="https://cammap-frontend.fly.dev" \cd
  RATE_LIMIT_WINDOW_MS="900000" \
  RATE_LIMIT_MAX_REQUESTS="100" \
  --app cammap-backend
```

### Déployer le backend

```bash
cd server
fly deploy --app cammap-backend
```

### Migrer la base de données

```bash
fly ssh console --app cammap-backend
# Dans le shell :
npx prisma db push
npm run db:seed
exit
```

---

## Étape 3 : Configurer le Frontend

### Créer fly.toml dans /client

```bash
cd client
fly launch --name cammap-frontend --region cdg --no-deploy
```

Remplace le contenu du `client/fly.toml` généré par :

```toml
app = "cammap-frontend"
primary_region = "cdg"

[build]
  [build.args]
    VITE_API_URL = "https://cammap-backend.fly.dev/api"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

[[vm]]
  memory = "256mb"
  cpu_kind = "shared"
  cpus = 1
```

### Déployer le frontend

```bash
cd client
fly deploy --app cammap-frontend
```

---

## Étape 4 : Vérifier le déploiement

```bash
# Voir les logs backend
fly logs --app cammap-backend

# Voir les logs frontend
fly logs --app cammap-frontend

# Tester l'API
curl https://cammap-backend.fly.dev/api/health

# Ouvrir l'app dans le navigateur
fly open --app cammap-frontend
```

---

## Commandes utiles

```bash
# Voir le statut des apps
fly status --app cammap-backend
fly status --app cammap-frontend

# Ouvrir un shell dans le backend
fly ssh console --app cammap-backend

# Voir les secrets
fly secrets list --app cammap-backend

# Redéployer
fly deploy --app cammap-backend
fly deploy --app cammap-frontend

# Voir les machines
fly machines list --app cammap-backend
```

---

## Structure Fly.io

```
Fly.io
├── cammap-backend   (Node.js - /server)
├── cammap-frontend  (React - /client)
└── cammap-db        (PostgreSQL)
```

---

## URLs finales

- **Frontend** : https://cammap-frontend.fly.dev
- **Backend API** : https://cammap-backend.fly.dev/api
- **Health check** : https://cammap-backend.fly.dev/api/health

---

## Pourquoi Fly.io fonctionne bien avec Prisma

- Docker natif : le Dockerfile est exécuté tel quel
- Le working directory est respecté
- `prisma generate` s'exécute dans le bon contexte
- Les variables d'environnement sont injectées avant le build

---

## Support

- Documentation Fly.io : https://fly.io/docs
- Community : https://community.fly.io
