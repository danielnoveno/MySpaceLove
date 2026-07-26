'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useSpaces } from '@/lib/hooks/useSpaces'
import { Heart, Plus, Users, AlertTriangle, Loader2, Trash2, Mail, X, Copy, Check, UserPlus, UserCheck } from 'lucide-react'

const SEPARATION_CONFIRMATION_PHRASE = 'KITA SUDAH SIAP'

export default function SpacesIndex() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { spaces, loading, createSpace, joinSpace, invitePartner, cancelInvitation, requestSeparation, respondSeparation, cancelSeparation, joinRequests, fetchJoinRequests, approveJoinRequest, rejectJoinRequest } = useSpaces()

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
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [activeJoinRequestSpaceId, setActiveJoinRequestSpaceId] = useState<number | null>(null)
  const [approvingId, setApprovingId] = useState<number | null>(null)
  const [rejectingId, setRejectingId] = useState<number | null>(null)

  useEffect(() => { if (!authLoading && !user) router.push('/auth/login') }, [user, authLoading, router])

  useEffect(() => {
    if (spaces.length > 0 && user) { spaces.forEach((space) => { if (space.user_one_id === user.id && !space.user_two_id) fetchJoinRequests(space.id) }) }
  }, [spaces, user, fetchJoinRequests])

  const handleCreateSpace = useCallback(async (e: React.FormEvent) => {
    e.preventDefault(); if (creating) return; setCreateError(null)
    if (!title.trim()) { setCreateError('Space name is required.'); return }
    setCreating(true); const result = await createSpace(title.trim(), bio.trim() || undefined)
    if (result.error) { setCreateError(result.error); setCreating(false); return }
    if (result.space) router.push(`/spaces/${result.space.slug}`)
  }, [title, bio, creating, createSpace, router])

  const handleJoinSpace = useCallback(async (e: React.FormEvent) => {
    e.preventDefault(); if (joining) return; setJoinAlert(null); setJoinCodeError(null)
    const code = joinCode.trim(); if (!code) { setJoinCodeError('Kode undangan wajib diisi.'); return }
    setJoining(true); const result = await joinSpace(code)
    if (result.error) { setJoinAlert({ type: 'error', message: result.error }); setJoining(false); return }
    setJoinAlert({ type: 'success', message: result.message || 'Permintaan bergabung berhasil dikirim!' }); setJoinCode(''); setJoining(false)
  }, [joinCode, joining, joinSpace])

  const handleCopyCode = useCallback(async (code: string) => {
    try { await navigator.clipboard.writeText(code) } catch { const textArea = document.createElement('textarea'); textArea.value = code; document.body.appendChild(textArea); textArea.select(); document.execCommand('copy'); document.body.removeChild(textArea) }
    setCopiedCode(code); setTimeout(() => setCopiedCode(null), 2000)
  }, [])

  const handleInviteSubmit = useCallback(async (spaceSlug: string) => {
    if (inviteLoading) return; setInviteAlert(null); setInviteErrors({})
    if (!inviteName.trim() || !inviteEmail.trim()) { setInviteErrors({ partner_name: !inviteName.trim() ? 'Partner name is required.' : undefined, partner_email: !inviteEmail.trim() ? 'Partner email is required.' : undefined }); setInviteAlert({ type: 'error', message: 'Please complete partner name and email.' }); return }
    setInviteLoading(true); const result = await invitePartner(spaceSlug, inviteName.trim(), inviteEmail.trim())
    if (result.error) { setInviteAlert({ type: 'error', message: result.error }) } else { setInviteAlert({ type: 'success', message: 'Invitation sent successfully!' }); setInviteName(''); setInviteEmail(''); setActiveInviteSpaceId(null) }
    setInviteLoading(false)
  }, [inviteName, inviteEmail, inviteLoading, invitePartner])

  const handleApproveJoinRequest = useCallback(async (spaceId: number, invitationId: number) => {
    setApprovingId(invitationId); const result = await approveJoinRequest(spaceId, invitationId)
    if (result.error) { setJoinAlert({ type: 'error', message: result.error }) } else { setJoinAlert({ type: 'success', message: 'Permintaan bergabung berhasil disetujui!' }); fetchJoinRequests(spaceId) }
    setApprovingId(null)
  }, [approveJoinRequest, fetchJoinRequests])

  const handleRejectJoinRequest = useCallback(async (spaceId: number, invitationId: number) => {
    setRejectingId(invitationId); const result = await rejectJoinRequest(spaceId, invitationId)
    if (result.error) { setJoinAlert({ type: 'error', message: result.error }) } else { setJoinAlert({ type: 'success', message: 'Permintaan bergabung ditolak.' }); fetchJoinRequests(spaceId) }
    setRejectingId(null)
  }, [rejectJoinRequest, fetchJoinRequests])

  const handleRequestSeparation = useCallback(async (spaceSlug: string) => {
    if (processingSeparation) return; setSeparationAlert(null)
    if (!separationPhrase.trim()) { setSeparationAlert({ type: 'error', message: 'Please type the confirmation phrase.' }); return }
    if (separationPhrase.trim().toUpperCase() !== SEPARATION_CONFIRMATION_PHRASE.toUpperCase()) { setSeparationAlert({ type: 'error', message: `Confirmation phrase must be exactly "${SEPARATION_CONFIRMATION_PHRASE}".` }); return }
    setProcessingSeparation(true); const result = await requestSeparation(spaceSlug, separationPhrase.trim(), separationReason.trim() || undefined)
    if (result.error) { setSeparationAlert({ type: 'error', message: result.error }) } else { setSeparationAlert({ type: 'success', message: 'Separation request sent.' }); setSeparationPhrase(''); setSeparationReason('') }
    setProcessingSeparation(false)
  }, [separationPhrase, separationReason, processingSeparation, requestSeparation])

  const handleRespondSeparation = useCallback(async (spaceSlug: string, decision: 'approve' | 'reject') => {
    if (responding) return; setSeparationAlert(null)
    if (!respondPhrase.trim()) { setSeparationAlert({ type: 'error', message: 'Please type the confirmation phrase.' }); return }
    if (respondPhrase.trim().toUpperCase() !== SEPARATION_CONFIRMATION_PHRASE.toUpperCase()) { setSeparationAlert({ type: 'error', message: `Confirmation phrase must be exactly "${SEPARATION_CONFIRMATION_PHRASE}".` }); return }
    setResponding(true); const result = await respondSeparation(spaceSlug, decision, respondPhrase.trim(), respondReason.trim() || undefined)
    if (result.error) { setSeparationAlert({ type: 'error', message: result.error }) } else { setSeparationAlert({ type: 'success', message: decision === 'approve' ? 'Space ended successfully.' : 'Separation request rejected.' }); setRespondPhrase(''); setRespondReason('') }
    setResponding(false)
  }, [respondPhrase, respondReason, responding, respondSeparation])

  const handleCancelSeparation = useCallback(async (spaceSlug: string) => { const result = await cancelSeparation(spaceSlug); if (result.error) setSeparationAlert({ type: 'error', message: result.error }); else setSeparationAlert({ type: 'success', message: 'Separation request cancelled.' }) }, [cancelSeparation])

  const handleCancelInvitation = useCallback(async (spaceSlug: string, invitationId: number) => { if (!window.confirm('Cancel this invitation?')) return; const result = await cancelInvitation(spaceSlug, invitationId); if (result.error) setInviteAlert({ type: 'error', message: result.error }); else setInviteAlert({ type: 'success', message: 'Invitation cancelled.' }) }, [cancelInvitation])

  if (authLoading || loading) {
    return <AuthenticatedLayout><div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 text-brand-500 animate-spin" /></div></AuthenticatedLayout>
  }

  const hasSpaces = spaces.length > 0

  return (
    <AuthenticatedLayout header={<div><h1 className="text-2xl font-bold text-warm-900">My Spaces</h1><p className="text-warm-500">Manage your shared spaces</p></div>}>
      <div className="max-w-4xl mx-auto space-y-8">
        {!hasSpaces && (
          <div className="bg-white rounded-3xl border border-warm-100 shadow-xl shadow-warm-900/5 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-500"><Heart className="h-6 w-6" /></div>
              <div><h2 className="text-xl font-semibold text-warm-900">Create Your Space</h2><p className="text-sm text-warm-600">Start a new shared space with your partner</p></div>
            </div>
            <form onSubmit={handleCreateSpace} className="space-y-5">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-warm-700 mb-1">Space Name</label>
                <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-warm-100 bg-warm-50 px-4 py-3 text-warm-900 transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:bg-white"
                  placeholder="e.g. Dinda & Aulia's Space" required aria-describedby={createError ? 'create-error' : undefined} aria-invalid={!!createError} />
                {createError && <p id="create-error" className="mt-2 text-sm text-coral-500" role="alert">{createError}</p>}
              </div>
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-warm-700 mb-1">Description (optional)</label>
                <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
                  className="w-full rounded-2xl border border-warm-100 bg-warm-50 px-4 py-3 text-warm-900 transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:bg-white"
                  placeholder="Tell your story briefly..." />
              </div>
              <button type="submit" disabled={creating}
                className="w-full rounded-2xl bg-gradient-to-r from-brand-500 to-rose-500 px-6 py-3 font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-60">
                {creating ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Creating...</span> : 'Create Space'}
              </button>
            </form>
          </div>
        )}

        {!hasSpaces && (
          <div className="bg-white rounded-3xl border border-warm-100 shadow-xl shadow-warm-900/5 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-500"><Users className="h-6 w-6" /></div>
              <div><h2 className="text-xl font-semibold text-warm-900">Join Space</h2><p className="text-sm text-warm-600">Enter the space invite code to request joining</p></div>
            </div>
            <form onSubmit={handleJoinSpace} className="space-y-4">
              <div>
                <label htmlFor="invite_code" className="block text-sm font-medium text-warm-700 mb-1">Space Invite Code</label>
                <input type="text" id="invite_code" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full rounded-2xl border border-warm-100 bg-warm-50 px-4 py-3 text-warm-900 uppercase tracking-widest text-center text-lg font-mono transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:bg-white"
                  placeholder="ABCD1234" aria-describedby={joinCodeError ? 'join-code-error' : undefined} aria-invalid={!!joinCodeError} />
                {joinCodeError && <p id="join-code-error" className="mt-2 text-sm text-coral-500" role="alert">{joinCodeError}</p>}
              </div>
              {joinAlert && <div role="alert" className={`rounded-2xl px-4 py-3 text-sm ${joinAlert.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-coral-50 text-coral-700 border border-coral-200'}`}>{joinAlert.message}</div>}
              <button type="submit" disabled={joining}
                className="w-full rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-3 font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-60">
                {joining ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Mengirim Permintaan...</span> : 'Request to Join'}
              </button>
            </form>
          </div>
        )}

        {hasSpaces && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-warm-100 shadow-xl shadow-warm-900/5 p-6">
              <p className="text-sm text-warm-600">Each account can only have one Space. Share your invite code with your partner so they can request to join.</p>
            </div>

            {spaces.map((space) => {
              const hasPartner = !!space.user_two_id
              const isOwner = space.user_one_id === user?.id
              const isInviteOpen = activeInviteSpaceId === space.id
              const isSeparationOpen = activeSeparationSpaceId === space.id
              const isJoinRequestOpen = activeJoinRequestSpaceId === space.id
              const spaceJoinRequests = joinRequests.filter((r) => r.space_id === space.id)

              return (
                <div key={space.id} className="bg-white rounded-3xl border border-warm-100 shadow-xl shadow-warm-900/5 p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-warm-900">{space.title}</h3>
                      <p className="text-sm text-warm-500">{hasPartner ? 'Partner connected. Enjoy all features together.' : 'No partner yet. Share your invite code.'}</p>
                    </div>
                    <Link href={`/spaces/${space.slug}`} className="inline-flex items-center justify-center rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700">Enter Space</Link>
                  </div>

                  {!hasPartner && isOwner && (
                    <div className="rounded-2xl border border-purple-100 bg-purple-50/60 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-purple-700">Your Space Invite Code</p>
                        <button onClick={() => handleCopyCode(space.invite_code)} className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-800 transition-colors">
                          {copiedCode === space.invite_code ? <><Check className="h-3 w-3" />Copied!</> : <><Copy className="h-3 w-3" />Copy</>}
                        </button>
                      </div>
                      <div className="flex items-center justify-center"><code className="text-2xl font-mono font-bold text-purple-800 tracking-widest">{space.invite_code}</code></div>
                      <p className="text-xs text-purple-600 text-center mt-2">Share this code with your partner so they can request to join this Space.</p>
                    </div>
                  )}

                  {!hasPartner && isOwner && spaceJoinRequests.length > 0 && (
                    <div className="space-y-3">
                      <button type="button" onClick={() => setActiveJoinRequestSpaceId(isJoinRequestOpen ? null : space.id)}
                        className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-100">
                        <UserPlus className="h-4 w-4" />{isJoinRequestOpen ? 'Hide Requests' : `Join Requests (${spaceJoinRequests.length})`}
                      </button>
                      {isJoinRequestOpen && (
                        <div className="space-y-3">
                          {joinAlert && <div className={`rounded-2xl px-4 py-3 text-sm ${joinAlert.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-coral-50 text-coral-700 border border-coral-200'}`}>{joinAlert.message}</div>}
                          {spaceJoinRequests.map((request) => (
                            <div key={request.id} className="flex items-center justify-between rounded-2xl border border-orange-200 bg-white p-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-500"><UserPlus className="h-5 w-5" /></div>
                                <div><p className="text-sm font-medium text-warm-900">{request.invitee?.name || request.invitee_email}</p><p className="text-xs text-warm-500">{request.invitee_email}</p></div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button onClick={() => handleRejectJoinRequest(space.id, request.id)} disabled={rejectingId === request.id}
                                  className="rounded-full border border-warm-200 px-3 py-1.5 text-xs font-medium text-warm-700 transition hover:bg-warm-50 disabled:opacity-60">{rejectingId === request.id ? '...' : 'Tolak'}</button>
                                <button onClick={() => handleApproveJoinRequest(space.id, request.id)} disabled={approvingId === request.id}
                                  className="rounded-full bg-green-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-green-600 disabled:opacity-60">{approvingId === request.id ? '...' : 'Terima'}</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {!hasPartner && isOwner && (
                    <div className="space-y-3">
                      {inviteAlert && <div className={`rounded-2xl px-4 py-3 text-sm ${inviteAlert.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-coral-50 text-coral-700 border border-coral-200'}`}>{inviteAlert.message}</div>}
                      <button type="button" onClick={() => { setActiveInviteSpaceId(isInviteOpen ? null : space.id); setInviteAlert(null); setInviteErrors({}) }}
                        className="inline-flex items-center gap-2 rounded-full border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-600 transition hover:bg-brand-50">
                        <Mail className="h-4 w-4" />{isInviteOpen ? 'Close Form' : 'Invite via Email'}
                      </button>
                      {isInviteOpen && (
                        <form onSubmit={(e) => { e.preventDefault(); handleInviteSubmit(space.slug) }} className="space-y-4 rounded-2xl border border-brand-100 bg-brand-50/60 p-5">
                          <div>
                            <label htmlFor="invite_name" className="block text-sm font-medium text-warm-700 mb-1">Partner Name</label>
                            <input id="invite_name" type="text" value={inviteName} onChange={(e) => setInviteName(e.target.value)}
                              className="w-full rounded-2xl border border-warm-100 bg-warm-50 px-4 py-2.5 text-sm transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                              placeholder="e.g. Aulia Rahma" aria-describedby={inviteErrors.partner_name ? 'invite-name-error' : undefined} aria-invalid={!!inviteErrors.partner_name} />
                            {inviteErrors.partner_name && <p id="invite-name-error" className="mt-1 text-xs text-coral-500" role="alert">{inviteErrors.partner_name}</p>}
                          </div>
                          <div>
                            <label htmlFor="invite_email" className="block text-sm font-medium text-warm-700 mb-1">Partner Email</label>
                            <input id="invite_email" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                              className="w-full rounded-2xl border border-warm-100 bg-warm-50 px-4 py-2.5 text-sm transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                              placeholder="name@email.com" aria-describedby={inviteErrors.partner_email ? 'invite-email-error' : undefined} aria-invalid={!!inviteErrors.partner_email} />
                            {inviteErrors.partner_email && <p id="invite-email-error" className="mt-1 text-xs text-coral-500" role="alert">{inviteErrors.partner_email}</p>}
                          </div>
                          <button type="submit" disabled={inviteLoading}
                            className="w-full rounded-2xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60">{inviteLoading ? 'Sending...' : 'Send Invitation'}</button>
                        </form>
                      )}
                    </div>
                  )}

                  <div className="border-t border-warm-100 pt-4">
                    <button type="button" onClick={() => setActiveSeparationSpaceId(isSeparationOpen ? null : space.id)}
                      className="inline-flex items-center gap-2 text-xs font-medium text-warm-400 transition hover:text-coral-500">
                      <AlertTriangle className="h-3 w-3" />{isSeparationOpen ? 'Close' : 'Request Space Separation'}
                    </button>
                    {isSeparationOpen && (
                      <div className="mt-4 space-y-4 rounded-2xl border border-coral-100 bg-coral-50/60 p-5">
                        <p className="text-sm text-coral-700">This action will permanently end your Space. Type <strong>{SEPARATION_CONFIRMATION_PHRASE}</strong> to confirm.</p>
                        <div>
                          <label className="block text-sm font-medium text-warm-700 mb-1">Confirmation Phrase</label>
                          <input type="text" value={separationPhrase} onChange={(e) => setSeparationPhrase(e.target.value)}
                            className="w-full rounded-2xl border border-warm-100 bg-warm-50 px-4 py-2.5 text-sm transition focus:border-coral-400 focus:ring-2 focus:ring-coral-200"
                            placeholder={SEPARATION_CONFIRMATION_PHRASE} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-warm-700 mb-1">Reason (optional)</label>
                          <textarea value={separationReason} onChange={(e) => setSeparationReason(e.target.value)} rows={2}
                            className="w-full rounded-2xl border border-warm-100 bg-warm-50 px-4 py-2.5 text-sm transition focus:border-coral-400 focus:ring-2 focus:ring-coral-200"
                            placeholder="Why are you requesting separation?" />
                        </div>
                        {separationAlert && <div className={`rounded-2xl px-4 py-3 text-sm ${separationAlert.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-coral-100 text-coral-700 border border-coral-200'}`}>{separationAlert.message}</div>}
                        <div className="flex gap-3">
                          <button type="button" onClick={() => handleRequestSeparation(space.slug)} disabled={processingSeparation}
                            className="flex-1 rounded-2xl bg-coral-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-coral-600 disabled:opacity-60">{processingSeparation ? 'Processing...' : 'Request Separation'}</button>
                          <button type="button" onClick={() => { handleCancelSeparation(space.slug); setActiveSeparationSpaceId(null) }}
                            className="rounded-2xl border border-warm-200 px-4 py-2.5 text-sm font-medium text-warm-700 transition hover:bg-warm-50">Cancel Request</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!hasSpaces && spaces.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-brand-500 mb-4"><Heart className="h-10 w-10" /></div>
            <h3 className="text-xl font-semibold text-warm-900 mb-2">No spaces yet</h3>
            <p className="text-warm-600">Create your first shared space to start building memories together.</p>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  )
}
