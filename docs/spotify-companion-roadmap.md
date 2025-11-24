# Spotify Companion Roadmap

## Current State
- Backend already holds Spotify OAuth tokens per space via `SpotifyService`, including helper methods for playlists, tracks, audio features, playback state, and playback control.
- API endpoints exist for:
  - `GET /spaces/{space}/spotify/dashboard-data` – playlist snapshot, recent moods, listening status, surprise drops, capsules.
  - `POST /spotify/surprises`, `POST /spotify/capsules`, `POST /spotify/playback/join` – limited interactions with saved content and playback.
- Front-end screen `resources/js/Pages/Spotify/LongDistanceSpotifyHub.tsx` renders dashboard data but lacks real-time collaboration and playback controls.

## Target Feature Set
1. **Collaborative Playlist**
   - Shared playlist selection/creation from either partner.
   - Weekly contribution goal tracking, highlight new additions.
   - Quick add/search flow that writes to Spotify playlist and stores activity.

2. **Synchronized Playback**
   - Ability for one partner to act as “host” and broadcast the active Spotify Connect device, current track, progress, and playback state.
   - Joining partner uses Spotify Connect API to follow the host’s playback (play/pause/seek).
   - Re-sync button to pull latest state when lag detected.

3. **Integrated Audio Output**
   - Web playback fallback (Spotify Web Playback SDK) when Spotify Connect device is unavailable.
   - Device picker UI to select between active Spotify devices (phone, desktop app, web player) and the in-browser SDK.
   - Graceful degradation messaging when Spotify premium/device requirements are not satisfied.

4. **Shared Activity Ledger**
   - Persist playlist additions, playback sessions, surprise drops, capsules, and milestones as timeline entries.
   - Surfacing “last listened together”, “top shared artists”, etc.
   - Hook into existing email/reminder infrastructure for highlights.

## Proposed Architecture
### Backend
- Extend `spotify_tokens` table:
  - Track `shared_playlist_id`, `last_active_device_id`, `last_playback_host_id`, `last_playback_state` (JSON) for quicker re-syncs.
- New tables:
  - `spotify_sessions` (`space_id`, `host_id`, `device_id`, `started_at`, `ended_at`).
  - `spotify_activity_logs` (`space_id`, `user_id`, `type`, `payload`, `occurred_at`).
- Jobs & Events:
  - Job to poll playback state from Spotify when session active (fallback if host not broadcasting).
  - Broadcast events (Pusher/Laravel Echo) for playback state updates (`spotify.playback.updated`) and playlist mutations (`spotify.playlist.updated`).
- Services:
  - `SpotifyPlaybackSynchronizer` – wraps `SpotifyService` playback methods, performs device validation, persists session/device metadata, emits events.
  - `SpotifyActivityLogger` – helper to persist standardized activities and optionally dispatch notifications.

### Front-End
- Split `LongDistanceSpotifyHub` into composable sections:
  - `PlaylistCollaborator` – browse/search/add tracks, show contribution stats.
  - `PlaybackSynchronizer` – display host, playback controls, device picker, re-sync button, join flow.
  - `ActivityTimeline` – feed of logged events with filters.
- Real-time layer:
  - Use Laravel Echo (Pusher) to subscribe to `spotify.playback.{spaceId}` and `spotify.playlist.{spaceId}` channels.
  - Optimistic UI updates while backend confirms operations.
- Web Playback SDK integration:
  - Lazy-load SDK, create player using stored Spotify token (requires refresh endpoint for SDK to fetch fresh token).
  - Manage device registration life-cycle and pass device_id to backend when host selects browser as output.
- Error handling UX:
  - Distinguish between auth, premium, device, and rate-limit errors; provide CTA to fix.

## Incremental Delivery Plan
1. **Foundation & Diagnostics**
   - Add tables/migrations for sessions & activity logs.
   - Implement logging helper and wire existing actions (surprise drops, capsules) to store records.
   - Expose `/spotify/playback/state` endpoint for current playback diagnostics.

2. **Collaborative Playlist MVP**
   - UI for selecting/creating shared playlist; persist `shared_playlist_id`.
   - Add track search + add-to-playlist endpoint (requires `playlist-modify` scopes).
   - Update dashboard to show live tracklist + new-entries counter.

3. **Playback Sync Alpha**
   - Host sets active device + track; backend records session and emits broadcast events.
   - Joiner listens to events and triggers `startPlayback` with provided position.
   - Basic re-sync button fetching `/spotify/playback/state`.

4. **Web Playback SDK & Device Picker**
   - Provide browser-based device, manage token refresh for SDK.
   - Host can switch between Spotify Connect devices and web player; update session metadata + events.

5. **Shared Activity History & Emails**
   - Build activity feed component using logged records (with filters/tags).
   - Tie into email/reminder system (daily digest, weekly highlight).

6. **Resilience & Polish**
   - Handle Spotify rate limits/backoff, display queue of pending actions.
   - Automated tests (feature + front-end integration), analytics instrumentation.

## Open Questions / Dependencies
- Confirm availability of Pusher (or alternative) credentials in production for real-time events.
- Verify Spotify scopes requested during OAuth include `user-modify-playback-state`, `user-read-playback-state`, `playlist-modify-private/public`.
- Determine whether we need to support family accounts without premium (likely not possible for playback control).
- Align with email/reminder strategy to avoid duplicate notifications once global automation is implemented.
