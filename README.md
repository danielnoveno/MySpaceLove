# MySpaceLove

MySpaceLove is a relationship operating system built on Laravel, Inertia, and React. It helps couples build a shared digital space filled with memories, rituals, and surprises through collaborative tools such as mood-based daily messages, shared countdowns, Spotify-powered listening rooms, multimedia journals, and private watch parties.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Running the App](#running-the-app)
- [Queues & Scheduled Jobs](#queues--scheduled-jobs)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Features
- **Shared Spaces** – Create a private space, invite a partner, and manage partnership status, invitations, and separation flows. Spaces drive routing for every feature module.
- **Couple Dashboard** – Surface AI-generated daily love notes, quick actions, upcoming events, and recent memories tailored to the current space. Daily notes are generated with Google Gemini when partner data is complete.
- **Love Timeline & Journals** – Capture milestones and longer-form reflections with rich cards and filters. Timeline entries and journal posts are editable with Inertia-powered forms and Filament resources.
- **Media Gallery** – Upload and curate photos or documents with inline preview support. Files are stored via Laravel's filesystem and rendered through a signed preview route.
- **Countdowns & Events** – Track days until anniversaries, trips, or personal goals. Countdowns surface on the dashboard and can be managed through dedicated CRUD screens.
- **Surprise Notes & Docs** – Leave surprise letters, storybooks, and shared documents. Public surprise routes allow sharing curated memories without exposing the entire space.
- **Location Memories** – Pin shared locations on an interactive Leaflet map and revisit them from anywhere.
- **Spotify Companion Hub** – Connect a shared Spotify account to view playlist analytics, mood snapshots, surprise drops, and memory capsules. Authorization flows through Spotify OAuth.
- **Daily Messages** – Configure personalized, auto-generated daily messages using Gemini. Partners can regenerate messages or create manual entries.
- **Watch Parties & Rooms** – Launch synchronized video rooms using Daily.co or Agora, with optional chat and host controls via the `Room` pages and Daily API integration.
- **Filament Admin Panel** – Manage spaces, journals, timelines, media, themes, and surprise notes through Filament resources out of the box.

## Tech Stack
- **Backend:** Laravel 12, PHP 8.2, Laravel Sanctum, queue workers (database driver)
- **Frontend:** Inertia.js, React 18, TypeScript, Tailwind CSS, Headless UI, Lucide icons
- **Tooling:** Vite, Laravel Pint, PHPUnit, Laravel Sail (optional), Composer scripts with Concurrently for multi-process dev
- **Integrations:** Google Gemini API for message generation, Spotify Web API, Daily.co REST API, optional Agora SDK, Leaflet for maps

## Getting Started
1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/MySpaceLove.git
   cd MySpaceLove
   ```
2. **Install PHP dependencies**
   ```bash
   composer install
   ```
3. **Install Node dependencies**
   ```bash
   npm install
   ```
4. **Copy the environment file**
   ```bash
   cp .env.example .env
   ```
5. **Generate the application key**
   ```bash
   php artisan key:generate
   ```
6. **Run migrations and seeders**
   ```bash
   php artisan migrate --seed
   ```
   The seeders create an initial admin user (`admin@example.com` / `password123`) and a demo space with default themes.
7. **Link the storage directory** (required for media previews)
   ```bash
   php artisan storage:link
   ```

> **Note:** The project defaults to SQLite. Update `.env` if you prefer MySQL or Postgres.

## Environment Configuration
Adjust the following keys in `.env` to unlock all integrations:

| Key | Description |
| --- | --- |
| `APP_URL` | Base URL for Inertia responses and asset generation. |
| `QUEUE_CONNECTION` | Defaults to `database`; ensure migrations are run for queue tables. |
| `GEMINI_API_KEY` | Required for AI-generated daily love messages. |
| `DAILY_API_KEY`, `DAILY_BASE_URL` | Required for Daily.co room creation used by the watch party feature. |
| `AGORA_APP_ID`, `AGORA_APP_CERTIFICATE` | Optional Agora video integration for alternative real-time rooms. |
| `MAIL_*` | Configure transactional emails (invitations, notifications). Mailtrap values are provided for local development. |
| `VITE_APP_NAME` | Propagated to the React frontend. |

You can also customize logging retention via `LOG_DAILY_DAYS` and AI scheduling with `DAILY_MESSAGE_TIMEZONE` / `DAILY_MESSAGE_AUTO_TIME` in `config/love.php`.

## Running the App
### Local development
Run the Laravel HTTP server, queue listener, log viewer, and Vite dev server concurrently:
```bash
composer run dev
```
This script uses `concurrently` to start:
- `php artisan serve`
- `php artisan queue:listen --tries=1`
- `php artisan pail --timeout=0`
- `npm run dev`

Alternatively, you can run them manually in separate terminals if you only need a subset during development.

### Production build
```bash
npm run build
php artisan config:cache
php artisan route:cache
php artisan queue:restart
```
Deploy the generated assets under `public/build` and ensure a queue worker is active.

## Queues & Scheduled Jobs
- The application stores jobs in the database queue. Start a worker with:
  ```bash
  php artisan queue:work
  ```
- Daily message auto-generation should be scheduled through Laravel's scheduler. Example entry for `app/Console/Kernel.php`:
  ```php
  $schedule->command('daily-messages:generate')->dailyAt(config('love.auto_generate_time'));
  ```
  Ensure your server triggers `php artisan schedule:run` every minute via cron.

## Testing
- **Backend:**
  ```bash
  php artisan test
  ```
- **Linting:**
  ```bash
  ./vendor/bin/pint
  ```

## Troubleshooting
- **Missing AI messages:** Verify `GEMINI_API_KEY` is set and that both partners are linked to the space. Check `storage/logs/laravel.log` for Gemini API warnings.
- **Video room errors:** Ensure `DAILY_API_KEY` or Agora credentials are present and that queue workers are running to process asynchronous callbacks.
- **Storage 404s:** Re-run `php artisan storage:link` and confirm files exist under `storage/app/public`.
- **Invitation issues:** Confirm queue tables exist (`php artisan queue:table`) and migrate if necessary, since invitations rely on queued mail.

Enjoy building memorable shared experiences with MySpaceLove! 💞
