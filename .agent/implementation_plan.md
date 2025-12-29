---
title: Fix MapView CSP and 419 Errors
description: Fix Content Security Policy violations for geolocation services and resolve CSRF 419 errors in the MapView component.
---

## Status
- [x] Analyze browser logs to identify CSP violations (`ipapi.co`) and 419 errors (`/api/location/update`).
- [x] Update `app/Http/Middleware/SecurityHeaders.php` to allow `https://ipapi.co` and `https://router.project-osrm.org` in `connect-src`.
- [x] Modify `resources/js/Pages/Location/MapView.tsx` to implement `ensureCsrf` logic, ensuring a valid `XSRF-TOKEN` is obtained and set before starting the location update loop.
- [x] Verify that `MapView.tsx` now waits for CSRF token initialization before making requests.

## Explanation
The browser logs indicated two distinct issues preventing the Location Map feature from working correctly:


## Environment Configuration (Critical for Production)
The following errors (`401 Unauthorized` and `419 CSRF`) indicate that your production environment is rejecting the session cookies. This is a configuration issue.

- [ ] **Action Required**: Open your `.env` file on the production server and UPDATE/ADD these lines. Do not rely on defaults.
    ```env
    APP_URL=https://spacelovee.my.id
    SESSION_DOMAIN=.spacelovee.my.id
    SANCTUM_STATEFUL_DOMAINS=spacelovee.my.id
    SESSION_SECURE_COOKIE=true
    ```
    *Note: The leading dot in `SESSION_DOMAIN` is important.*

- [ ] **Action Required**: After saving the `.env` file, run the following command to clear all caches. **This is crucial for the changes to take effect and often resolves 404 errors caused by stale route caches.**
    ```bash
    php artisan optimize:clear
    ```

- [x] Verify configuration using `php artisan config:show session` and `php artisan config:show sanctum`.

## TypeScript Fixes
- [x] Analyze TypeScript errors in `resources/js/Pages/Location/MapView.tsx` indicating missing `leaflet` types.
- [x] Install `@types/leaflet` dev dependency to resolve implicit 'any' and property mismatch errors.
- [x] Verify resolution by running `tsc` on the file.
