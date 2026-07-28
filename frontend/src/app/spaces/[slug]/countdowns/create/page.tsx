'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Calendar, Save } from 'lucide-react'

export default function CreateCountdownPage() {
  const params = useParams()
  const slug = params.slug as string
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [name, setName] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [description, setDescription] = useState('')
  const [activities, setActivities] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  useEffect(() => { if (!authLoading && !user) router.push('/auth/login') }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!user || !name || !eventDate) return; setSaving(true); setError('')
    const { data: space } = await supabase.from('spaces').select('id').eq('slug', slug).single()
    if (!space) { setError('Space not found'); setSaving(false); return }
    const { error: insertError } = await supabase.from('countdowns').insert({ space_id: space.id, name, event_date: eventDate, description: description || null, activities: activities || null })
    if (insertError) setError(insertError.message); else router.push(`/spaces/${slug}/countdowns`)
    setSaving(false)
  }

  if (authLoading) {
    return <AuthenticatedLayout><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500" /></div></AuthenticatedLayout>
  }

  return (
    <AuthenticatedLayout header={
      <div className="flex items-center gap-3">
        <Link href={`/spaces/${slug}/countdowns`} className="p-2 rounded-full hover:bg-brand-50 text-warm-600 hover:text-brand-600 transition-colors" aria-label="Back to countdowns"><ArrowLeft className="h-5 w-5" /></Link>
        <div><h1 className="text-2xl font-bold text-warm-900">Create Countdown</h1><p className="text-warm-500">Add a new special date to count down to</p></div>
      </div>
    }>
      <div className="max-w-lg mx-auto">
        <div className="rounded-3xl bg-white border border-warm-100 p-6 shadow-xl shadow-warm-900/5">
          {error && <div id="countdown-error" role="alert" className="mb-4 rounded-2xl bg-coral-50 text-coral-700 border border-coral-100 px-4 py-3 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="event-name" className="block text-sm font-medium text-warm-700 mb-1">Event Name *</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-warm-400" />
                <input id="event-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required
                  className="w-full rounded-2xl border border-warm-100 bg-warm-50 py-3 pl-10 pr-4 text-sm text-warm-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-transparent"
                  placeholder="e.g., Anniversary, Vacation, Birthday" aria-describedby={error ? 'countdown-error' : undefined} aria-invalid={!!error} />
              </div>
            </div>
            <div>
              <label htmlFor="event-date" className="block text-sm font-medium text-warm-700 mb-1">Event Date *</label>
              <input id="event-date" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required
                className="w-full rounded-2xl border border-warm-100 bg-warm-50 px-4 py-3 text-sm text-warm-900 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-transparent" />
            </div>
            <div>
              <label htmlFor="countdown-description" className="block text-sm font-medium text-warm-700 mb-1">Description</label>
              <textarea id="countdown-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                className="w-full rounded-2xl border border-warm-100 bg-warm-50 px-4 py-3 text-sm text-warm-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-transparent resize-none"
                placeholder="What makes this day special?" />
            </div>
            <div>
              <label htmlFor="countdown-activities" className="block text-sm font-medium text-warm-700 mb-1">Activities / Plans</label>
              <textarea id="countdown-activities" value={activities} onChange={(e) => setActivities(e.target.value)} rows={3}
                className="w-full rounded-2xl border border-warm-100 bg-warm-50 px-4 py-3 text-sm text-warm-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-transparent resize-none"
                placeholder="What do you plan to do?" />
            </div>
            <button type="submit" disabled={saving || !name || !eventDate}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-500 to-purple-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-50">
              <Save className="h-4 w-4" />{saving ? 'Creating...' : 'Create Countdown'}
            </button>
          </form>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
