# Spotify Integration Setup

This project integrates with the Spotify Web API and the Spotify Web Playback SDK. Follow these steps to configure your local environment.

## 1. Create a Spotify Application

1. Visit [Spotify for Developers](https://developer.spotify.com/dashboard/).
2. Create a new application and note the **Client ID** and **Client Secret**.
3. Under **Redirect URIs**, add your application callback:
   - For local development: `http://localhost:8000/oauth/spotify/callback`
   - For production: `${APP_URL}/oauth/spotify/callback`
4. Save the settings.

## 2. Laravel Configuration

Add the following variables to your Laravel `.env` file:

```env
SPOTIFY_CLIENT_ID=your-client-id
SPOTIFY_CLIENT_SECRET=your-client-secret
SPOTIFY_REDIRECT_URI=${APP_URL}/oauth/spotify/callback
SPOTIFY_SCOPES=user-read-private user-read-email user-read-playback-state user-modify-playback-state user-read-currently-playing playlist-read-private playlist-modify-private user-top-read
SPOTIFY_REFRESH_MARGIN=300
```

After updating `.env`, clear and cache the configuration:

```bash
php artisan config:clear
php artisan config:cache
```

## 3. Front-end Environment

The React/Inertia front-end reads the Spotify configuration from the backend, so no additional secrets are required client-side. If you expose build-time variables, use the following structure:

```env
# .env.local or similar for the Vite build
VITE_APP_URL=http://localhost:8000
VITE_DEFAULT_LOCALE=id
```

## 4. Required Scopes

Ensure the Spotify application requests the scopes below. They enable searching, playback control, reading now-playing status, managing playlists, and fetching top tracks/artists.

- `user-read-private`
- `user-read-email`
- `user-read-playback-state`
- `user-modify-playback-state`
- `user-read-currently-playing`
- `playlist-read-private`
- `playlist-modify-private`
- `user-top-read`

## 5. Testing the Flow

1. Start the Laravel development server: `php artisan serve`.
2. Log in to MySpaceLove and open the **Couple Music Space** (`/spaces/{space}/spotify/music-space`).
3. Click **Login with Spotify** and complete the OAuth consent.
4. After redirection you should see connected status, playback controls, and the ability to search or create playlists.

If you encounter authentication errors, confirm that the callback URL in Spotify matches `SPOTIFY_REDIRECT_URI` and the application scopes.
