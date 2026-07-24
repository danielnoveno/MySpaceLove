#!/bin/bash
# ============================================================
# LoveSpace - Server Setup Script untuk Oracle Cloud
# ============================================================
# Jalankan di server baru: curl -sL URL | bash
# Atau: bash server-setup.sh
# ============================================================

set -e

echo "🔧 LoveSpace Server Setup"
echo "========================="
echo ""

# 1. Update system
echo "📥 Updating system..."
sudo apt update && sudo apt upgrade -y

# 2. Install PHP 8.2
echo ""
echo "🐘 Installing PHP 8.2..."
sudo apt install -y \
  php8.2 \
  php8.2-fpm \
  php8.2-cli \
  php8.2-mbstring \
  php8.2-xml \
  php8.2-curl \
  php8.2-mysql \
  php8.2-zip \
  php8.2-bcmath \
  php8.2-tokenizer \
  php8.2-gd \
  php8.2-intl \
  php8.2-redis

# 3. Install Nginx
echo ""
echo "🌐 Installing Nginx..."
sudo apt install -y nginx

# 4. Install Composer
echo ""
echo "📦 Installing Composer..."
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# 5. Install Node.js 20
echo ""
echo "📗 Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 6. Install Certbot (SSL)
echo ""
echo "🔐 Installing Certbot..."
sudo apt install -y certbot python3-certbot-nginx

# 7. Install Git
echo ""
echo "📥 Installing Git..."
sudo apt install -y git unzip

# 8. Create project directory
echo ""
echo "📁 Creating project directory..."
sudo mkdir -p /var/www/lovespace
sudo chown ubuntu:ubuntu /var/www/lovespace

# 9. Setup UFW Firewall
echo ""
echo "🔥 Setting up firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# 10. Enable services
echo ""
echo "🔄 Enabling services..."
sudo systemctl enable nginx
sudo systemctl enable php8.2-fpm

echo ""
echo "========================="
echo "✅ Server setup selesai!"
echo ""
echo "Langkah selanjutnya:"
echo "1. Clone repository:"
echo "   cd /var/www/lovespace"
echo "   git clone https://github.com/danielnoveno/MySpaceLove.git ."
echo ""
echo "2. Setup .env:"
echo "   cp .env.production.example .env"
echo "   php artisan key:generate"
echo "   nano .env"
echo ""
echo "3. Install dependencies:"
echo "   composer install --optimize-autoloader --no-dev"
echo "   npm ci --only=production"
echo "   npm run build"
echo ""
echo "4. Setup Nginx:"
echo "   sudo nano /etc/nginx/sites-available/lovespace"
echo "   (Lihat DEPLOY.md untuk konfigurasi)"
echo ""
echo "5. Deploy:"
echo "   ./deploy.sh"
echo "========================="
