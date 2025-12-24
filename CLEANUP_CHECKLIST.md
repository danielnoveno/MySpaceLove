# Code Cleanup Checklist

## Files to Remove

### Temporary Files
- [ ] `temp.txt`
- [ ] `tempImage.svg`
- [ ] `temp_routes.txt`
- [ ] `temp_spotify_controller.txt`

### Commands to Clean Up
```bash
# Remove temporary files
rm -f temp.txt tempImage.svg temp_routes.txt temp_spotify_controller.txt

# Clear old logs
php artisan log:clear

# Clear old sessions (if using database sessions)
php artisan session:gc

# Clear expired cache entries
php artisan cache:prune-stale-tags
```

## Unused Dependencies Review

### PHP Dependencies (composer.json)
Review these packages and remove if not used:

1. **google-gemini-php/client** & **google-gemini-php/laravel**
   - Check if AI image generation is still used
   - If removed, also remove GEMINI_API_KEY from .env

2. **firebase/php-jwt**
   - Used for Jitsi authentication
   - Keep if using video calls

3. **react-pdf** (package.json)
   - Check if PDF viewing is implemented
   - Remove if not used

4. **react-beautiful-dnd** (package.json)
   - Check if drag-and-drop is implemented
   - Remove if not used

### To Remove Unused Dependencies:
```bash
# PHP
composer remove package-name

# Node
npm uninstall package-name
```

## Code Cleanup Tasks

### 1. Remove Commented Code
Files with commented code to review:
- [x] `app/Http/Controllers/DashboardController.php` - CLEANED

### 2. Optimize Imports
Remove unused imports in all controllers and models

### 3. Database Cleanup
```sql
-- Remove old sessions (older than 30 days)
DELETE FROM sessions WHERE last_activity < UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 30 DAY));

-- Remove old cache entries
DELETE FROM cache WHERE expiration < UNIX_TIMESTAMP(NOW());

-- Remove old notifications (older than 90 days)
DELETE FROM notifications WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY) AND read_at IS NOT NULL;
```

### 4. Storage Cleanup
```bash
# Clear old compiled views
php artisan view:clear

# Clear old route cache
php artisan route:clear

# Clear old config cache
php artisan config:clear

# Clear old event cache
php artisan event:clear

# Clear application cache
php artisan cache:clear

# Clear old logs (keep last 7 days)
find storage/logs -name "*.log" -mtime +7 -delete
```

## Performance Monitoring

### Files to Monitor
1. `storage/logs/laravel.log` - Check for errors
2. `storage/framework/cache` - Monitor cache size
3. `storage/framework/sessions` - Monitor session files
4. `storage/framework/views` - Compiled views

### Monitoring Commands
```bash
# Check storage usage
du -sh storage/*

# Check database size
php artisan db:show

# Check cache size
php artisan cache:table
```

## Optimization Checklist

### Before Deployment
- [ ] Run `composer install --optimize-autoloader --no-dev`
- [ ] Run `npm run build`
- [ ] Run `php artisan config:cache`
- [ ] Run `php artisan route:cache`
- [ ] Run `php artisan view:cache`
- [ ] Run `php artisan event:cache`
- [ ] Remove temporary files
- [ ] Clear all logs
- [ ] Set `APP_DEBUG=false`
- [ ] Set `APP_ENV=production`

### After Deployment
- [ ] Verify Redis is running
- [ ] Check OPcache is enabled
- [ ] Monitor slow queries
- [ ] Check error logs
- [ ] Test page load times
- [ ] Verify cache is working

## Maintenance Schedule

### Daily
- Monitor error logs
- Check application performance

### Weekly
- Clear old sessions
- Clear old cache entries
- Review slow query logs

### Monthly
- Update dependencies
- Clear old notifications
- Optimize database tables
- Review and remove unused code

### Quarterly
- Security audit
- Performance review
- Dependency audit
- Database optimization

## Notes

- Always backup database before running cleanup scripts
- Test cleanup scripts in staging environment first
- Monitor application after cleanup for any issues
- Keep logs for at least 30 days for debugging
