import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
  }

  // Extract track or album ID from Spotify URL
  const match = url.match(/spotify\.com\/(track|album)\/([a-zA-Z0-9]+)/)

  if (!match) {
    return NextResponse.json({ error: 'Invalid Spotify URL' }, { status: 400 })
  }

  const [, type, id] = match

  // Use a client credentials token for public track data
  const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString('base64')}`,
    },
    body: new URLSearchParams({ grant_type: 'client_credentials' }),
  })

  const tokenData = await tokenResponse.json()

  if (!tokenResponse.ok) {
    return NextResponse.json({ error: 'Failed to get access token' }, { status: 500 })
  }

  const response = await fetch(`https://api.spotify.com/v1/${type}s/${id}`, {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  })

  if (!response.ok) {
    return NextResponse.json({ error: 'Track not found' }, { status: response.status })
  }

  const data = await response.json()

  if (type === 'track') {
    return NextResponse.json({
      id: data.id,
      name: data.name,
      artists: data.artists.map((a: { name: string }) => a.name).join(', '),
      album: data.album.name,
      album_art: data.album.images[0]?.url,
      preview_url: data.preview_url,
      duration_ms: data.duration_ms,
      external_url: data.external_urls.spotify,
    })
  }

  // Album: return first track
  const firstTrack = data.tracks.items[0]
  return NextResponse.json({
    id: firstTrack.id,
    name: firstTrack.name,
    artists: firstTrack.artists.map((a: { name: string }) => a.name).join(', '),
    album: data.name,
    album_art: data.images[0]?.url,
    preview_url: firstTrack.preview_url,
    duration_ms: firstTrack.duration_ms,
    external_url: firstTrack.external_urls.spotify,
  })
}
