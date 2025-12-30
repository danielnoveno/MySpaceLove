#!/bin/bash

# LoveSpace Post-Deployment Script for Shared Hosting
# Run this script on the server after uploading files

echo "========================================="
echo "LoveSpace - Post-Deployment Setup"
echo "========================================="
echo ""

# Check if we're in the laravel directory
if [ ! -f "artisan" ]; then
    echo "✗ Error: artisan file not found!"
    echo "Please run this script from the Laravel root directory (/home/pengstud/laravel)"
    exit 1
fi

# Step 1: Set correct permissions
echo "Step 1: Setting file permissions..."
chmod -R 755 storage
chmod -R 755 bootstrap/cache
chmod 644 .env
echo "✓ Permissions set"
echo ""

# Step 2: Check if .env exists
echo "Step 2: Checking environment file..."
if [ ! -f .env ]; then
    echo "✗ .env file not found!"
    echo "Please copy .env.production to .env and configure it"
    exit 1
else
    echo "✓ .env file exists"
fi
echo ""

# Step 3: Generate application key if needed
echo "Step 3: Checking application key..."
if grep -q "APP_KEY=base64:YOUR_PRODUCTION_KEY_HERE" .env || ! grep -q "APP_KEY=" .env; then
    echo "Generating new application key..."
    php artisan key:generate --force
    echo "✓ Application key generated"
else
    echo "✓ Application key already set"
fi
echo ""

# Step 4: Clear old caches
echo "Step 4: Clearing old caches..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
echo "✓ Caches cleared"
echo ""

# Step 5: Run migrations
echo "Step 5: Running database migrations..."
read -p "Do you want to run migrations? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    php artisan migrate --force
    echo "✓ Migrations completed"
else
    echo "⊙ Migrations skipped"
fi
echo ""

# Step 6: Create session table if using database sessions
echo "Step 6: Checking session configuration..."
SESSION_DRIVER=$(php artisan tinker --execute="echo config('session.driver');" 2>/dev/null)
if [ "$SESSION_DRIVER" = "database" ]; then
    echo "Session driver is database, ensuring session table exists..."
    php artisan session:table 2>/dev/null
    php artisan migrate --force
    echo "✓ Session table ready"
else
    echo "⊙ Session driver is $SESSION_DRIVER (not database)"
fi
echo ""

# Step 7: Create storage symlink
echo "Step 7: Creating storage symlink..."
php artisan storage:link
echo "✓ Storage symlink created"
echo ""

# Step 8: Cache configuration for production
echo "Step 8: Caching configuration..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
echo "✓ Configuration cached"
echo ""

# Step 9: Optimize autoloader
echo "Step 9: Optimizing autoloader..."
composer dump-autoload --optimize
echo "✓ Autoloader optimized"
echo ""

# Step 10: Test database connection
echo "Step 10: Testing database connection..."
php artisan tinker --execute="try { DB::connection()->getPdo(); echo 'Database connection successful'; } catch (Exception \$e) { echo 'Database connection failed: ' . \$e->getMessage(); }" 2>/dev/null
echo ""

echo "========================================="
echo "Post-deployment complete!"
echo "========================================="
echo ""
echo "Important reminders:"
echo "1. Ensure public_html/index.php points to /home/pengstud/laravel"
echo "2. Check that public_html/.htaccess is configured correctly"
echo "3. Verify APP_URL in .env matches your domain"
echo "4. Check SESSION_DOMAIN in .env (use .yourdomain.com)"
echo "5. Monitor logs at: storage/logs/laravel.log"
echo ""
echo "Test your application at: ${APP_URL:-your-domain.com}"
echo ""
