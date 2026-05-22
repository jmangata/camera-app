# Démarrage Rapide - CamMap Fort-de-France

## Installation

```bash
# Cloner le projet
git clone <repository-url>
cd camera-app

# Installer toutes les dépendances
npm run install:all

# Configuration
cp server/.env.example server/.env
cp client/.env.example client/.env
```

## Configuration Base de Données

1. Créez une base PostgreSQL `cammap_fdf`
2. Mettez à jour `DATABASE_URL` dans `server/.env`
3. Exécutez les migrations:

```bash
cd server
npx prisma db push
npm run db:seed
```

## Démarrage

```bash
# Démarrer frontend et backend
npm run dev

# Ou séparément:
npm run dev:server  # Backend sur http://localhost:3001
npm run dev:client  # Frontend sur http://localhost:5173
```

## Comptes de Démonstration

- **Admin**: admin@cammap.com / admin123
- **Modérateur**: moderator@cammap.com / user123  
- **Utilisateur**: user@cammap.com / user123

## Docker

```bash
docker-compose up -d
```

## Déploiement Render

Voir `docs/DEPLOYMENT.md` pour le guide complet.