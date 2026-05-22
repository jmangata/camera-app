# CamMap Fort-de-France

Plateforme web de cartographie des caméras publiques à Fort-de-France, Martinique.

## Stack Technique

**Frontend**: React + Vite + TailwindCSS + Leaflet  
**Backend**: Node.js + Express + PostgreSQL + Prisma  
**Auth**: JWT avec rôles (admin/modérateur/utilisateur)  
**Hébergement**: Optimisé pour Render.com

## Démarrage Rapide

```bash
# Installer dépendances
npm run install:all

# Démarrer développement
npm run dev
```

## Structure

```
├── client/          # Frontend React
├── server/          # Backend API
├── docs/            # Documentation
├── docker/          # Configuration Docker
└── scripts/         # Scripts utilitaires
```

## Déploiement Render

Voir `docs/DEPLOYMENT.md` pour le guide complet.