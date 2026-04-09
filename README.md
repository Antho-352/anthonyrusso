# anthonyrusso.fr

Site Astro SSR + WordPress Headless

## Architecture

- **Frontend** : Astro 6 en mode `server` (SSR)
- **Adaptateur** : @astrojs/node (standalone)
- **CMS** : WordPress headless (wp.anthonyrusso.fr)
- **Déploiement** : PM2 sur serveur dédié

## Pages

**SSR (temps réel)** :
- `/` - Homepage (affiche 3 derniers articles)
- `/blog` - Liste articles
- `/blog/[slug]` - Article individuel

**Statiques (pré-rendues)** :
- `/audit-netlinking`
- `/netlinking-sur-mesure`
- `/mon-reseau`
- `/resultats`
- `/mentions-legales`

## Développement local

```bash
# Installer dépendances
npm install

# Lancer dev server
npm run dev

# Build
npm run build

# Preview du build
npm run preview
```

**Variables d'environnement** (`.env`) :
```bash
WORDPRESS_API_URL=https://wp.anthonyrusso.fr/wp-json/wp/v2
HOST=0.0.0.0
PORT=3006
```

## Déploiement

### Via script automatique

```bash
# Éditer deploy.sh avec vos credentials
nano deploy.sh

# Déployer
./deploy.sh
```

### Manuel

```bash
# Build
npm run build

# Vérifier entry point
ls dist/server/entry.mjs

# Sur serveur
pm2 start dist/server/entry.mjs --name anthonyrusso
pm2 save
```

Documentation complète : [DEPLOYMENT.md](DEPLOYMENT.md)

## Stack technique

- Astro 6
- Node.js 22+
- WordPress REST API
- PM2
- Nginx (reverse proxy)

## Workflow publication

1. Publier article dans WordPress
2. **Article visible immédiatement** sur anthonyrusso.fr/blog

Délai : 0 seconde (SSR)
