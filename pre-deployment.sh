#!/bin/bash

# LoveSpace Production Deployment Script
# Run this script before uploading to production

echo "========================================="
echo "LoveSpace - Pre-Deployment Preparation"
echo "========================================="
echo ""

# Step 1: Clear all caches
echo "Step 1: Clearing all caches..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
echo "✓ Caches cleared"
echo ""

# Step 2: Run tests (optional)
echo "Step 2: Running tests..."
# php artisan test
echo "⊙ Tests skipped (uncomment above to run)"
echo ""

# Step 3: Install production dependencies
echo "Step 3: Installing production dependencies..."
composer install --optimize-autoloader --no-dev
echo "✓ Composer dependencies installed"
echo ""

# Step 4: Build frontend assets
echo "Step 4: Building frontend assets..."
npm run build
echo "✓ Frontend assets built"
echo ""

# Step 5: Optimize for production
echo "Step 5: Optimizing for production..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
echo "✓ Application optimized"
echo ""

# Step 6: Create production environment file
echo "Step 6: Checking production environment..."
if [ ! -f .env.production ]; then
    echo "✗ .env.production not found!"
    echo "Please create .env.production file before deploying"
else
    echo "✓ .env.production exists"
fi
echo ""

echo "========================================="
echo "Pre-deployment complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Update .env.production with your production credentials"
echo "2. Upload all files to your hosting (except node_modules, .git)"
echo "3. Copy .env.production to .env on server"
echo "4. Run post-deployment.sh on server"
echo ""
