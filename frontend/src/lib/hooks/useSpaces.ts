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
  invite_code: string
  is_public: boolean
  theme_id: number | null
  created_at: string
  updated_at: string
}

export type JoinRequest = {
  id: number
  space_id: number
  invitee_id: string
  invitee_email: string
  status: string
  source: string
  created_at: string
  invitee?: {
    id: string
    name: string
    email: string
  }
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
  joinSpace: (inviteCode: string) => Promise<{ error?: string; message?: string }>
  invitePartner: (slug: string, partnerName: string, partnerEmail: string) => Promise<{ error?: string }>
  cancelInvitation: (slug: string, invitationId: number) => Promise<{ error?: string }>
  requestSeparation: (slug: string, confirmationPhrase: string, reason?: string) => Promise<{ error?: string }>
  respondSeparation: (slug: string, decision: 'approve' | 'reject', confirmationPhrase: string, reason?: string) => Promise<{ error?: string }>
  cancelSeparation: (slug: string) => Promise<{ error?: string }>
  fetchSpaces: () => Promise<void>
  joinRequests: JoinRequest[]
  fetchJoinRequests: (spaceId: number) => Promise<void>
  approveJoinRequest: (spaceId: number, invitationId: number) => Promise<{ error?: string; space?: Space }>
  rejectJoinRequest: (spaceId: number, invitationId: number) => Promise<{ error?: string }>
}

export function useSpaces(): UseSpacesReturn {
  const { user } = useAuth()
  const [spaces, setSpaces] = useState<Space[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([])
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
    const timeout = setTimeout(fetchSpaces, 0)
    return () => clearTimeout(timeout)
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

  const joinSpace = useCallback(async (inviteCode: string) => {
    if (!user) return { error: 'Not authenticated' }

    const code = inviteCode.trim().toUpperCase()

    // Find space by invite_code
    const { data: space, error: spaceError } = await supabase
      .from('spaces')
      .select('*')
      .eq('invite_code', code)
      .single()

    if (spaceError || !space) {
      return { error: 'Kode undangan tidak ditemukan. Pastikan kode yang dimasukkan sudah benar.' }
    }

    if (space.user_one_id === user.id) {
      return { error: 'Tidak dapat bergabung menggunakan kode Space milik sendiri.' }
    }

    if (space.user_two_id === user.id) {
      return { error: 'Kamu sudah tergabung di Space tersebut.' }
    }

    if (space.user_two_id && space.user_two_id !== user.id) {
      return { error: 'Space tersebut sudah memiliki pasangan.' }
    }

    // Check if there's already a pending request from this user
    const { data: existingRequest } = await supabase
      .from('space_invitations')
      .select('id')
      .eq('space_id', space.id)
      .eq('invitee_id', user.id)
      .eq('status', 'pending')
      .eq('source', 'join_request')
      .single()

    if (existingRequest) {
      return { error: 'Permintaan bergabung sudah dikirim. Menunggu konfirmasi pemilik Space.' }
    }

    // Create pending join request
    const { error: insertError } = await supabase
      .from('space_invitations')
      .insert({
        space_id: space.id,
        inviter_id: space.user_one_id,
        invitee_id: user.id,
        invitee_email: user.email,
        token: crypto.randomUUID(),
        status: 'pending',
        source: 'join_request',
      })

    if (insertError) {
      return { error: insertError.message }
    }

    return { message: 'Permintaan bergabung berhasil dikirim. Menunggu konfirmasi pemilik Space.' }
  }, [user, supabase])

  const fetchJoinRequests = useCallback(async (spaceId: number) => {
    if (!user) return

    const { data, error } = await supabase
      .from('space_invitations')
      .select(`
        id,
        space_id,
        invitee_id,
        invitee_email,
        status,
        source,
        created_at,
        invitee:users!space_invitations_invitee_id_fkey (id, name, email)
      `)
      .eq('space_id', spaceId)
      .eq('status', 'pending')
      .eq('source', 'join_request')
      .order('created_at', { ascending: false })

    if (!error && data) {
      const joinRequests = data.map(({ invitee, ...request }) => ({
        ...request,
        invitee: Array.isArray(invitee) ? invitee[0] : invitee,
      })) as JoinRequest[]

      setJoinRequests(joinRequests)
    }
  }, [user, supabase])

  const approveJoinRequest = useCallback(async (spaceId: number, invitationId: number) => {
    if (!user) return { error: 'Not authenticated' }

    // Get the space
    const { data: space, error: spaceError } = await supabase
      .from('spaces')
      .select('*')
      .eq('id', spaceId)
      .single()

    if (spaceError || !space) {
      return { error: 'Space not found.' }
    }

    if (space.user_one_id !== user.id) {
      return { error: 'Only space owner can approve join requests.' }
    }

    if (space.user_two_id) {
      return { error: 'Space already has a partner.' }
    }

    // Get the invitation
    const { data: invitation, error: invError } = await supabase
      .from('space_invitations')
      .select('*')
      .eq('id', invitationId)
      .eq('space_id', spaceId)
      .eq('status', 'pending')
      .eq('source', 'join_request')
      .single()

    if (invError || !invitation) {
      return { error: 'Join request not found or already processed.' }
    }

    // Check if requester already has a space
    const { data: requesterSpaces } = await supabase
      .from('spaces')
      .select('id')
      .or(`user_one_id.eq.${invitation.invitee_id},user_two_id.eq.${invitation.invitee_id}`)
      .limit(1)

    if (requesterSpaces && requesterSpaces.length > 0) {
      return { error: 'User already has a space.' }
    }

    // Get requester info
    const { data: requester } = await supabase
      .from('users')
      .select('name')
      .eq('id', invitation.invitee_id)
      .single()

    // Accept the invitation
    await supabase
      .from('space_invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      })
      .eq('id', invitationId)

    // Connect partner to space
    const newTitle = requester?.name
      ? `${space.title.split(' & ')[0]} & ${requester.name}`
      : space.title

    await supabase
      .from('spaces')
      .update({
        user_two_id: invitation.invitee_id,
        title: newTitle,
      })
      .eq('id', spaceId)

    await fetchSpaces()
    await fetchJoinRequests(spaceId)

    return {
      space: {
        ...space,
        user_two_id: invitation.invitee_id,
        title: newTitle,
      }
    }
  }, [user, supabase, fetchSpaces, fetchJoinRequests])

  const rejectJoinRequest = useCallback(async (spaceId: number, invitationId: number) => {
    if (!user) return { error: 'Not authenticated' }

    // Get the space
    const { data: space } = await supabase
      .from('spaces')
      .select('user_one_id')
      .eq('id', spaceId)
      .single()

    if (!space || space.user_one_id !== user.id) {
      return { error: 'Only space owner can reject join requests.' }
    }

    // Update invitation status
    const { error } = await supabase
      .from('space_invitations')
      .update({ status: 'declined' })
      .eq('id', invitationId)
      .eq('space_id', spaceId)
      .eq('status', 'pending')
      .eq('source', 'join_request')

    if (error) {
      return { error: error.message }
    }

    await fetchJoinRequests(spaceId)
    return {}
  }, [user, supabase, fetchJoinRequests])

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
        source: 'email',
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
    joinRequests,
    fetchJoinRequests,
    approveJoinRequest,
    rejectJoinRequest,
  }
}
