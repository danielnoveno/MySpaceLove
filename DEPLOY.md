# LoveSpace - Panduan Deploy GRATIS ke Internet

## Arsitektur Deploy

```
┌─────────────────────────────────────────────────────┐
│              ORACLE CLOUD (GRATIS SELAMANYA)         │
│                                                     │
│  ┌──────────────┐     ┌──────────────────────────┐  │
│  │  Ubuntu VM   │     │  Clever Cloud MySQL      │  │
│  │  2 OCPU ARM  │────▶│  (Free DEV plan)         │  │
│  │  12 GB RAM   │     │  Database: lovespace     │  │
│  │  200 GB      │     └──────────────────────────┘  │
│  │              │                                   │
│  │  Nginx       │                                   │
│  │  PHP 8.2     │                                   │
│  │  Laravel 12  │                                   │
│  └──────────────┘                                   │
│                                                     │
│  Biaya: $0/bulan SELAMANYA                          │
└─────────────────────────────────────────────────────┘
```

---

## Langkah 1: Setup Oracle Cloud (VM Server)

1. Buka **[cloud.oracle.com](https://cloud.oracle.com)**
2. Sign up (gratis, butuh credit card untuk verifikasi saja)
3. Buat VM Instance:
   - **Name:** `lovespace-server`
   - **Image:** Ubuntu 22.04 or 24.04
   - **Shape:** VM.Standard.A1.Flex (ARM)
   - **OCPU:** 2
   - **RAM:** 12 GB
   - **Boot Volume:** 50 GB
4. Upload **SSH public key**
5. Catat **Public IP** (contoh: `129.154.xx.xx`)

### Setup Security Rules

Oracle Cloud memblokir semua port. Buka port yang dibutuhkan:

1. **Oracle Console** → **Networking** → **Virtual Cloud Networks** → **Security Lists**
2. Klik **"Add Ingress Rules"**:

| Port | Protocol | Source | Purpose |
|---|---|---|---|
| 22 | TCP | **IP Anda saja** | SSH |
| 80 | TCP | 0.0.0.0/0 | HTTP |
| 443 | TCP | 0.0.0.0/0 | HTTPS |

---

## Langkah 2: Setup Clever Cloud (Database MySQL)

1. Buka **[clever.cloud](https://www.clever.cloud)**
2. Sign up (gratis, dapat €20 credit)
3. Klik **"Create an add-on"** → **"MySQL"**
4. Pilih **"DEV"** plan (gratis)
5. Isi nama: `lovespace`
6. Catat koneksi:

```
Host: mysql-xxxxx.clever-cloud.com
Port: 3306
Database: databases_xxxxx
User: uxxxxx
Password: xxxxxxxx
```

---

## Langkah 3: Setup Server (SSH ke VM)

```bash
# Connect ke VM
ssh -i ~/.ssh/oracle_key ubuntu@129.154.xx.xx

# Jalankan script setup otomatis
curl -sL https://raw.githubusercontent.com/danielnoveno/MySpaceLove/main/server-setup.sh | bash
```

Atau manual:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install PHP 8.2 + extensions
sudo apt install -y \
  php8.2 php8.2-fpm php8.2-cli \
  php8.2-mbstring php8.2-xml php8.2-curl \
  php8.2-mysql php8.2-zip php8.2-bcmath \
  php8.2-tokenizer php8.2-gd php8.2-intl \
  unzip git nginx certbot python3-certbot-nginx

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

---

## Langkah 4: Deploy Laravel

```bash
# Buat directory
sudo mkdir -p /var/www/lovespace
sudo chown ubuntu:ubuntu /var/www/lovespace
cd /var/www/lovespace

# Clone repository
git clone https://github.com/danielnoveno/MySpaceLove.git .

# Install dependencies
composer install --optimize-autoloader --no-dev
npm ci --only=production
npm run build

# Setup environment
cp .env.production.example .env
php artisan key:generate

# Edit .env (isi kredensial Clever Cloud)
nano .env
```

Isi `.env`:
```env
APP_NAME=LoveSpace
APP_ENV=production
APP_KEY=base64:xxx
APP_DEBUG=false
APP_URL=http://129.154.xx.xx

DB_CONNECTION=mysql
DB_HOST=mysql-xxxxx.clever-cloud.com
DB_PORT=3306
DB_DATABASE=databases_xxxxx
DB_USERNAME=uxxxxx
DB_PASSWORD=xxxxxxxx

SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database
FILESYSTEM_DISK=local
```

```bash
# Migrate & optimize
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

# Set permissions
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

---

## Langkah 5: Setup Nginx

```bash
sudo nano /etc/nginx/sites-available/lovespace
```

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/lovespace/public;
    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.ht {
        deny all;
    }

    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/lovespace /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl restart php8.2-fpm
```

---

## Langkah 6: SSL (Opsional - butuh domain)

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo certbot renew --dry-run
```

---

## Langkah 7: Auto Deploy

```bash
# Jalankan deploy script
cd /var/www/lovespace
./deploy.sh
```

---

## Useful Commands

```bash
# SSH ke server
ssh -i ~/.ssh/oracle_key ubuntu@129.154.xx.xx

# Deploy update
cd /var/www/lovespace && ./deploy.sh

# Lihat logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/www/lovespace/storage/logs/laravel.log

# Restart services
sudo systemctl restart php8.2-fpm
sudo systemctl restart nginx

# Migrate database
php artisan migrate --force

# Clear cache
php artisan optimize:clear
```

---

## Troubleshooting

| Masalah | Solusi |
|---|---|
| **502 Bad Gateway** | Cek PHP-FPM: `sudo systemctl status php8.2-fpm` |
| **Database connection failed** | Cek kredensial di `.env` |
| **Permission denied** | Jalankan: `sudo chown -R www-data:www-data storage bootstrap/cache` |
| **CSS/JS tidak load** | Jalankan: `npm run build` |
| **Session expired** | Pastikan `SESSION_DRIVER=database` |

---

## Biaya

| Service | Biaya | Keterangan |
|---|---|---|
| Oracle Cloud VM | **$0 selamanya** | 2 OCPU, 12 GB RAM, 200 GB |
| Clever Cloud MySQL | **$0** | DEV plan |
| SSL | **$0** | Let's Encrypt |
| Domain | **~$10/tahun** | Opsional |
| **TOTAL** | **$0/bulan** | Gratis selamanya! |
