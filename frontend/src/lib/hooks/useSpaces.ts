'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { User } from '@supabase/supabase-js'

export type Space = {
  id: number
  slug: string
  title: string
  bio: string | null
  user_one_id: string
  user_two_id: string | null
  is_public: boolean
  theme_id: number | null
  created_at: string
  updated_at: string
}

export type SpaceWithUsers = Space & {
  users: (User | null)[]
  has_partner: boolean
  pending_invitation: {
    id: number
    email: string
    status: string
    status_label: string
    sent_at: string | null
  } | null
  pending_separation: {
    id: number
    status: string
    initiated_by_you: boolean
    requires_your_confirmation: boolean
    created_at: string | null
    reason: { initiator: string | null; partner: string | null }
  } | null
  invitations: {
    id: number
    email: string
    status: string
    status_label: string
    sent_at: string | null
    responded_at: string | null
    cancelled_at: string | null
  }[]
}

type UseSpacesReturn = {
  spaces: Space[]
  loading: boolean
  error: string | null
  createSpace: (title: string, bio?: string) => Promise<{ error?: string; space?: Space }>
  deleteSpace: (slug: string) => Promise<{ error?: string }>
  joinSpace: (partnerCode: string) => Promise<{ error?: string; space?: Space }>
  invitePartner: (slug: string, partnerName: string, partnerEmail: string) => Promise<{ error?: string }>
  cancelInvitation: (slug: string, invitationId: number) => Promise<{ error?: string }>
  requestSeparation: (slug: string, confirmationPhrase: string, reason?: string) => Promise<{ error?: string }>
  respondSeparation: (slug: string, decision: 'approve' | 'reject', confirmationPhrase: string, reason?: string) => Promise<{ error?: string }>
  cancelSeparation: (slug: string) => Promise<{ error?: string }>
  fetchSpaces: () => Promise<void>
}

