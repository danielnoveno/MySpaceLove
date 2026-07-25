import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const accessToken = searchParams.get('access_token')

  if (!accessToken) {
    return NextResponse.json({ error: 'Missing access_token' }, { status: 400 })
  }

  const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (response.status === 204) {
    return NextResponse.json({ is_playing: false })
  }

  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: response.status })
  }

  const data = await response.json()

  return NextResponse.json({
    is_playing: data.is_playing,
    progress_ms: data.progress_ms,
    track: data.item
      ? {
          name: data.item.name,
          artists: data.item.artists.map((a: { name: string }) => a.name).join(', '),
          album: data.item.album.name,
          album_art: data.item.album.images[0]?.url,
          duration_ms: data.item.duration_ms,
          preview_url: data.item.preview_url,
          external_url: data.item.external_urls.spotify,
        }
      : null,
  })
}
