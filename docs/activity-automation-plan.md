# Activity Automation Plan

## 1. Love Timeline Deletion UI
- **Current backend**: `DELETE /api/spaces/{space}/timelines/{id}` exists via `LoveTimelineApiController::destroy`.
- **Frontend gap**:
  - Timeline list page lacks delete CTA and confirmation prompt.
  - Need optimistic update + error fallback.
- **Implementation plan**:
  1. Extend `resources/js/Pages/Timeline/Index.tsx` (or relevant component) with a delete icon per entry.
  2. Confirm modal describing irreversible action; reuse shared modal component.
  3. Call API using Axios, remove entry from local state, show toast.
  4. Handle authorization errors (403) gracefully.
  5. Add Cypress/Playwright smoke test to ensure deletion works.

## 2. Automatic Emails for Activities
- **Activities to cover**: timeline additions, countdowns, daily messages, nobar schedules, surprise notes, wishlist updates, Spotify capsules/surprises, journals.
- **Proposed service**: `ActivityNotificationService`
  - Accepts `activityType`, `space`, `actor`, `payload`.
  - Determines recipients (space members, optionally followers).
  - Chooses template + subject via map.
  - Dispatches queued `Mailable` jobs with retry/backoff.
- **Queue integration**:
  - Use `mail` queue connection for send operations.
  - Record status in `activity_notifications` table (`id`, `space_id`, `type`, `status`, `error`, `sent_at`, `payload`).
- **API hooks**:
  - After create/update actions in respective controllers, call service asynchronously (`dispatch(new SendActivityEmail(...))`).
  - Provide feature toggles per activity via config or user preferences (opt-out).

## 3. H-1 / H-2 Reminder Scheduling
- **Targets**:
  - Nobar schedules (`nobar_schedules.scheduled_for`).
  - Countdown events with end dates.
  - Surprise drops / special dates (optional).
- **Scheduling approach**:
  1. Create `RemindUpcomingActivities` command that scans future events within 48 hours.
  2. Use `Task` / `queued job` to send reminders at `scheduled_for - 1 day` and `-2 days`.
  3. Store reminders in `activity_reminders` table (`id`, `space_id`, `activity_type`, `activity_id`, `remind_at`, `status`).
  4. Prevent duplicate sends via unique index on (`activity_type`, `activity_id`, `remind_at`).
- **Mail / notification**:
  - Reuse `ActivityNotificationService` for content, or craft dedicated `ReminderMail` template.
  - Optionally integrate with push/WhatsApp once available.

## 4. Tooling & Observability
- Add artisan commands:
  - `activity:reminders-run` – manual trigger for reminders.
  - `activity:notifications:test {email}` – send sample email for QA.
- Expose admin dashboard widgets (Filament) for pending reminders and failed notifications.

## 5. Dependencies / Questions
- Confirm queue workers + scheduler (e.g. Horizon, Supervisor) availability in production.
- Determine localization requirements for reminder wording.
- Decide whether reminders should respect user opt-out preferences (per channel).
