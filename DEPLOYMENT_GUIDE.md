# 🚀 Quick Deployment Guide - LoveSpace

## Pre-Deployment Checklist

### 1. Environment Setup
```bash
# Copy production environment file
cp .env.production.example .env

# Update these values in .env:
# - APP_URL
# - DB_* (database credentials)
# - REDIS_* (if using Redis)
# - MAIL_* (email configuration)
# - API keys (Gemini, Spotify, etc.)
```

### 2. Install Dependencies
```bash
# PHP dependencies (production only)
composer install --optimize-autoloader --no-dev

# Node dependencies
npm ci

# Or use the deployment script
chmod +x deploy.sh
./deploy.sh
```

### 3. Database Setup
```bash
# Run migrations
php artisan migrate --force

# Add performance indexes
# This migration was created: 2025_12_24_231234_add_performance_indexes_to_tables.php
# It will automatically add indexes to improve query performance
```

### 4. Build Assets
```bash
# Build optimized frontend assets
npm run build

# This will create optimized chunks:
# - react-vendor.js (React & React DOM)
# - inertia-vendor.js (Inertia.js)
# - ui-vendor.js (UI components)
# - Feature-specific chunks (maps, pdf, animation, video)
```

### 5. Optimize Laravel
```bash
# Cache configuration
php artisan config:cache

# Cache routes
php artisan route:cache

# Cache views
php artisan view:cache

# Cache events
php artisan event:cache

# Link storage
php artisan storage:link
```

## Server Requirements

### Minimum Requirements
- PHP 8.2 or higher
- MySQL 5.7+ or MariaDB 10.3+
- Nginx or Apache
- Composer
- Node.js 18+ & NPM

### Recommended for Production
- PHP 8.2 with OPcache enabled
- MySQL 8.0+ or MariaDB 10.6+
- Redis 6.0+ (for cache and sessions)
- Nginx with HTTP/2
- SSL Certificate (Let's Encrypt)

### PHP Extensions Required
```
- BCMath
- Ctype
- Fileinfo
- JSON
- Mbstring
- OpenSSL
- PDO
- Tokenizer
- XML
- Redis (recommended)
```

## Performance Optimizations Applied

### ✅ Database Optimizations
- **Indexes Added**: All foreign keys and frequently queried columns
- **Query Optimization**: Selective column loading in controllers
- **Caching**: Dashboard data cached for 30 minutes

### ✅ Frontend Optimizations
- **Code Splitting**: Vendor and feature-based chunks
- **Minification**: Terser minification with console.log removal
- **Compression**: Gzip/Brotli ready
- **Asset Optimization**: Separate folders for images, fonts, and assets

### ✅ Laravel Optimizations
- **Config Caching**: All config files cached
- **Route Caching**: Routes pre-compiled
- **View Caching**: Blade templates pre-compiled
- **Autoloader Optimization**: Composer autoloader optimized

### ✅ Caching Strategy
- **Cache Driver**: Redis (recommended) or Database
- **Session Driver**: Redis (recommended) or Database
- **Query Caching**: Implemented in DashboardController
- **Cache Invalidation**: CacheService for managing cache

## Quick Commands Reference

### Development
```bash
# Start development server
php artisan serve

# Start Vite dev server
npm run dev

# Watch for changes
npm run dev -- --host
```

### Production Deployment
```bash
# Full deployment (automated)
./deploy.sh

# Manual deployment steps
composer install --optimize-autoloader --no-dev
npm ci && npm run build
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan storage:link
```

### Cache Management
```bash
# Clear all caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Rebuild caches
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Maintenance
```bash
# Enable maintenance mode
php artisan down --refresh=15

# Disable maintenance mode
php artisan up

# Clear old sessions
php artisan session:gc

# Optimize database
php artisan db:optimize
```

## Monitoring

### Check Application Health
```bash
# Check Redis connection
redis-cli ping

# Check database connection
php artisan db:show

# Check queue status (if using queues)
php artisan queue:work --once

# View logs
tail -f storage/logs/laravel.log
```

### Performance Metrics to Monitor
1. **Page Load Time**: Should be < 2 seconds
2. **Database Queries**: Should be < 20 per page
3. **Memory Usage**: Should be < 128MB per request
4. **Cache Hit Rate**: Should be > 80%

## Troubleshooting

### Issue: 500 Internal Server Error
```bash
# Check logs
tail -f storage/logs/laravel.log

# Clear and rebuild caches
php artisan cache:clear
php artisan config:cache
```

### Issue: Assets Not Loading
```bash
# Rebuild assets
npm run build

# Check public directory permissions
chmod -R 755 public
```

### Issue: Slow Performance
```bash
# Check if Redis is running
redis-cli ping

# Check OPcache status
php -i | grep opcache

# Enable query logging
# Add to .env: DB_LOG_QUERIES=true
```

### Issue: Database Connection Failed
```bash
# Test database connection
php artisan db:show

# Check .env database credentials
# Verify database server is running
```

## Security Checklist

- [ ] `APP_DEBUG=false` in production
- [ ] `APP_ENV=production`
- [ ] SSL certificate installed
- [ ] Strong database password
- [ ] API keys secured
- [ ] File permissions set correctly (755 for directories, 644 for files)
- [ ] `.env` file not in version control
- [ ] Security headers configured in Nginx
- [ ] Rate limiting enabled (optional)

## Post-Deployment Verification

1. **Test Homepage**: Visit your domain
2. **Test Login**: Try logging in
3. **Test Dashboard**: Check dashboard loads correctly
4. **Test Assets**: Verify images and styles load
5. **Check Logs**: No errors in `storage/logs/laravel.log`
6. **Test Performance**: Page load < 2 seconds
7. **Test Cache**: Verify Redis is being used
8. **Test Email**: Send a test email

## Support & Documentation

- **Performance Report**: See `PERFORMANCE_OPTIMIZATION.md`
- **Cleanup Guide**: See `CLEANUP_CHECKLIST.md`
- **Nginx Config**: See `nginx.conf.example`
- **Laravel Docs**: https://laravel.com/docs

---

**Need Help?** Check the logs first:
```bash
tail -f storage/logs/laravel.log
```

**Performance Issues?** Enable slow query logging:
```env
DB_LOG_QUERIES=true
DB_SLOW_QUERY_TIME=1000
```
