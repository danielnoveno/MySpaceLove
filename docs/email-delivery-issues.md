# Email Delivery Issues – Investigation Notes

## 1. Partner Invitation (HTTP 419)
- Symptom: Axios `POST /api/spaces/{space}/connect-partner` occasionally hits a 419 CSRF error.
- Root cause: CSRF token becomes stale (session rotate / long-lived tabs) and Sanctum rejects the request.
- Fix applied:
  - Added Axios response interceptor (`resources/js/bootstrap.ts`) that automatically fetches `/sanctum/csrf-cookie` after a 419 response and retries the original request once. Header cache updates accordingly.
  - Ensures partner invite flow silently recovers without forcing a manual refresh.

## 2. Daily Message Email (HTTP 422)
- Symptom: Sending a daily message email returns 422 with message “Pastikan pasanganmu sudah terhubung…” even when the UI allows the action.
- Findings:
  - `DailyMessageApiController::sendEmail` currently aborts when `resolvePartnerUser()` returns `null` or partner email is empty. This covers cases where:
    - Partner is not yet connected to the space (pending invitation).
    - Partner’s account exists but lacks an email (rare, e.g. social login anomalies).
  - Mailer (`DailyMessageMail`) requires a concrete `User` object for the recipient.
- Next actions:
  1. Surface partner connection state in the UI and disable the “Send email” CTA when no partner email is available.
  2. Extend backend to fall back to the latest invitation email (if the couple still wants to send messages pre-onboarding). Requires refactoring `DailyMessageMail` to support ad-hoc recipients.
  3. Add structured logging with space id + partner state when 422 triggers to track edge cases.

## 3. Other Activity Emails (Pending)
- Areas needing verification/implementation:
  - Timeline creation/update notifications.
  - Countdown reminders, wishlist updates, surprise notes, etc.
  - H-1/H-2 reminder workflows for events and nobar schedules.
- Proposal:
  - Create a unified `ActivityEmailDispatcher` service that accepts an activity payload and resolves recipients + templates.
  - Write smoke tests covering at least one happy path per activity to avoid regressions.
  - Hook dispatcher into existing controllers/jobs once implemented.

## Instrumentation & Monitoring
- Enable dedicated log channel (e.g. `mail`) to capture exceptions from `Mail::send` with context (`space_id`, `user_id`, activity type).
- Consider queueing mail sends to retry transient SMTP issues.
- Add health check command to verify mail credentials and connectivity from production.
