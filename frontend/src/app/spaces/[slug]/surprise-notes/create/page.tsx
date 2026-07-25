'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Gift, Save, Calendar, Link2, Check } from 'lucide-react'

export default function CreateSurpriseNotePage() {
  const params = useParams()
  const slug = params.slug as string
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [unlockDate, setUnlockDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [createdNoteId, setCreatedNoteId] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !title || !message || !unlockDate) return

    setSaving(true)
    setError('')

    const { data: space } = await supabase
      .from('spaces')
      .select('id')
      .eq('slug', slug)
      .single()

    if (!space) {
      setError('Space not found')
      setSaving(false)
      return
    }

    const { error: insertError } = await supabase.from('surprise_notes').insert({
      space_id: space.id,
      title,
      message,
      unlock_date: unlockDate,
      sender_id: user.id,
    })

    if (insertError) {
      setError(insertError.message)
    } else {
      // Store the created note ID so we can show the share link
      const { data: latestNote } = await supabase
        .from('surprise_notes')
        .select('id')
        .eq('space_id', space.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (latestNote) {
        setCreatedNoteId(latestNote.id)
      } else {
        router.push(`/spaces/${slug}/surprise-notes`)
      }
    }
    setSaving(false)
  }

  const shareUrl = createdNoteId
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/surprise/${slug}/memory?memory_id=${createdNoteId}`
    : ''

  const copyShareLink = async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input')
      input.value = shareUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (authLoading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
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
            <h1 className="text-2xl font-bold text-gray-900">Create Surprise Note</h1>
            <p className="text-gray-600">Write a note that unlocks on a special date</p>
          </div>
        </div>
      }
    >
      <div className="max-w-lg mx-auto">
        {createdNoteId ? (
          /* Success + Share Link */
          <div className="rounded-3xl bg-white/80 backdrop-blur p-8 shadow-sm border border-white/70 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-500 mb-4">
              <Gift className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Surprise Created!</h2>
            <p className="text-gray-600 mb-6">
              Your surprise note has been created. Share the link below so someone special can view it!
            </p>

            {/* Share Link Box */}
            <div className="rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-100 p-4 mb-6">
              <p className="text-xs text-gray-500 mb-2 font-medium">Public Surprise Link</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 rounded-xl bg-white border border-pink-100 px-3 py-2 text-sm text-gray-700 font-mono truncate focus:outline-none"
                />
                <button
                  onClick={copyShareLink}
                  className={`shrink-0 flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white transition ${
                    copied
                      ? 'bg-green-500'
                      : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:shadow-md'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Link2 className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                href={`/spaces/${slug}/surprise-notes`}
                className="flex-1 rounded-xl border border-pink-200 px-6 py-3 text-sm font-semibold text-gray-600 hover:bg-pink-50 transition text-center"
              >
                Back to Notes
              </Link>
              <button
                onClick={() => {
                  setCreatedNoteId(null)
                  setTitle('')
                  setMessage('')
                  setUnlockDate('')
                }}
                className="flex-1 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
              >
                Create Another
              </button>
            </div>
          </div>
        ) : (
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

            <button
              type="submit"
              disabled={saving || !title || !message || !unlockDate}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Creating...' : 'Create Surprise Note'}
            </button>
          </form>
        </div>
        )}
      </div>
    </AuthenticatedLayout>
  )
}
