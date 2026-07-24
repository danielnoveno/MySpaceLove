#!/bin/bash
# ============================================================
# LoveSpace - Deploy Script untuk Oracle Cloud
# ============================================================
# Jalankan di server: ./deploy.sh
# ============================================================

set -e

APP_DIR="/var/www/lovespace"
echo "🚀 LoveSpace Deploy Dimulai..."
echo "================================"

cd "$APP_DIR"

# 1. Pull latest code
echo ""
echo "📥 Pulling latest code..."
git pull origin main

# 2. Install PHP dependencies
echo ""
echo "📦 Installing PHP dependencies..."
composer install --optimize-autoloader --no-dev --quiet

# 3. Install & build frontend
echo ""
echo "🎨 Building frontend assets..."
npm ci --only=production --quiet 2>/dev/null || npm install --only=production --quiet
npm run build --quiet

# 4. Laravel optimize
echo ""
echo "⚡ Optimizing Laravel..."
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

# 5. Fix permissions
echo ""
echo "🔒 Fixing permissions..."
sudo chown -R www-data:www-data "$APP_DIR/storage"
sudo chown -R www-data:www-data "$APP_DIR/bootstrap/cache"
sudo chmod -R 775 "$APP_DIR/storage"
sudo chmod -R 775 "$APP_DIR/bootstrap/cache"

# 6. Restart services
echo ""
echo "🔄 Restarting services..."
sudo systemctl reload php8.2-fpm 2>/dev/null || sudo systemctl restart php8.2-fpm
sudo systemctl reload nginx 2>/dev/null || sudo systemctl restart nginx

echo ""
echo "================================"
echo "✅ Deploy selesai!"
echo "🌐 Website: http://$(hostname -I | awk '{print $1}')"
echo "================================"
