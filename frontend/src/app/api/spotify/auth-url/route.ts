import { NextResponse } from 'next/server'

export async function GET() {
  const scopes = [
    'user-read-currently-playing',
    'user-read-playback-state',
    'user-modify-playback-state',
    'playlist-read-private',
    'playlist-modify-public',
    'playlist-modify-private',
    'user-library-read',
  ].join(' ')

  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    response_type: 'code',
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
    scope: scopes,
    show_dialog: 'true',
  })

  return NextResponse.json({
    url: `https://accounts.spotify.com/authorize?${params.toString()}`,
  })
}
