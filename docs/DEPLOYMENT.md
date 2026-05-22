# Déploiement sur Render.com

Ce guide explique comment déployer CamMap Fort-de-France sur Render.com.

## Prérequis

- Compte Render.com
- Repository GitHub avec le code du projet
- Compte PostgreSQL (Render ou externe)

## Configuration du Backend

### 1. Créer le Service Backend

1. Allez sur Render Dashboard → New → Web Service
2. Connectez votre repository GitHub
3. Configurez le service:

```
Name: cammap-backend
Environment: Node
Root Directory: server
Build Command: npm install && npx prisma generate && npm run build
Start Command: npm start
Instance Type: Free
```

### 2. Variables d'Environnement

Ajoutez ces variables d'environnement dans le service backend:

```
DATABASE_URL=postgresql://votre_user:votre_password@votre_host:5432/votre_db
JWT_SECRET=votre_secret_jwt_tres_securise
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://votre-frontend.onrender.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Base de Données

Créez une base de données PostgreSQL sur Render:

1. Dashboard → New → PostgreSQL
2. Configurez:
   - Database Name: cammap_fdf
   - User: cammap_user
   - Region: même région que vos services
3. Une fois créée, récupérez la connection string et ajoutez-la aux variables d'environnement

### 4. Migration de la Base

Après le premier déploiement, exécutez la migration:

1. Allez dans le service backend → Shell
2. Exécutez: `npx prisma db push`
3. Puis: `npm run db:seed`

## Configuration du Frontend

### 1. Créer le Service Frontend

1. Dashboard → New → Static Site
2. Configurez:

```
Name: cammap-frontend
Root Directory: client
Build Command: npm install && npm run build
Publish Directory: dist
```

### 2. Variables d'Environnement

Ajoutez cette variable:

```
VITE_API_URL=https://votre-backend.onrender.com/api
```

## Configuration CORS

Assurez-vous que l'URL de votre frontend est ajoutée aux variables d'environnement du backend:

```
FRONTEND_URL=https://votre-frontend.onrender.com
```

## Domaine Personnalisé (Optionnel)

1. Allez dans les settings de chaque service
2. Ajoutez votre domaine personnalisé
3. Configurez les DNS selon les instructions de Render

## Monitoring

- Les logs sont disponibles dans l'onglet "Logs" de chaque service
- Les métriques sont dans l'onglet "Metrics"
- Configurez les alertes si nécessaire

## Mise à Jour

Les mises à jour sont automatiques lors de chaque push sur la branche principale de votre repository.

## Sécurité

- Changez le JWT_SECRET par une valeur très sécurisée
- Utilisez HTTPS (automatique sur Render)
- Configurez des règles de pare-feu si nécessaire
- Surveillez les logs d'activité

## Support

En cas de problème:

1. Vérifiez les logs de chaque service
2. Vérifiez les variables d'environnement
3. Assurez-vous que la base de données est accessible
4. Consultez la documentation Render: https://render.com/docs