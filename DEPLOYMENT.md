# Déploiement Astro Hybrid SSR + WordPress Headless

## Architecture

- **Mode** : Hybrid SSR (pages blog dynamiques, reste statique)
- **Adaptateur** : @astrojs/node (standalone)
- **Runtime** : Node.js 22+ avec PM2
- **WordPress** : API REST headless (wp.anthonyrusso.fr)
- **Déploiement** : PM2 sur serveur dédié

## Avantages mode Hybrid SSR

✅ Articles WordPress **en temps réel** (pas de rebuild)  
✅ Pages statiques rapides (homepage, services)  
✅ SEO optimal (rendu serveur)  
✅ Pas de webhook/rebuild nécessaire  

## Prérequis serveur

```bash
# Node.js version 22+
node --version  # >= 22.12.0

# PM2 installé globalement
npm install -g pm2

# Nginx configuré en reverse proxy (optionnel mais recommandé)
```

## Installation initiale

### 1. Upload du projet

```bash
# SSH sur le serveur
ssh user@server

# Créer le répertoire
mkdir -p /home/username/anthonyrusso-fr
cd /home/username/anthonyrusso-fr

# Upload via rsync (depuis local)
rsync -avz --exclude 'node_modules' \
  /Users/anthonyrusso/anthonyrusso-fr/ \
  user@server:/home/username/anthonyrusso-fr/
```

### 2. Configuration environnement

```bash
# Créer .env sur le serveur
cat > .env << 'ENVEOF'
WORDPRESS_API_URL=https://wp.anthonyrusso.fr/wp-json/wp/v2
HOST=0.0.0.0
PORT=3006
ENVEOF
```

### 3. Build et démarrage

```bash
# Installer dépendances
npm install --production

# Build
npm run build

# Vérifier présence du serveur SSR
ls -lh dist/server/entry.mjs

# Démarrer avec PM2
pm2 start dist/server/entry.mjs --name anthonyrusso

# Sauvegarder la config PM2
pm2 save

# Auto-restart au reboot
pm2 startup
# Suivre les instructions affichées
```

### 4. Configuration Nginx (reverse proxy)

```nginx
# /etc/nginx/sites-available/anthonyrusso.fr

server {
    listen 80;
    server_name anthonyrusso.fr www.anthonyrusso.fr;
    
    # Redirection HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name anthonyrusso.fr www.anthonyrusso.fr;

    # Certificat SSL (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/anthonyrusso.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/anthonyrusso.fr/privkey.pem;

    # Proxy vers Node.js (PM2)
    location / {
        proxy_pass http://127.0.0.1:3006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Logs
    access_log /var/log/nginx/anthonyrusso-access.log;
    error_log /var/log/nginx/anthonyrusso-error.log;
}
```

```bash
# Activer le site
ln -s /etc/nginx/sites-available/anthonyrusso.fr /etc/nginx/sites-enabled/

# Tester config
nginx -t

# Recharger
systemctl reload nginx
```

## Déploiement via script automatique

### Depuis votre machine locale

```bash
# 1. Éditer deploy.sh avec vos credentials
nano deploy.sh

# Modifier:
REMOTE_USER="votre-user"
REMOTE_HOST="votre-serveur.com"
REMOTE_DIR="/home/votre-user/anthonyrusso-fr"

# 2. Lancer le déploiement
./deploy.sh
```

Le script :
- Build le site localement
- Crée une archive (dist + deps)
- Upload via SCP
- Extrait et redémarre PM2 sur le serveur

## Déploiement manuel

```bash
# Local : build
npm run build

# Local : créer archive
tar -czf deploy.tar.gz dist/ package.json package-lock.json .env

# Upload
scp deploy.tar.gz user@server:/home/username/anthonyrusso-fr/

# Serveur : extraire et déployer
ssh user@server
cd /home/username/anthonyrusso-fr
tar -xzf deploy.tar.gz
rm deploy.tar.gz
npm install --production
pm2 restart anthonyrusso
```

## Monitoring

### Statut PM2

```bash
pm2 status
pm2 info anthonyrusso
```

### Logs en temps réel

```bash
pm2 logs anthonyrusso

# Erreurs uniquement
pm2 logs anthonyrusso --err

# 100 dernières lignes
pm2 logs anthonyrusso --lines 100
```

### Métriques

```bash
pm2 monit
```

## Gestion PM2

