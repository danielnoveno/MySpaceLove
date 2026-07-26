'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useSpaces } from '@/lib/hooks/useSpaces'
import { ArrowLeft, Heart, Loader2 } from 'lucide-react'

export default function CreateSpacePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { createSpace } = useSpaces()
  const [title, setTitle] = useState('')
  const [bio, setBio] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { if (!authLoading && !user) router.push('/auth/login') }, [user, authLoading, router])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault(); if (processing) return; setError(null)
    if (!title.trim()) { setError('Space name is required.'); return }
    setProcessing(true); const result = await createSpace(title.trim(), bio.trim() || undefined)
    if (result.error) { setError(result.error); setProcessing(false); return }
    if (result.space) router.push(`/spaces/${result.space.slug}`)
  }, [title, bio, processing, createSpace, router])

  if (authLoading) {
    return <AuthenticatedLayout><div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 text-brand-500 animate-spin" /></div></AuthenticatedLayout>
  }

  return (
    <AuthenticatedLayout header={
      <div className="flex items-center gap-4">
        <Link href="/spaces" className="rounded-lg p-2 transition hover:bg-warm-100" aria-label="Back to spaces"><ArrowLeft className="h-5 w-5" /></Link>
        <div><h1 className="text-2xl font-bold text-warm-900">Create Space</h1><p className="text-warm-500">Start a new shared space with your partner</p></div>
      </div>
    }>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl border border-warm-100 shadow-xl shadow-warm-900/5 p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-rose-500 text-white"><Heart className="h-7 w-7" /></div>
            <div><h2 className="text-xl font-semibold text-warm-900">Your New Space</h2><p className="text-sm text-warm-600">A place to share moments with your loved one</p></div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-warm-700 mb-2">Space Name <span className="text-brand-500">*</span></label>
              <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-2xl border border-warm-100 bg-warm-50 px-5 py-4 text-warm-900 transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:bg-white"
                placeholder="e.g. Dinda & Aulia's Space" required aria-describedby={error ? 'create-space-error' : undefined} aria-invalid={!!error} />
              {error && <p id="create-space-error" className="mt-2 text-sm text-coral-500" role="alert">{error}</p>}
            </div>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-warm-700 mb-2">Description (optional)</label>
              <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={4}
                className="w-full rounded-2xl border border-warm-100 bg-warm-50 px-5 py-4 text-warm-900 transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:bg-white"
                placeholder="Tell your story briefly..." />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/spaces" className="flex-1 rounded-2xl border border-warm-200 px-6 py-4 text-center font-medium text-warm-700 transition hover:bg-warm-50">Cancel</Link>
              <button type="submit" disabled={processing}
                className="flex-1 rounded-2xl bg-gradient-to-r from-brand-500 to-rose-500 px-6 py-4 font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-60">
                {processing ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Creating...</span> : 'Create Space'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
