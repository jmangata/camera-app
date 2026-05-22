# CamMap Fort-de-France

Plateforme web de cartographie des caméras publiques à Fort-de-France, Martinique.

## Stack Technique

**Frontend**: React + Vite + TailwindCSS + Leaflet  
**Backend**: Node.js + Express + PostgreSQL + Prisma  
**Auth**: JWT avec rôles (admin/modérateur/utilisateur)  
**Hébergement**: Railway.app (recommandé) ou Render.com

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

## Déploiement

| Hébergeur | Guide | Gratuit |
|---|---|---|
| **Fly.io** (recommandé) | `docs/DEPLOYMENT_FLY.md` | Oui (permanent) |
| Railway | `docs/DEPLOYMENT_RAILWAY.md` | 5$/mois crédit |
| Render | `docs/DEPLOYMENT.md` | Oui (limité) |

Fly.io est recommandé : plan gratuit permanent, Docker natif, Prisma sans configuration spéciale.