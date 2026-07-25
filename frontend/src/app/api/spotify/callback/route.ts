import { NextResponse, NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state') // space_id
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(
      new URL(`/spaces/${state || ''}/spotify?error=auth_failed`, request.url)
    )
  }

  // Exchange code for tokens
  const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
    }),
  })

  const tokenData = await tokenResponse.json()

  if (!tokenResponse.ok) {
    return NextResponse.redirect(
      new URL(`/spaces/${state || ''}/spotify?error=token_failed`, request.url)
    )
  }

  // Get Spotify user profile
  const profileResponse = await fetch('https://api.spotify.com/v1/me', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  })
  const profile = await profileResponse.json()

  // Store in Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString()

  // Upsert token
  const { error: dbError } = await supabase.from('spotify_tokens').upsert(
    {
      user_id: (await supabase.auth.getUser()).data.user?.id || '',
      space_id: state ? parseInt(state) : null,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      expires_at: expiresAt,
      scope: tokenData.scope,
      token_type: tokenData.token_type,
      display_name: profile.display_name || null,
    },
    { onConflict: 'user_id,space_id' }
  )

  if (dbError) {
    console.error('DB error:', dbError)
  }

  return NextResponse.redirect(
    new URL(`/spaces/${state || ''}/spotify?connected=true`, request.url)
  )
}
