'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft,
  Loader2,
  Check,
  Smile,
  Frown,
  Heart,
  Zap,
  Star,
} from 'lucide-react'

const moods = [
  { value: 'happy', label: 'Happy', icon: Smile, color: 'border-yellow-300 bg-yellow-50 text-yellow-700', activeColor: 'border-yellow-400 bg-yellow-100 ring-2 ring-yellow-300' },
  { value: 'sad', label: 'Sad', icon: Frown, color: 'border-blue-300 bg-blue-50 text-blue-700', activeColor: 'border-blue-400 bg-blue-100 ring-2 ring-blue-300' },
  { value: 'miss', label: 'Miss You', icon: Heart, color: 'border-pink-300 bg-pink-50 text-pink-700', activeColor: 'border-pink-400 bg-pink-100 ring-2 ring-pink-300' },
  { value: 'excited', label: 'Excited', icon: Zap, color: 'border-orange-300 bg-orange-50 text-orange-700', activeColor: 'border-orange-400 bg-orange-100 ring-2 ring-orange-300' },
  { value: 'grateful', label: 'Grateful', icon: Star, color: 'border-purple-300 bg-purple-50 text-purple-700', activeColor: 'border-purple-400 bg-purple-100 ring-2 ring-purple-300' },
]

export default function EditJournalPage() {
  const params = useParams()
  const slug = params.slug as string
  const journalId = params.id as string
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState('happy')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }
    if (user && slug && journalId) {
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

        const { data: journal } = await supabase
          .from('journals')
          .select('*')
          .eq('id', journalId)
          .eq('space_id', space.id)
          .single()

        if (!journal) {
          router.push(`/spaces/${slug}/journals`)
          return
        }

        setTitle(journal.title)
        setContent(journal.content)
        setMood(journal.mood)
        setLoading(false)
      })()
    }
  }, [user, authLoading, router, slug, journalId, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      setError('Please enter a title.')
      return
    }
    if (!content.trim()) {
      setError('Please write something.')
      return
    }

    setSaving(true)
    setError('')

    const { error: updateError } = await supabase
      .from('journals')
      .update({
        title: title.trim(),
        content: content.trim(),
        mood,
        updated_at: new Date().toISOString(),
      })
      .eq('id', journalId)

    if (updateError) {
      setError('Failed to update journal entry. Please try again.')
      setSaving(false)
      return
    }

    router.push(`/spaces/${slug}/journals`)
  }

  if (authLoading || loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 text-brand-500 animate-spin" />
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center gap-4">
          <Link
            href={`/spaces/${slug}/journals`}
            className="p-2 text-warm-400 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-warm-900">Edit Journal Entry</h1>
            <p className="text-warm-600">Update your thoughts</p>
          </div>
        </div>
      }
    >
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-2xl bg-coral-50 border border-coral-200 px-4 py-3 text-sm text-coral-700">
              {error}
            </div>
          )}

          {/* Mood Selector */}
          <div className="rounded-3xl bg-white border-warm-100 shadow-xl shadow-warm-900/5 p-6">
            <label className="block text-sm font-medium text-warm-700 mb-3">
              How are you feeling?
            </label>
            <div className="flex flex-wrap gap-3">
              {moods.map((m) => {
                const Icon = m.icon
                const isActive = mood === m.value
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMood(m.value)}
                    className={`inline-flex items-center gap-2 rounded-full border-2 px-4 py-2.5 text-sm font-medium transition-all ${
                      isActive ? m.activeColor : m.color + ' hover:shadow-sm'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {m.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Title */}
          <div className="rounded-3xl bg-white border-warm-100 shadow-xl shadow-warm-900/5 p-6">
            <label htmlFor="title" className="block text-sm font-medium text-warm-700 mb-2">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your thoughts a title..."
              className="w-full rounded-2xl border border-warm-200 px-4 py-3 text-warm-900 placeholder-warm-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
            />
          </div>

          {/* Content */}
          <div className="rounded-3xl bg-white border-warm-100 shadow-xl shadow-warm-900/5 p-6">
            <label htmlFor="content" className="block text-sm font-medium text-warm-700 mb-2">
              Your Thoughts
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              placeholder="Write from the heart..."
              className="w-full rounded-2xl border border-warm-200 px-4 py-3 text-warm-900 placeholder-warm-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3">
            <Link
              href={`/spaces/${slug}/journals`}
              className="rounded-2xl px-6 py-3 text-sm font-medium text-warm-700 hover:bg-warm-100 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Update Entry
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AuthenticatedLayout>
  )
}
