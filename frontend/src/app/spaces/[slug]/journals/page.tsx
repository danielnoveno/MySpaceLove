'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import {
  Plus,
  BookHeart,
  Trash2,
  Edit3,
  Calendar,
  Loader2,
  Frown,
  Smile,
  Heart,
  Zap,
  Star,
} from 'lucide-react'

type JournalEntry = {
  id: string
  space_id: string
  title: string
  content: string
  mood: string
  created_at: string
  updated_at: string
}

const moodConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  happy: { label: 'Happy', icon: Smile, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  sad: { label: 'Sad', icon: Frown, color: 'text-blue-600', bg: 'bg-blue-50' },
  miss: { label: 'Miss You', icon: Heart, color: 'text-pink-600', bg: 'bg-pink-50' },
  excited: { label: 'Excited', icon: Zap, color: 'text-orange-600', bg: 'bg-orange-50' },
  grateful: { label: 'Grateful', icon: Star, color: 'text-purple-600', bg: 'bg-purple-50' },
}

export default function JournalsPage() {
  const params = useParams()
  const slug = params.slug as string
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [journals, setJournals] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }
    if (user && slug) {
      ;(async () => {
        setLoading(true)

        const { data: space } = await supabase
          .from('spaces')
          .select('id')
          .eq('slug', slug)
          .single()

        if (!space) {
          setLoading(false)
          return
        }

        const { data } = await supabase
          .from('journals')
          .select('*')
          .eq('space_id', space.id)
          .order('created_at', { ascending: false })

        setJournals(data || [])
        setLoading(false)
      })()
    }
  }, [user, authLoading, router, slug, supabase])

  const deleteJournal = useCallback(async (id: string) => {
    if (!confirm('Delete this journal entry?')) return

    setDeleting(id)
    await supabase.from('journals').delete().eq('id', id)
    setJournals((prev) => prev.filter((j) => j.id !== id))
    setDeleting(null)
  }, [supabase])

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Love Journals</h1>
            <p className="text-gray-600">Write about how you feel</p>
          </div>
          <Link
            href={`/spaces/${slug}/journals/create`}
            className="inline-flex items-center gap-2 rounded-full bg-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-600"
          >
            <Plus className="h-4 w-4" />
            New Entry
          </Link>
        </div>
      }
    >
      {journals.length === 0 ? (
        <div className="text-center py-20">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-pink-100 text-pink-500 mb-6">
            <BookHeart className="h-12 w-12" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No journal entries yet</h2>
          <p className="text-gray-600 mb-6">
            Start writing your love story, one entry at a time.
          </p>
          <Link
            href={`/spaces/${slug}/journals/create`}
            className="inline-flex items-center gap-2 rounded-full bg-pink-500 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-pink-600"
          >
            <Plus className="h-5 w-5" />
            Write Your First Entry
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {journals.map((journal) => {
            const mood = moodConfig[journal.mood] || moodConfig.happy
            const MoodIcon = mood.icon

            return (
              <div
                key={journal.id}
                className="group rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/70 p-6 transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${mood.bg} ${mood.color}`}>
                        <MoodIcon className="h-3.5 w-3.5" />
                        {mood.label}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar className="h-3 w-3" />
                        {new Date(journal.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                      {journal.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {journal.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Link
                      href={`/spaces/${slug}/journals/${journal.id}/edit`}
                      className="p-2 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => deleteJournal(journal.id)}
                      disabled={deleting === journal.id}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    >
                      {deleting === journal.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </AuthenticatedLayout>
  )
}
