'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/motion'
import {
  Lock,
  Unlock,
  Plus,
  Trash2,
  ArrowLeft,
  Gift,
  Calendar,
  Link2,
  Check,
  StickyNote,
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
  const [copiedNoteId, setCopiedNoteId] = useState<number | null>(null)
  const supabase = createClient()

  const fetchNotes = useCallback(async () => {
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
      .from('surprise_notes')
      .select('*')
      .eq('space_id', space.id)
      .order('unlock_date', { ascending: true })

    if (data) setNotes(data)
    setLoading(false)
  }, [slug, supabase])

  useEffect(() => {
    if (!authLoading && !user) return
    if (user) {
      const timeout = setTimeout(fetchNotes, 0)
      return () => clearTimeout(timeout)
    }
  }, [user, authLoading, fetchNotes])

  const deleteNote = async (id: number) => {
    if (!confirm('Hapus catatan kejutan ini?')) return
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
          <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout
      header={
        <FadeIn>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href={`/spaces/${slug}`}
                className="p-2 rounded-xl hover:bg-warm-50 text-warm-500 hover:text-warm-700 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100">
                <StickyNote className="h-6 w-6 text-brand-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-warm-900">Catatan Kejutan</h1>
                <p className="text-warm-500">Catatan cinta terkunci waktu untuk satu sama lain</p>
              </div>
            </div>
            <Link
              href={`/spaces/${slug}/surprise-notes/create`}
              className="flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-600 hover:shadow-md hover:shadow-brand-500/25 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              Baru
            </Link>
          </div>
        </FadeIn>
      }
    >
      <div className="max-w-2xl mx-auto">
        {notes.length === 0 ? (
          <FadeIn delay={0.1}>
            <div className="text-center py-16">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 text-brand-400 mb-4">
                <Gift className="h-10 w-10" />
              </div>
              <h2 className="text-xl font-semibold text-warm-900 mb-2">Belum ada catatan kejutan</h2>
              <p className="text-warm-500 mb-6">
                Buat catatan terkunci waktu untuk pasangan Anda temukan nanti!
              </p>
              <Link
                href={`/spaces/${slug}/surprise-notes/create`}
                className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-500/25 active:scale-[0.98]"
              >
                <Plus className="h-5 w-5" />
                Buat Catatan Kejutan
              </Link>
            </div>
          </FadeIn>
        ) : (
          <StaggerContainer className="space-y-4">
            {notes.map((note) => {
              const unlocked = isUnlocked(note.unlock_date)
              const isSender = note.sender_id === user?.id

              return (
                <StaggerItem key={note.id}>
                  <div
                    className={`rounded-3xl p-6 shadow-sm border transition-all ${
                      unlocked
                        ? 'bg-white border-warm-100 hover:shadow-lg hover:shadow-warm-900/5'
                        : 'bg-gradient-to-br from-brand-50 to-coral-50 border-brand-100'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                            unlocked
                              ? 'bg-green-100 text-green-600'
                              : 'bg-brand-100 text-brand-500'
                          }`}
                        >
                          {unlocked ? (
                            <Unlock className="h-6 w-6" />
                          ) : (
                            <Lock className="h-6 w-6" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-warm-900">{note.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="h-4 w-4 text-warm-400" />
                            <span className="text-sm text-warm-500">
                              {unlocked ? 'Dibuka' : 'Membuka'} pada{' '}
                              {new Date(note.unlock_date).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          {isSender && (
                            <span className="inline-block mt-1 text-xs text-brand-500 bg-brand-50 rounded-full px-2 py-0.5">
                              Dari Anda
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
                              : 'text-warm-400 hover:text-brand-600 hover:bg-brand-50'
                          }`}
                          title="Salin tautan kejutan publik"
                        >
                          {copiedNoteId === note.id ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Link2 className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => deleteNote(note.id)}
                          className="p-2 rounded-full text-warm-400 hover:text-coral-600 hover:bg-coral-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Message Content */}
                    {unlocked ? (
                      <div className="mt-4 pl-16">
                        <p className="text-warm-700 whitespace-pre-wrap">{note.message}</p>
                      </div>
                    ) : (
                      <div className="mt-4 pl-16">
                        <div className="rounded-xl bg-white/60 p-4 text-center border border-warm-100">
                          <Lock className="h-6 w-6 text-brand-300 mx-auto mb-2" />
                          <p className="text-sm text-warm-400 italic">
                            Catatan ini masih terkunci. Kembali pada{' '}
                            {new Date(note.unlock_date).toLocaleDateString('id-ID')} untuk membacanya!
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </StaggerItem>
              )
            })}
          </StaggerContainer>
        )}
      </div>
    </AuthenticatedLayout>
  )
}
