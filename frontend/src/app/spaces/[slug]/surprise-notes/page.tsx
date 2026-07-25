'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import {
  Lock,
  Unlock,
  Plus,
  Trash2,
  Edit3,
  ArrowLeft,
  Gift,
  Calendar,
  Link2,
  Check,
} from 'lucide-react'

type SurpriseNote = {
  id: number
  space_id: number
  title: string
  message: string
  unlock_date: string
  sender_id: string
  created_at: string
}

export default function SurpriseNotesPage() {
  const params = useParams()
  const slug = params.slug as string
  const { user, loading: authLoading } = useAuth()
  const [notes, setNotes] = useState<SurpriseNote[]>([])
  const [loading, setLoading] = useState(true)
  const [spaceId, setSpaceId] = useState<number | null>(null)
  const [copiedNoteId, setCopiedNoteId] = useState<number | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!authLoading && !user) return
    if (user) fetchNotes()
  }, [user, authLoading])

  const fetchNotes = async () => {
    const { data: space } = await supabase
      .from('spaces')
      .select('id')
      .eq('slug', slug)
      .single()

    if (!space) {
      setLoading(false)
      return
    }

    setSpaceId(space.id)

    const { data } = await supabase
      .from('surprise_notes')
      .select('*')
      .eq('space_id', space.id)
      .order('unlock_date', { ascending: true })

    if (data) setNotes(data)
    setLoading(false)
  }

  const deleteNote = async (id: number) => {
    await supabase.from('surprise_notes').delete().eq('id', id)
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  const isUnlocked = (unlockDate: string) => {
    return new Date(unlockDate) <= new Date()
  }

  const getShareUrl = (noteId: number) => {
    if (typeof window === 'undefined') return ''
    return `${window.location.origin}/surprise/${slug}/memory?memory_id=${noteId}`
  }

  const copyShareLink = async (noteId: number) => {
    const url = getShareUrl(noteId)
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const input = document.createElement('input')
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    }
    setCopiedNoteId(noteId)
    setTimeout(() => setCopiedNoteId(null), 2000)
  }

  if (authLoading || loading) {
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/spaces/${slug}`}
              className="p-2 rounded-full hover:bg-pink-50 text-gray-600 hover:text-pink-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Surprise Notes</h1>
              <p className="text-gray-600">Time-locked love notes for each other</p>
            </div>
          </div>
          <Link
            href={`/spaces/${slug}/surprise-notes/create`}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            New
          </Link>
        </div>
      }
    >
      <div className="max-w-2xl mx-auto">
        {notes.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-pink-100 text-pink-400 mb-4">
              <Gift className="h-10 w-10" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No surprise notes yet</h2>
            <p className="text-gray-500 mb-6">
              Create a time-locked note for your partner to discover later!
            </p>
            <Link
              href={`/spaces/${slug}/surprise-notes/create`}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
            >
              <Plus className="h-5 w-5" />
              Create Surprise Note
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => {
              const unlocked = isUnlocked(note.unlock_date)
              const isSender = note.sender_id === user?.id

              return (
                <div
                  key={note.id}
                  className={`rounded-3xl p-6 shadow-sm border transition-all ${
                    unlocked
                      ? 'bg-white/80 backdrop-blur border-white/70 hover:shadow-md'
                      : 'bg-gradient-to-br from-pink-50 to-purple-50 border-pink-100'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                          unlocked
                            ? 'bg-green-100 text-green-600'
                            : 'bg-pink-100 text-pink-500'
                        }`}
                      >
                        {unlocked ? (
                          <Unlock className="h-6 w-6" />
                        ) : (
                          <Lock className="h-6 w-6" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{note.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {unlocked ? 'Unlocked' : 'Unlocks'} on{' '}
                            {new Date(note.unlock_date).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        {isSender && (
                          <span className="inline-block mt-1 text-xs text-pink-500 bg-pink-50 rounded-full px-2 py-0.5">
                            From you
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => copyShareLink(note.id)}
                        className={`p-2 rounded-full transition-colors ${
                          copiedNoteId === note.id
                            ? 'text-green-600 bg-green-50'
                            : 'text-gray-400 hover:text-pink-600 hover:bg-pink-50'
                        }`}
                        title="Copy public surprise link"
                      >
                        {copiedNoteId === note.id ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Link2 className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="p-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Message Content */}
                  {unlocked ? (
                    <div className="mt-4 pl-16">
                      <p className="text-gray-700 whitespace-pre-wrap">{note.message}</p>
                    </div>
                  ) : (
                    <div className="mt-4 pl-16">
                      <div className="rounded-xl bg-white/60 p-4 text-center">
                        <Lock className="h-6 w-6 text-pink-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-400 italic">
                          This note is still locked. Come back on{' '}
                          {new Date(note.unlock_date).toLocaleDateString()} to read it!
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  )
}
