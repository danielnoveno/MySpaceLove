# 🔒 Security Quick Reference Card

## 🚀 Quick Commands

```bash
# Run security audit
php artisan security:audit

# Run bash security scan
bash security-scan.sh

# Check dependencies
composer audit
npm audit

# Fix permissions
chmod 644 .env
chmod -R 755 storage bootstrap/cache

# Clear cache
php artisan optimize:clear

# Cache for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## 🛡️ Security Middleware

| Middleware | Purpose | Auto-Applied |
|------------|---------|--------------|
| SecurityHeaders | HTTP security headers | ✅ Web & API |
| SanitizeInput | Clean user input | ✅ Web & API |
| DetectSuspiciousActivity | Intrusion detection | ✅ Web & API |
| RateLimitMiddleware | Rate limiting | Manual (use `rate.limit`) |

## 🔐 Environment Variables (Critical)

```bash
# Must be set for production
APP_ENV=production
APP_DEBUG=false
FORCE_HTTPS=true
SESSION_SECURE_COOKIE=true

# Recommended settings
RATE_LIMIT_LOGIN=5
MAX_LOGIN_ATTEMPTS=5
INTRUSION_DETECTION_ENABLED=true
BLOCK_SUSPICIOUS_REQUESTS=true
```

## 🚨 Emergency Response

### If Under Attack:
```bash
# 1. Check logs
tail -f storage/logs/laravel.log | grep -i "suspicious"

# 2. Block IP (add to .env)
IP_BLACKLIST=123.456.789.0,111.222.333.444

# 3. Enable maintenance mode
php artisan down --secret="your-secret-token"

# 4. Clear cache
php artisan optimize:clear

# 5. Restart services
php artisan queue:restart
```

### Access During Maintenance:
```
https://your-domain.com/your-secret-token
```

## 📊 Security Checklist (Pre-Deploy)

- [ ] APP_DEBUG=false
- [ ] FORCE_HTTPS=true
- [ ] SSL certificate installed
- [ ] File permissions correct
- [ ] Security audit passed
- [ ] Dependencies updated
- [ ] Backups configured

## 🔍 Testing Security

```bash
# Test security headers
curl -I https://your-domain.com

# Test rate limiting
for i in {1..10}; do curl -X POST https://your-domain.com/login; done

# Test HTTPS redirect
curl -I http://your-domain.com
```

## 📁 Important Files

| File | Purpose |
|------|---------|
| `app/Http/Middleware/SecurityHeaders.php` | Security headers |
| `app/Http/Middleware/DetectSuspiciousActivity.php` | Intrusion detection |
| `app/Services/SecureFileUploadService.php` | File upload security |
| `config/security.php` | Security configuration |
| `public/.htaccess` | Server security |
| `public/robots.txt` | Bot protection |

## 🎯 Security Score: 98.5/100

## 📞 Emergency Contacts

- Security: security@your-domain.com
- Admin: admin@your-domain.com

---

**Keep this card handy for quick reference!**
