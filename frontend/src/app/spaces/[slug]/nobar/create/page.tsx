'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Loader2, Check, Film, Calendar, Tv, FileText } from 'lucide-react'

const PLATFORMS = ['Netflix', 'Disney+', 'HBO Max', 'Amazon Prime', 'Apple TV+', 'Hulu', 'Paramount+', 'Peacock', 'YouTube', 'Viu', 'Other']

export default function CreateNobarPage() {
  const params = useParams()
  const slug = params.slug as string
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [title, setTitle] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [platform, setPlatform] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [spaceId, setSpaceId] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) { router.push('/auth/login'); return }
    if (user && slug) {
      ;(async () => {
        const { data: space } = await supabase.from('spaces').select('id').eq('slug', slug).single()
        if (space) setSpaceId(space.id); else router.push('/dashboard')
      })()
    }
  }, [user, authLoading, router, slug, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!spaceId) return
    if (!title.trim()) { setError('Please enter a movie or show title.'); return }
    if (!scheduledAt) { setError('Please select a date and time.'); return }
    if (!platform) { setError('Please select a streaming platform.'); return }
    setSaving(true); setError('')
    const { error: insertError } = await supabase.from('nobar_sessions').insert({ space_id: spaceId, title: title.trim(), scheduled_at: new Date(scheduledAt).toISOString(), platform, description: description.trim() || null, created_by: user!.id })
    if (insertError) { setError('Failed to create session. Please try again.'); setSaving(false); return }
    router.push(`/spaces/${slug}/nobar`)
  }

  if (authLoading) {
    return <AuthenticatedLayout><div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 text-brand-500 animate-spin" /></div></AuthenticatedLayout>
  }

  return (
    <AuthenticatedLayout header={
      <div className="flex items-center gap-4">
        <Link href={`/spaces/${slug}/nobar`} className="p-2 text-warm-400 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors"><ArrowLeft className="h-5 w-5" /></Link>
        <div><h1 className="text-2xl font-bold text-warm-900">Create Watch Session</h1><p className="text-warm-600">Schedule a Nonton Bareng session with your partner</p></div>
      </div>
    }>
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="rounded-2xl bg-coral-50 border border-coral-200 px-4 py-3 text-sm text-coral-700">{error}</div>}
          <div className="rounded-3xl bg-white border border-warm-100 p-6 shadow-xl shadow-warm-900/5">
            <label htmlFor="title" className="flex items-center gap-2 text-sm font-medium text-warm-700 mb-2">
              <Film className="h-4 w-4 text-brand-500" />Movie / Show Title <span className="text-brand-500">*</span>
            </label>
            <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Squid Game, Spider-Man, etc."
              className="w-full rounded-2xl border border-warm-100 bg-warm-50 px-4 py-3 text-warm-900 placeholder-warm-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all" />
          </div>
          <div className="rounded-3xl bg-white border border-warm-100 p-6 shadow-xl shadow-warm-900/5">
            <label htmlFor="scheduledAt" className="flex items-center gap-2 text-sm font-medium text-warm-700 mb-2">
              <Calendar className="h-4 w-4 text-brand-500" />Date & Time <span className="text-brand-500">*</span>
            </label>
            <input id="scheduledAt" type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full rounded-2xl border border-warm-100 bg-warm-50 px-4 py-3 text-warm-900 placeholder-warm-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all" />
          </div>
          <div className="rounded-3xl bg-white border border-warm-100 p-6 shadow-xl shadow-warm-900/5">
            <label htmlFor="platform" className="flex items-center gap-2 text-sm font-medium text-warm-700 mb-2">
              <Tv className="h-4 w-4 text-brand-500" />Streaming Platform <span className="text-brand-500">*</span>
            </label>
            <select id="platform" value={platform} onChange={(e) => setPlatform(e.target.value)}
              className="w-full rounded-2xl border border-warm-100 bg-warm-50 px-4 py-3 text-warm-900 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all">
              <option value="">Select a platform</option>
              {PLATFORMS.map((p) => (<option key={p} value={p}>{p}</option>))}
            </select>
          </div>
          <div className="rounded-3xl bg-white border border-warm-100 p-6 shadow-xl shadow-warm-900/5">
            <label htmlFor="description" className="flex items-center gap-2 text-sm font-medium text-warm-700 mb-2">
              <FileText className="h-4 w-4 text-brand-500" />Notes
            </label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Any details about the session..."
              className="w-full rounded-2xl border border-warm-100 bg-warm-50 px-4 py-3 text-warm-900 placeholder-warm-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all resize-none" />
          </div>
          <div className="flex items-center justify-end gap-3">
            <Link href={`/spaces/${slug}/nobar`} className="rounded-xl px-6 py-3 text-sm font-medium text-warm-700 hover:bg-warm-100 transition-colors">Cancel</Link>
            <button type="submit" disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Creating...</> : <><Check className="h-4 w-4" />Create Session</>}
            </button>
          </div>
        </form>
      </div>
    </AuthenticatedLayout>
  )
}
