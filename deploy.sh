#!/bin/bash
#
# Script de déploiement Astro SSR Hybrid + PM2
# Usage: ./deploy.sh
#

set -e

echo "🚀 Déploiement anthonyrusso.fr (Hybrid SSR)"
echo "============================================"

# Configuration
REMOTE_USER="username"  # À modifier
REMOTE_HOST="votre-serveur.com"  # À modifier
REMOTE_DIR="/home/username/anthonyrusso-fr"
PM2_APP_NAME="anthonyrusso"

# Build local
echo ""
echo "📦 Build du site Astro..."
npm run build

# Vérifier que le build a créé le serveur SSR
if [ ! -f "dist/server/entry.mjs" ]; then
    echo "❌ Erreur: dist/server/entry.mjs introuvable. Le build hybrid a échoué."
    exit 1
fi

echo "✅ Build réussi"

# Créer l'archive de déploiement
echo ""
echo "📦 Création de l'archive de déploiement..."
tar -czf deploy.tar.gz \
    dist/ \
    package.json \
    package-lock.json \
    .env \
    public/.htaccess

echo "✅ Archive créée: deploy.tar.gz"

# Upload vers le serveur
echo ""
echo "📤 Upload vers le serveur..."
scp deploy.tar.gz "$REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/"

# Déploiement sur le serveur
echo ""
echo "🔧 Déploiement et redémarrage PM2..."
ssh "$REMOTE_USER@$REMOTE_HOST" << 'ENDSSH'
cd /home/username/anthonyrusso-fr

# Extraire l'archive
tar -xzf deploy.tar.gz
rm deploy.tar.gz

# Installer les dépendances de production
npm install --production

# Redémarrer PM2
pm2 delete anthonyrusso 2>/dev/null || true
pm2 start dist/server/entry.mjs --name anthonyrusso
pm2 save

echo "✅ Déploiement terminé"
pm2 status
ENDSSH

# Nettoyage local
rm deploy.tar.gz

echo ""
echo "✅ Déploiement réussi!"
echo ""
echo "📊 Vérifier le statut:"
echo "   ssh $REMOTE_USER@$REMOTE_HOST 'pm2 status'"
echo ""
echo "📋 Voir les logs:"
echo "   ssh $REMOTE_USER@$REMOTE_HOST 'pm2 logs anthonyrusso'"
echo ""
echo "🌐 Site accessible sur: https://anthonyrusso.fr"
