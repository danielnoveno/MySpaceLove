'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Calendar, Save, Loader2 } from 'lucide-react'

export default function EditCountdownPage() {
  const params = useParams()
  const slug = params.slug as string
  const countdownId = params.id as string
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [description, setDescription] = useState('')
  const [activities, setActivities] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }
    if (user && slug && countdownId) {
      ;(async () => {
        setLoading(true)

        const { data: space } = await supabase
          .from('spaces')
          .select('id')
          .eq('slug', slug)
          .single()

        if (!space) {
          router.push('/dashboard')
          return
        }

        const { data: countdown } = await supabase
          .from('countdowns')
          .select('*')
          .eq('id', countdownId)
          .eq('space_id', space.id)
          .single()

        if (!countdown) {
          router.push(`/spaces/${slug}/countdowns`)
          return
        }

        setName(countdown.name)
        setEventDate(countdown.event_date ? countdown.event_date.split('T')[0] : '')
        setDescription(countdown.description || '')
        setActivities(countdown.activities || '')
        setLoading(false)
      })()
    }
  }, [user, authLoading, router, slug, countdownId, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !eventDate) return

    setSaving(true)
    setError('')

    const { error: updateError } = await supabase
      .from('countdowns')
      .update({
        name: name.trim(),
        event_date: eventDate,
        description: description.trim() || null,
        activities: activities.trim() || null,
      })
      .eq('id', countdownId)

    if (updateError) {
      setError('Failed to update countdown. Please try again.')
      setSaving(false)
      return
    }

    router.push(`/spaces/${slug}/countdowns`)
  }

  if (authLoading || loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 text-pink-500 animate-spin" />
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center gap-3">
          <Link
            href={`/spaces/${slug}/countdowns`}
            className="p-2 rounded-full hover:bg-pink-50 text-gray-600 hover:text-pink-600 transition-colors"
            aria-label="Back to countdowns"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Countdown</h1>
            <p className="text-gray-600">Update your countdown details</p>
          </div>
        </div>
      }
    >
      <div className="max-w-lg mx-auto">
        <div className="rounded-3xl bg-white/80 backdrop-blur p-6 shadow-sm border border-white/70">
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 text-red-700 border border-red-100 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="event-name" className="block text-sm font-medium text-gray-700 mb-1">
                Event Name *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="event-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-pink-100 bg-pink-50/50 py-3 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                  placeholder="e.g., Anniversary, Vacation, Birthday"
                />
              </div>
            </div>

            <div>
              <label htmlFor="event-date" className="block text-sm font-medium text-gray-700 mb-1">
                Event Date *
              </label>
              <input
                id="event-date"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
                className="w-full rounded-xl border border-pink-100 bg-pink-50/50 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="countdown-description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="countdown-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-pink-100 bg-pink-50/50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent resize-none"
                placeholder="What makes this day special?"
              />
            </div>

            <div>
              <label htmlFor="countdown-activities" className="block text-sm font-medium text-gray-700 mb-1">
                Activities / Plans
              </label>
              <textarea
                id="countdown-activities"
                value={activities}
                onChange={(e) => setActivities(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-pink-100 bg-pink-50/50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent resize-none"
                placeholder="What do you plan to do?"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                href={`/spaces/${slug}/countdowns`}
                className="rounded-xl px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving || !name.trim() || !eventDate}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Update Countdown
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
