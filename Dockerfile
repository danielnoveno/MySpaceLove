# ============================================================
# LoveSpace - Railway Dockerfile
# Multi-stage build for optimized image size
# ============================================================

# --- Stage 1: Build Frontend ---
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=production

# Copy frontend source
COPY resources/js/ resources/js/
COPY resources/css/ resources/css/
COPY vite.config.js tailwind.config.js postcss.config.js tsconfig.json ./

# Build frontend
RUN npm run build

# --- Stage 2: PHP Application ---
FROM php:8.2-fpm-alpine AS production

# Install system dependencies
RUN apk add --no-cache \
    bash \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    oniguruma-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    icu-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install \
    pdo_mysql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    xml \
    zip \
    intl \
    opcache \
    && pecl install redis \
    && docker-php-ext-enable redis

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy composer files first (for layer caching)
COPY composer.json composer.lock ./

# Install PHP dependencies
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

# Copy application code
COPY . .

# Copy built frontend from stage 1
COPY --from=frontend-builder /app/public/build/ public/build/

# Generate autoloader
RUN composer dump-autoload --optimize

# Set permissions
RUN chown -R www-data:www-data /app \
    && chmod -R 755 /app/storage \
    && chmod -R 755 /app/bootstrap/cache

# Expose port
EXPOSE 8000

# Start PHP-FPM
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
