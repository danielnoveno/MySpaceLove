'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Gift, Save, Calendar, Loader2 } from 'lucide-react'

export default function EditSurpriseNotePage() {
  const params = useParams()
  const slug = params.slug as string
  const noteId = params.id as string
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [unlockDate, setUnlockDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }
    if (user && slug && noteId) {
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

        const { data: note } = await supabase
          .from('surprise_notes')
          .select('*')
          .eq('id', noteId)
          .eq('space_id', space.id)
          .single()

        if (!note) {
          router.push(`/spaces/${slug}/surprise-notes`)
          return
        }

        setTitle(note.title)
        setMessage(note.message)
        // Format datetime for input: "2024-02-14T10:30"
        if (note.unlock_date) {
          const d = new Date(note.unlock_date)
          const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16)
          setUnlockDate(local)
        }
        setLoading(false)
      })()
    }
  }, [user, authLoading, router, slug, noteId, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !message.trim() || !unlockDate) return

    setSaving(true)
    setError('')

    const { error: updateError } = await supabase
      .from('surprise_notes')
      .update({
        title: title.trim(),
        message: message.trim(),
        unlock_date: new Date(unlockDate).toISOString(),
      })
      .eq('id', noteId)

    if (updateError) {
      setError('Failed to update surprise note. Please try again.')
      setSaving(false)
      return
    }

    router.push(`/spaces/${slug}/surprise-notes`)
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
            href={`/spaces/${slug}/surprise-notes`}
            className="p-2 rounded-full hover:bg-pink-50 text-gray-600 hover:text-pink-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Surprise Note</h1>
            <p className="text-gray-600">Update your surprise message</p>
          </div>
        </div>
      }
    >
      <div className="max-w-lg mx-auto">
        <div className="rounded-3xl bg-white/80 backdrop-blur p-6 shadow-sm border border-white/70">
          {/* Preview */}
          <div className="mb-6 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 p-4 text-center border border-pink-100">
            <Gift className="h-8 w-8 text-pink-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              Your note will be locked until the unlock date. Your partner won&apos;t be able to read it
              until then!
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 text-red-700 border border-red-100 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-xl border border-pink-100 bg-pink-50/50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                placeholder="e.g., Open on our anniversary!"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message *
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={6}
                className="w-full rounded-xl border border-pink-100 bg-pink-50/50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent resize-none"
                placeholder="Write your surprise message here..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unlock Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="datetime-local"
                  value={unlockDate}
                  onChange={(e) => setUnlockDate(e.target.value)}
                  required
                  className="w-full rounded-xl border border-pink-100 bg-pink-50/50 pl-10 pr-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                The note will be hidden until this date and time
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                href={`/spaces/${slug}/surprise-notes`}
                className="rounded-xl px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving || !title.trim() || !message.trim() || !unlockDate}
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
                    Update Surprise Note
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
