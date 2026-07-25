# MySpaceLove

A couple's shared digital space built with Next.js and Supabase. Create shared memories, timelines, journals, galleries, wishlists, and more — all in one private space.

## Prerequisites

- **Node.js** 18+ (recommended: 20+)
- **Supabase** account ([free tier](https://supabase.com/pricing) works) with a project created
- **Spotify Developer** account (optional, for music features)

## Setup

1. **Clone and install**

   ```bash
   git clone <repo-url>
   cd frontend
   npm install
   ```

2. **Configure environment**

   Copy the example and fill in your keys:

   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` with your Supabase project URL and anon key.

3. **Set up Supabase tables**

   Run the SQL migrations in your Supabase SQL Editor to create the required tables (timeline entries, journals, galleries, wishlists, messages, spaces, etc.).

4. **Start the dev server**

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous/public key |
| `NEXT_PUBLIC_APP_URL` | Yes | App base URL (default: `http://localhost:3000`) |
| `SPOTIFY_CLIENT_ID` | No | Spotify OAuth client ID |
| `SPOTIFY_CLIENT_SECRET` | No | Spotify OAuth client secret |
| `SPOTIFY_REDIRECT_URI` | No | Spotify OAuth callback URL |

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Features

- **Spaces** — Create private shared spaces for you and your partner
- **Timeline** — Shared memory timeline with rich entries
- **Journals** — Personal and shared journal entries
- **Gallery** — Photo gallery with file uploads
- **Wishlist** — Shared wishlists for gifts and experiences
- **Messages** — In-space messaging
- **Countdowns** — Countdown timers for special dates
- **Surprise Notes** — Secret notes for your partner
- **Memory Lane** — Curated trip down memory lane
- **Music Capsules** — Spotify-powered shared playlists and listening plans
- **Locations** — Save and revisit meaningful places
- **No-Bar Zone** — Relationship Q&A game for couples
- **Daily Prompts** — Daily conversation starters
- **Shared Docs** — Collaborative documents
- **Room Settings** — Customize your shared space

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org) 15+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Backend:** [Supabase](https://supabase.com) (PostgreSQL, Auth, Storage)
- **Auth:** Supabase Auth (email/password)
- **Music:** Spotify Web API (optional)
- **UI:** React, custom component library
