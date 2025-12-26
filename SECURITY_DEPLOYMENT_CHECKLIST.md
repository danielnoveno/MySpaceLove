# 🔒 Security Deployment Checklist

Gunakan checklist ini sebelum deploy ke production untuk memastikan keamanan maksimal.

## ✅ Pre-Deployment Security Checklist

### 1. Environment Configuration
- [ ] Set `APP_ENV=production`
- [ ] Set `APP_DEBUG=false`
- [ ] Generate new `APP_KEY` (jangan gunakan key development)
- [ ] Set `FORCE_HTTPS=true`
- [ ] Pastikan semua API keys aman dan tidak di-commit ke Git
- [ ] Review semua environment variables

### 2. Database Security
- [ ] Gunakan database user dengan minimal permissions
- [ ] Ganti default database password
- [ ] Enable database SSL connection (jika tersedia)
- [ ] Setup automated database backups
- [ ] Test database backup restoration

### 3. File Permissions
```bash
# Set correct permissions
chmod -R 755 storage bootstrap/cache
chmod 644 .env
find . -type f -exec chmod 644 {} \;
find . -type d -exec chmod 755 {} \;
```

### 4. Security Headers
- [ ] Verify SecurityHeaders middleware is active
- [ ] Test CSP (Content Security Policy) tidak break aplikasi
- [ ] Enable HSTS in production
- [ ] Verify X-Frame-Options header
- [ ] Check X-Content-Type-Options header

### 5. HTTPS/SSL
- [ ] Install valid SSL certificate
- [ ] Force HTTPS redirect (uncomment di .htaccess)
- [ ] Test SSL configuration (https://www.ssllabs.com/ssltest/)
- [ ] Enable HSTS header
- [ ] Setup auto-renewal untuk SSL certificate

### 6. Authentication & Authorization
- [ ] Enable rate limiting untuk login
- [ ] Set strong password requirements
- [ ] Enable 2FA (jika applicable)
- [ ] Review user permissions
- [ ] Test account lockout mechanism

### 7. File Upload Security
- [ ] Verify file type validation
- [ ] Test file size limits
- [ ] Ensure uploaded files tidak executable
- [ ] Setup virus scanning (ClamAV)
- [ ] Test malicious file upload prevention

### 8. API Security
- [ ] Enable API rate limiting
- [ ] Verify CORS configuration
- [ ] Test API authentication
- [ ] Review API endpoints exposure
- [ ] Enable API logging

### 9. Dependencies & Updates
```bash
# Update dependencies
composer update --no-dev
npm update
npm audit fix

# Check for security vulnerabilities
composer audit
npm audit
```

### 10. Code Security
- [ ] Remove debug code
- [ ] Remove commented sensitive information
- [ ] Verify no hardcoded credentials
- [ ] Check for exposed secrets
- [ ] Run security audit: `php artisan security:audit`

### 11. Server Configuration
- [ ] Disable directory listing
- [ ] Hide server version
- [ ] Configure firewall rules
- [ ] Setup fail2ban (untuk brute force protection)
- [ ] Enable ModSecurity (WAF)

### 12. Monitoring & Logging
- [ ] Setup error logging
- [ ] Configure security event logging
- [ ] Setup email alerts untuk critical events
- [ ] Enable failed login monitoring
- [ ] Setup uptime monitoring

### 13. Backup & Recovery
- [ ] Setup automated backups (daily)
- [ ] Test backup restoration
- [ ] Store backups off-site
- [ ] Encrypt backup files
- [ ] Document recovery procedures

### 14. Performance & DDoS Protection
- [ ] Enable caching (Redis/Memcached)
- [ ] Setup CDN (Cloudflare recommended)
- [ ] Configure rate limiting
- [ ] Enable request timeout
- [ ] Setup DDoS protection

### 15. Compliance
- [ ] Add Privacy Policy
- [ ] Add Terms of Service
- [ ] Implement GDPR compliance (jika applicable)
- [ ] Add Cookie Consent
- [ ] Document data handling procedures

---

## 🚀 Quick Deployment Commands

```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
composer install --no-dev --optimize-autoloader
npm ci --production

# 3. Clear and cache
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# 4. Run migrations
php artisan migrate --force

# 5. Build frontend assets
npm run build

# 6. Set permissions
chmod -R 755 storage bootstrap/cache
chmod 644 .env

# 7. Restart services
php artisan queue:restart
php artisan octane:reload  # jika menggunakan Octane

# 8. Run security audit
php artisan security:audit
```

---

## 🔍 Post-Deployment Verification

### Test Security Headers
```bash
curl -I https://your-domain.com
```

Verify headers:
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security (if HTTPS)

### Test Rate Limiting
```bash
# Test login rate limit
for i in {1..10}; do curl -X POST https://your-domain.com/login; done
```

### Test File Upload Security
- Upload berbagai file types
- Test file size limits
- Try upload malicious files

### Test HTTPS Redirect
```bash
curl -I http://your-domain.com
# Should redirect to https://
```

---

## 🛡️ Security Monitoring

### Daily Tasks
- [ ] Review error logs
- [ ] Check failed login attempts
- [ ] Monitor disk space
- [ ] Verify backup completion

### Weekly Tasks
- [ ] Review security logs
- [ ] Check for suspicious activities
- [ ] Update dependencies
- [ ] Test backup restoration

### Monthly Tasks
- [ ] Security audit
- [ ] Penetration testing
- [ ] Review access logs
- [ ] Update documentation

---

## 🚨 Incident Response Plan

### If Security Breach Detected:

1. **Immediate Actions**
   - Take affected systems offline
   - Change all passwords and API keys
   - Notify users (if data compromised)
   - Document everything

2. **Investigation**
   - Review logs
   - Identify breach point
   - Assess damage
   - Preserve evidence

3. **Remediation**
   - Patch vulnerabilities
   - Restore from clean backup
   - Update security measures
   - Test thoroughly

4. **Post-Incident**
   - Write incident report
   - Update security procedures
   - Train team
   - Implement preventive measures

---

## 📞 Emergency Contacts

- **Security Team**: security@your-domain.com
- **System Admin**: admin@your-domain.com
- **Hosting Support**: [Your hosting provider]
- **SSL Provider**: [Your SSL provider]

---

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Laravel Security Best Practices](https://laravel.com/docs/security)
- [Mozilla Security Guidelines](https://infosec.mozilla.org/guidelines/web_security)
- [SSL Labs Test](https://www.ssllabs.com/ssltest/)
- [Security Headers Test](https://securityheaders.com/)

---

**Last Updated**: 2025-12-26  
**Version**: 1.0.0  
**Status**: Production Ready 🚀