### Redémarrage

```bash
# Redémarrage simple
pm2 restart anthonyrusso

# Redémarrage sans downtime (0-downtime reload)
pm2 reload anthonyrusso

# Arrêt
pm2 stop anthonyrusso

# Suppression
pm2 delete anthonyrusso
```

### Configuration avancée PM2

Créer `ecosystem.config.cjs` :

```javascript
module.exports = {
  apps: [{
    name: 'anthonyrusso',
    script: './dist/server/entry.mjs',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3006,
      HOST: '0.0.0.0'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    watch: false
  }]
};
```

Utilisation :
```bash
pm2 start ecosystem.config.cjs
pm2 save
```

## Cache et performance

### Headers cache Nginx (optionnel)

```nginx
# Dans le bloc server
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    proxy_pass http://127.0.0.1:3006;
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Troubleshooting

### Port déjà utilisé

```bash
# Trouver le processus
lsof -i :3006

# Ou
netstat -tulpn | grep 3006

# Tuer le processus
kill -9 <PID>
```

### WordPress inaccessible

Articles ne s'affichent pas → vérifier :

```bash
# Test API WordPress
curl https://wp.anthonyrusso.fr/wp-json/wp/v2/posts?per_page=1

# Vérifier variable env
cat /home/username/anthonyrusso-fr/.env

# Logs PM2
pm2 logs anthonyrusso --lines 50
```

### Redémarrage après crash

```bash
# PM2 auto-restart est activé par défaut
pm2 status

# Forcer redémarrage
pm2 restart anthonyrusso

# Voir pourquoi il crash
pm2 logs anthonyrusso --err --lines 100
```

### Permissions fichiers

```bash
# Corriger propriétaire
chown -R username:username /home/username/anthonyrusso-fr

# Permissions recommandées
chmod 755 /home/username/anthonyrusso-fr
chmod 644 /home/username/anthonyrusso-fr/.env
```

## Workflow publication WordPress

1. **Publier article** dans WordPress (wp.anthonyrusso.fr/wp-admin)
2. **Accessible immédiatement** sur anthonyrusso.fr/blog

**Délai** : 0 seconde (SSR temps réel)

Pas de rebuild, pas de webhook, pas d'attente.

## Backup et rollback

### Backup avant déploiement

```bash
# Sur serveur
cd /home/username
tar -czf anthonyrusso-backup-$(date +%Y%m%d-%H%M%S).tar.gz anthonyrusso-fr/

# Garder derniers 5 backups
ls -t anthonyrusso-backup-*.tar.gz | tail -n +6 | xargs rm -f
```

### Rollback

```bash
# Restaurer backup
tar -xzf anthonyrusso-backup-20260408-150000.tar.gz
cd anthonyrusso-fr
pm2 restart anthonyrusso
```

## Mise à jour Node.js

```bash
# Installer nvm (si pas déjà fait)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Installer Node.js 22
nvm install 22
nvm use 22
nvm alias default 22

# Vérifier
node --version

# Rebuild et redémarrer
cd /home/username/anthonyrusso-fr
npm rebuild
pm2 restart anthonyrusso
```

## Performance attendue

- **Pages statiques** (homepage, services) : < 100ms
- **Pages blog SSR** : 200-500ms (requête WordPress)
- **Mémoire PM2** : ~100-150MB par instance
- **CPU** : < 5% en idle, pics à 20-30% lors des requêtes

## Checklist déploiement

- [ ] Node.js 22+ installé
- [ ] PM2 installé globalement
- [ ] .env configuré avec WORDPRESS_API_URL
- [ ] Build réussi (dist/server/entry.mjs existe)
- [ ] PM2 démarré : `pm2 start dist/server/entry.mjs --name anthonyrusso`
- [ ] PM2 sauvegardé : `pm2 save`
- [ ] Auto-restart configuré : `pm2 startup`
- [ ] Nginx reverse proxy configuré (si utilisé)
- [ ] SSL/HTTPS actif
- [ ] Test : https://anthonyrusso.fr/blog affiche les articles

## Support

En cas de problème, vérifier dans l'ordre :

1. `pm2 status` → app running ?
2. `pm2 logs anthonyrusso` → erreurs ?
3. `curl http://127.0.0.1:3006/blog` → serveur répond ?
4. `nginx -t` → config nginx valide ?
5. Vérifier .env et WORDPRESS_API_URL