export function useSpaces(): UseSpacesReturn {
  const { user } = useAuth()
  const [spaces, setSpaces] = useState<Space[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = useMemo(() => createClient(), [])

  const fetchSpaces = useCallback(async () => {
    if (!user) {
      setSpaces([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('spaces')
      .select('*')
      .or(`user_one_id.eq.${user.id},user_two_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setSpaces(data || [])
    }
    setLoading(false)
  }, [user, supabase])

  useEffect(() => {
    fetchSpaces()
  }, [fetchSpaces])

  const createSpace = useCallback(async (title: string, bio?: string) => {
    if (!user) return { error: 'Not authenticated' }

    const { data: existingSpaces } = await supabase
      .from('spaces')
      .select('id')
      .or(`user_one_id.eq.${user.id},user_two_id.eq.${user.id}`)
      .limit(1)

    if (existingSpaces && existingSpaces.length > 0) {
      return { error: 'You already have a space. You cannot create more than one.' }
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || `space-${Date.now()}`

    const { data, error: insertError } = await supabase
      .from('spaces')
      .insert({
        title,
        slug,
        user_one_id: user.id,
        bio: bio || null,
      })
      .select()
      .single()

    if (insertError) {
      return { error: insertError.message }
    }

    await fetchSpaces()
    return { space: data }
  }, [user, supabase, fetchSpaces])

  const deleteSpace = useCallback(async (slug: string) => {
    const { error: deleteError } = await supabase
      .from('spaces')
      .delete()
      .eq('slug', slug)

    if (deleteError) {
      return { error: deleteError.message }
    }

    await fetchSpaces()
    return {}
  }, [supabase, fetchSpaces])

  const joinSpace = useCallback(async (partnerCode: string) => {
    if (!user) return { error: 'Not authenticated' }

    const code = partnerCode.trim().toUpperCase()

    // Schema uses 'users' table, NOT 'profiles'
    const { data: owner, error: ownerError } = await supabase
      .from('users')
      .select('id')
      .eq('partner_code', code)
      .single()

    if (ownerError || !owner) {
      return { error: 'Partner code not found. Make sure the code is correct.' }
    }

    if (owner.id === user.id) {
      return { error: 'Cannot join using your own code.' }
    }

    const { data: space, error: spaceError } = await supabase
      .from('spaces')
      .select('*')
      .eq('user_one_id', owner.id)
      .single()

    if (spaceError || !space) {
      return { error: 'Partner does not have an active space.' }
    }

    if (space.user_two_id && space.user_two_id !== user.id) {
      return { error: 'This space already has a partner.' }
    }

    if (space.user_two_id === user.id) {
      return { error: 'You are already in this space.', space }
    }

    const { error: updateError } = await supabase
      .from('spaces')
      .update({ user_two_id: user.id })
      .eq('id', space.id)

    if (updateError) {
      return { error: updateError.message }
    }

    await fetchSpaces()
    return { space }
  }, [user, supabase, fetchSpaces])

  const invitePartner = useCallback(async (slug: string, partnerName: string, partnerEmail: string) => {
    if (!user) return { error: 'Not authenticated' }

    const { data: space } = await supabase
      .from('spaces')
      .select('id')
      .eq('slug', slug)
      .single()

    if (!space) return { error: 'Space not found.' }

    // Schema: space_invitations needs a token
    const token = crypto.randomUUID()

    const { error: insertError } = await supabase
      .from('space_invitations')
      .insert({
        space_id: space.id,
        inviter_id: user.id,
        invitee_email: partnerEmail,
        token,
        status: 'pending',
      })

    if (insertError) {
      return { error: insertError.message }
    }

    return {}
  }, [user, supabase])

  const cancelInvitation = useCallback(async (slug: string, invitationId: number) => {
    const { error: updateError } = await supabase
      .from('space_invitations')
      .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
      .eq('id', invitationId)

    if (updateError) return { error: updateError.message }

    await fetchSpaces()
    return {}
  }, [supabase, fetchSpaces])

  const requestSeparation = useCallback(async (slug: string, confirmationPhrase: string, reason?: string) => {
    if (!user) return { error: 'Not authenticated' }

    const confirmationPhraseConst = 'KITA SUDAH SIAP'
    if (confirmationPhrase.trim().toUpperCase() !== confirmationPhraseConst.toUpperCase()) {
      return { error: `Confirmation phrase must be exactly "${confirmationPhraseConst}".` }
    }

    const { data: space } = await supabase
      .from('spaces')
      .select('*')
      .eq('slug', slug)
      .single()

    if (!space) return { error: 'Space not found.' }

    if (!space.user_two_id) {
      const { error: deleteError } = await supabase
        .from('spaces')
        .delete()
        .eq('id', space.id)

      if (deleteError) return { error: deleteError.message }
      await fetchSpaces()
      return {}
    }

    const partnerId = space.user_one_id === user.id ? space.user_two_id : space.user_one_id

    const { error: insertError } = await supabase
      .from('space_separation_requests')
      .insert({
        space_id: space.id,
        initiator_id: user.id,
        partner_id: partnerId,
        status: 'pending',
        initiator_reason: reason || null,
        initiator_confirmed_at: new Date().toISOString(),
      })

    if (insertError) return { error: insertError.message }

    await fetchSpaces()
    return {}
  }, [user, supabase, fetchSpaces])

  const respondSeparation = useCallback(async (slug: string, decision: 'approve' | 'reject', confirmationPhrase: string, reason?: string) => {
    if (!user) return { error: 'Not authenticated' }

    const confirmationPhraseConst = 'KITA SUDAH SIAP'
    if (confirmationPhrase.trim().toUpperCase() !== confirmationPhraseConst.toUpperCase()) {
      return { error: `Confirmation phrase must be exactly "${confirmationPhraseConst}".` }
    }

    const { data: space } = await supabase
      .from('spaces')
      .select('id')
      .eq('slug', slug)
      .single()

    if (!space) return { error: 'Space not found.' }

    const { data: pendingRequest } = await supabase
      .from('space_separation_requests')
      .select('id')
      .eq('space_id', space.id)
      .eq('status', 'pending')
      .single()

    if (!pendingRequest) return { error: 'No pending separation request.' }

    if (decision === 'reject') {
      const { error: updateError } = await supabase
        .from('space_separation_requests')
        .update({
          status: 'rejected',
          partner_reason: reason || null,
          partner_confirmed_at: new Date().toISOString(),
        })
        .eq('id', pendingRequest.id)

      if (updateError) return { error: updateError.message }
    } else {
      const { error: updateError } = await supabase
        .from('space_separation_requests')
        .update({
          status: 'approved',
          partner_reason: reason || null,
          partner_confirmed_at: new Date().toISOString(),
        })
        .eq('id', pendingRequest.id)

      if (updateError) return { error: updateError.message }

      await supabase.from('spaces').delete().eq('id', space.id)
    }

    await fetchSpaces()
    return {}
  }, [user, supabase, fetchSpaces])

  const cancelSeparation = useCallback(async (slug: string) => {
    if (!user) return { error: 'Not authenticated' }

    const { data: space } = await supabase
      .from('spaces')
      .select('id')
      .eq('slug', slug)
      .single()

    if (!space) return { error: 'Space not found.' }

    const { error: updateError } = await supabase
      .from('space_separation_requests')
      .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
      .eq('space_id', space.id)
      .eq('status', 'pending')
      .eq('initiator_id', user.id)

    if (updateError) return { error: updateError.message }

    await fetchSpaces()
    return {}
  }, [user, supabase, fetchSpaces])

  return {
    spaces,
    loading,
    error,
    createSpace,
    deleteSpace,
    joinSpace,
    invitePartner,
    cancelInvitation,
    requestSeparation,
    respondSeparation,
    cancelSeparation,
    fetchSpaces,
  }
}
