import { NextResponse, NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const { refresh_token } = await request.json()

  if (!refresh_token) {
    return NextResponse.json({ error: 'Missing refresh_token' }, { status: 400 })
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to refresh token' }, { status: 401 })
  }

  return NextResponse.json({
    access_token: data.access_token,
    expires_in: data.expires_in,
  })
}
