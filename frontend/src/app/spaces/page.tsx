'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useSpaces } from '@/lib/hooks/useSpaces'
import { Heart, Plus, Users, AlertTriangle, Loader2, Trash2, Mail, X } from 'lucide-react'

const SEPARATION_CONFIRMATION_PHRASE = 'KITA SUDAH SIAP'

export default function SpacesIndex() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const {
    spaces,
    loading,
    createSpace,
    joinSpace,
    invitePartner,
    cancelInvitation,
    requestSeparation,
    respondSeparation,
    cancelSeparation,
  } = useSpaces()

  const [title, setTitle] = useState('')
  const [bio, setBio] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const [joinCode, setJoinCode] = useState('')
  const [joining, setJoining] = useState(false)
  const [joinAlert, setJoinAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [joinCodeError, setJoinCodeError] = useState<string | null>(null)

  const [activeInviteSpaceId, setActiveInviteSpaceId] = useState<number | null>(null)
  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteAlert, setInviteAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [inviteErrors, setInviteErrors] = useState<{ partner_name?: string; partner_email?: string }>({})

  const [activeSeparationSpaceId, setActiveSeparationSpaceId] = useState<number | null>(null)
  const [separationPhrase, setSeparationPhrase] = useState('')
  const [separationReason, setSeparationReason] = useState('')
  const [processingSeparation, setProcessingSeparation] = useState(false)
  const [separationAlert, setSeparationAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const [respondPhrase, setRespondPhrase] = useState('')
  const [respondReason, setRespondReason] = useState('')
  const [responding, setResponding] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  const handleCreateSpace = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (creating) return

    setCreateError(null)

    if (!title.trim()) {
      setCreateError('Space name is required.')
      return
    }

    setCreating(true)
    const result = await createSpace(title.trim(), bio.trim() || undefined)

    if (result.error) {
      setCreateError(result.error)
      setCreating(false)
      return
    }

    if (result.space) {
      router.push(`/spaces/${result.space.slug}`)
    }
  }, [title, bio, creating, createSpace, router])

  const handleJoinSpace = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (joining) return

    setJoinAlert(null)
    setJoinCodeError(null)

    const code = joinCode.trim()
    if (!code) {
      setJoinCodeError('Partner code is required.')
      return
    }

    setJoining(true)
    const result = await joinSpace(code)

    if (result.error) {
      setJoinAlert({ type: 'error', message: result.error })
      setJoining(false)
      return
    }

    setJoinAlert({ type: 'success', message: 'Successfully joined your partner\'s space!' })
    setJoinCode('')
    setJoining(false)

    if (result.space) {
      setTimeout(() => router.push(`/spaces/${result.space!.slug}`), 200)
    }
  }, [joinCode, joining, joinSpace, router])

  const handleInviteSubmit = useCallback(async (spaceSlug: string) => {
    if (inviteLoading) return

    setInviteAlert(null)
    setInviteErrors({})

    if (!inviteName.trim() || !inviteEmail.trim()) {
      setInviteErrors({
        partner_name: !inviteName.trim() ? 'Partner name is required.' : undefined,
        partner_email: !inviteEmail.trim() ? 'Partner email is required.' : undefined,
      })
      setInviteAlert({ type: 'error', message: 'Please complete partner name and email.' })
      return
    }

    setInviteLoading(true)
    const result = await invitePartner(spaceSlug, inviteName.trim(), inviteEmail.trim())

    if (result.error) {
      setInviteAlert({ type: 'error', message: result.error })
    } else {
      setInviteAlert({ type: 'success', message: 'Invitation sent successfully!' })
      setInviteName('')
      setInviteEmail('')
      setActiveInviteSpaceId(null)
    }
    setInviteLoading(false)
  }, [inviteName, inviteEmail, inviteLoading, invitePartner])

  const handleRequestSeparation = useCallback(async (spaceSlug: string) => {
    if (processingSeparation) return

    setSeparationAlert(null)

    if (!separationPhrase.trim()) {
      setSeparationAlert({ type: 'error', message: 'Please type the confirmation phrase.' })
      return
    }

    if (separationPhrase.trim().toUpperCase() !== SEPARATION_CONFIRMATION_PHRASE.toUpperCase()) {
      setSeparationAlert({ type: 'error', message: `Confirmation phrase must be exactly "${SEPARATION_CONFIRMATION_PHRASE}".` })
      return
    }

    setProcessingSeparation(true)
    const result = await requestSeparation(spaceSlug, separationPhrase.trim(), separationReason.trim() || undefined)

    if (result.error) {
      setSeparationAlert({ type: 'error', message: result.error })
    } else {
      setSeparationAlert({ type: 'success', message: 'Separation request sent.' })
      setSeparationPhrase('')
      setSeparationReason('')
    }
    setProcessingSeparation(false)
  }, [separationPhrase, separationReason, processingSeparation, requestSeparation])

  const handleRespondSeparation = useCallback(async (spaceSlug: string, decision: 'approve' | 'reject') => {
    if (responding) return

    setSeparationAlert(null)

    if (!respondPhrase.trim()) {
      setSeparationAlert({ type: 'error', message: 'Please type the confirmation phrase.' })
      return
    }

    if (respondPhrase.trim().toUpperCase() !== SEPARATION_CONFIRMATION_PHRASE.toUpperCase()) {
      setSeparationAlert({ type: 'error', message: `Confirmation phrase must be exactly "${SEPARATION_CONFIRMATION_PHRASE}".` })
      return
    }

    setResponding(true)
    const result = await respondSeparation(spaceSlug, decision, respondPhrase.trim(), respondReason.trim() || undefined)

    if (result.error) {
      setSeparationAlert({ type: 'error', message: result.error })
    } else {
      setSeparationAlert({
        type: 'success',
        message: decision === 'approve' ? 'Space ended successfully.' : 'Separation request rejected.',
      })
      setRespondPhrase('')
      setRespondReason('')
    }
    setResponding(false)
  }, [respondPhrase, respondReason, responding, respondSeparation])

  const handleCancelSeparation = useCallback(async (spaceSlug: string) => {
    const result = await cancelSeparation(spaceSlug)
    if (result.error) {
      setSeparationAlert({ type: 'error', message: result.error })
    } else {
      setSeparationAlert({ type: 'success', message: 'Separation request cancelled.' })
    }
  }, [cancelSeparation])

  const handleCancelInvitation = useCallback(async (spaceSlug: string, invitationId: number) => {
    if (!window.confirm('Cancel this invitation?')) return

    const result = await cancelInvitation(spaceSlug, invitationId)
    if (result.error) {
      setInviteAlert({ type: 'error', message: result.error })
    } else {
      setInviteAlert({ type: 'success', message: 'Invitation cancelled.' })
    }
  }, [cancelInvitation])

  if (authLoading || loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 text-pink-500 animate-spin" />
        </div>
      </AuthenticatedLayout>
    )
  }

  const hasSpaces = spaces.length > 0

  return (
    <AuthenticatedLayout
      header={
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Spaces</h1>
          <p className="text-gray-600">Manage your shared spaces</p>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Create Space Form */}
        {!hasSpaces && (
          <div className="bg-white/80 backdrop-blur rounded-3xl border border-pink-100 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-pink-500">
                <Heart className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Create Your Space</h2>
                <p className="text-sm text-gray-600">Start a new shared space with your partner</p>
              </div>
            </div>

            <form onSubmit={handleCreateSpace} className="space-y-5">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Space Name
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-gray-800 transition focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                  placeholder="e.g. Dinda & Aulia's Space"
                  required
                />
                {createError && (
                  <p className="mt-2 text-sm text-red-500">{createError}</p>
                )}
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-gray-800 transition focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                  placeholder="Tell your story briefly..."
                />
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-3 font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-60"
              >
                {creating ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </span>
                ) : (
                  'Create Space'
                )}
              </button>
            </form>
          </div>
        )}

        {/* Join Space with Partner Code */}
        {!hasSpaces && (
          <div className="bg-white/80 backdrop-blur rounded-3xl border border-pink-100 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-500">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Join Partner&apos;s Space</h2>
                <p className="text-sm text-gray-600">Enter your partner&apos;s code to join their space</p>
              </div>
            </div>

            <form onSubmit={handleJoinSpace} className="space-y-4">
              <div>
                <label htmlFor="partner_code" className="block text-sm font-medium text-gray-700 mb-1">
                  Partner Code
                </label>
                <input
                  type="text"
                  id="partner_code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-gray-800 uppercase tracking-widest text-center text-lg font-mono transition focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                  placeholder="ABCD1234"
                />
                {joinCodeError && (
                  <p className="mt-2 text-sm text-red-500">{joinCodeError}</p>
                )}
              </div>

              {joinAlert && (
                <div className={`rounded-2xl px-4 py-3 text-sm ${joinAlert.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {joinAlert.message}
                </div>
              )}

              <button
                type="submit"
                disabled={joining}
                className="w-full rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-3 font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-60"
              >
                {joining ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Connecting...
                  </span>
                ) : (
                  'Join Space'
                )}
              </button>
            </form>
          </div>
        )}

        {/* Existing Spaces */}
        {hasSpaces && (
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur rounded-3xl border border-pink-100 shadow-sm p-6">
              <p className="text-sm text-gray-600">
                Each account can only have one Space. Manage your Space, invite your partner, or end the Space relationship from this page.
              </p>
            </div>

            {spaces.map((space) => {
              const hasPartner = !!space.user_two_id
              const isInviteOpen = activeInviteSpaceId === space.id
              const isSeparationOpen = activeSeparationSpaceId === space.id

              return (
                <div key={space.id} className="bg-white/80 backdrop-blur rounded-3xl border border-pink-100 shadow-sm p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{space.title}</h3>
                      <p className="text-sm text-gray-500">
                        {hasPartner ? 'Partner connected. Enjoy all features together.' : 'No partner yet. You can invite a partner anytime.'}
                      </p>
                    </div>
                    <Link
                      href={`/spaces/${space.slug}`}
                      className="inline-flex items-center justify-center rounded-full bg-pink-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-pink-700"
                    >
                      Enter Space
                    </Link>
                  </div>

                  {/* Invite Partner Section */}
                  {!hasPartner && (
                    <div className="space-y-3">
                      {inviteAlert && (
                        <div className={`rounded-2xl px-4 py-3 text-sm ${inviteAlert.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                          {inviteAlert.message}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setActiveInviteSpaceId(isInviteOpen ? null : space.id)
                          setInviteAlert(null)
                          setInviteErrors({})
                        }}
                        className="inline-flex items-center gap-2 rounded-full border border-pink-200 px-4 py-2 text-sm font-semibold text-pink-600 transition hover:bg-pink-50"
                      >
                        <Mail className="h-4 w-4" />
                        {isInviteOpen ? 'Close Form' : 'Invite Partner'}
                      </button>

                      {isInviteOpen && (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault()
                            handleInviteSubmit(space.slug)
                          }}
                          className="space-y-4 rounded-2xl border border-pink-100 bg-pink-50/60 p-5"
                        >
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Partner Name</label>
                            <input
                              type="text"
                              value={inviteName}
                              onChange={(e) => setInviteName(e.target.value)}
                              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm transition focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                              placeholder="e.g. Aulia Rahma"
                            />
                            {inviteErrors.partner_name && (
                              <p className="mt-1 text-xs text-red-500">{inviteErrors.partner_name}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Partner Email</label>
                            <input
                              type="email"
                              value={inviteEmail}
                              onChange={(e) => setInviteEmail(e.target.value)}
                              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm transition focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                              placeholder="name@email.com"
                            />
                            {inviteErrors.partner_email && (
                              <p className="mt-1 text-xs text-red-500">{inviteErrors.partner_email}</p>
                            )}
                          </div>

                          <button
                            type="submit"
                            disabled={inviteLoading}
                            className="w-full rounded-xl bg-pink-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-600 disabled:opacity-60"
                          >
                            {inviteLoading ? 'Sending...' : 'Send Invitation'}
                          </button>
                        </form>
                      )}
                    </div>
                  )}

                  {/* Separation Section */}
                  <div className="border-t border-gray-100 pt-4">
                    <button
                      type="button"
                      onClick={() => setActiveSeparationSpaceId(isSeparationOpen ? null : space.id)}
                      className="inline-flex items-center gap-2 text-xs font-medium text-gray-400 transition hover:text-red-500"
                    >
                      <AlertTriangle className="h-3 w-3" />
                      {isSeparationOpen ? 'Close' : 'Request Space Separation'}
                    </button>

                    {isSeparationOpen && (
                      <div className="mt-4 space-y-4 rounded-2xl border border-red-100 bg-red-50/60 p-5">
                        <p className="text-sm text-red-700">
                          This action will permanently end your Space. Type <strong>{SEPARATION_CONFIRMATION_PHRASE}</strong> to confirm.
                        </p>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Confirmation Phrase</label>
                          <input
                            type="text"
                            value={separationPhrase}
                            onChange={(e) => setSeparationPhrase(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm transition focus:border-red-500 focus:ring-2 focus:ring-red-200"
                            placeholder={SEPARATION_CONFIRMATION_PHRASE}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
                          <textarea
                            value={separationReason}
                            onChange={(e) => setSeparationReason(e.target.value)}
                            rows={2}
                            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm transition focus:border-red-500 focus:ring-2 focus:ring-red-200"
                            placeholder="Why are you requesting separation?"
                          />
                        </div>

                        {separationAlert && (
                          <div className={`rounded-xl px-4 py-3 text-sm ${separationAlert.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                            {separationAlert.message}
                          </div>
                        )}

                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => handleRequestSeparation(space.slug)}
                            disabled={processingSeparation}
                            className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
                          >
                            {processingSeparation ? 'Processing...' : 'Request Separation'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleCancelSeparation(space.slug)
                              setActiveSeparationSpaceId(null)
                            }}
                            className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                          >
                            Cancel Request
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Empty State */}
        {!hasSpaces && spaces.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-pink-100 text-pink-500 mb-4">
              <Heart className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No spaces yet</h3>
            <p className="text-gray-600">Create your first shared space to start building memories together.</p>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  )
}
