#!/bin/bash

# LoveSpace Deployment & Optimization Script
# This script prepares the application for production deployment

echo "========================================="
echo "LoveSpace Production Deployment Script"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if .env exists
if [ ! -f .env ]; then
    print_error ".env file not found!"
    echo "Please create .env file from .env.production.example"
    exit 1
fi

print_success ".env file found"

# Step 1: Install PHP dependencies
echo ""
echo "Step 1: Installing PHP dependencies..."
composer install --optimize-autoloader --no-dev
if [ $? -eq 0 ]; then
    print_success "PHP dependencies installed"
else
    print_error "Failed to install PHP dependencies"
    exit 1
fi

# Step 2: Install Node dependencies
echo ""
echo "Step 2: Installing Node dependencies..."
npm ci
if [ $? -eq 0 ]; then
    print_success "Node dependencies installed"
else
    print_error "Failed to install Node dependencies"
    exit 1
fi

# Step 3: Clear all caches
echo ""
echo "Step 3: Clearing all caches..."
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan event:clear
print_success "All caches cleared"

# Step 4: Run database migrations
echo ""
echo "Step 4: Running database migrations..."
read -p "Do you want to run migrations? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    php artisan migrate --force
    if [ $? -eq 0 ]; then
        print_success "Migrations completed"
    else
        print_error "Migration failed"
        exit 1
    fi
else
    print_warning "Skipping migrations"
fi

# Step 5: Optimize Laravel
echo ""
echo "Step 5: Optimizing Laravel..."
php artisan config:cache
print_success "Config cached"

php artisan route:cache
print_success "Routes cached"

php artisan view:cache
print_success "Views cached"

php artisan event:cache
print_success "Events cached"

# Step 6: Build frontend assets
echo ""
echo "Step 6: Building frontend assets..."
npm run build
if [ $? -eq 0 ]; then
    print_success "Frontend assets built"
else
    print_error "Failed to build frontend assets"
    exit 1
fi

# Step 7: Set proper permissions
echo ""
echo "Step 7: Setting proper permissions..."
chmod -R 755 storage bootstrap/cache
print_success "Permissions set"

# Step 8: Create symbolic link for storage
echo ""
echo "Step 8: Creating storage symbolic link..."
php artisan storage:link
print_success "Storage linked"

# Step 9: Clear and warm up cache
echo ""
echo "Step 9: Warming up cache..."
php artisan cache:clear
php artisan config:cache
php artisan route:cache
print_success "Cache warmed up"

# Step 10: Run optimization tests
echo ""
echo "Step 10: Running optimization checks..."

# Check if Redis is available
if command -v redis-cli &> /dev/null; then
    redis-cli ping > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        print_success "Redis is running"
    else
        print_warning "Redis is not running. Consider starting Redis for better performance."
    fi
else
    print_warning "Redis is not installed. Consider installing Redis for better performance."
fi

# Check if OPcache is enabled
php -r "echo extension_loaded('Zend OPcache') ? 'yes' : 'no';" | grep -q "yes"
if [ $? -eq 0 ]; then
    print_success "OPcache is enabled"
else
    print_warning "OPcache is not enabled. Enable it in php.ini for better performance."
fi

# Final summary
echo ""
echo "========================================="
echo "Deployment Summary"
echo "========================================="
echo ""
print_success "Application is ready for production!"
echo ""
echo "Next steps:"
echo "1. Review your .env file for production settings"
echo "2. Ensure Redis is running (recommended)"
echo "3. Configure your web server (Nginx/Apache)"
echo "4. Set up SSL certificate"
echo "5. Configure queue workers if using queues"
echo "6. Set up monitoring and logging"
echo ""
echo "Performance tips:"
echo "- Use Redis for cache and sessions"
echo "- Enable OPcache in PHP"
echo "- Use HTTP/2 on your web server"
echo "- Enable Gzip/Brotli compression"
echo "- Use a CDN for static assets"
echo ""
print_success "Deployment completed successfully!"
