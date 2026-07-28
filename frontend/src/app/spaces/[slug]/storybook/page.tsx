'use client'

import { useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/motion'
import { BookOpen, Plus, Edit3, Trash2, Heart, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'

type Chapter = {
  id: string
  title: string
  content: string
  author: string
  created_at: string
  chapter_number: number
}

type ViewMode = 'timeline' | 'reading' | 'form'

export default function StorybookPage() {
  const params = useParams()
  const slug = params.slug as string
  const storageKey = `storybook_${slug}`

  const [chapters, setChapters] = useState<Chapter[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem(storageKey)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })
  const [view, setView] = useState<ViewMode>('timeline')
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const [formTitle, setFormTitle] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formAuthor, setFormAuthor] = useState('Partner A')
  const [editingId, setEditingId] = useState<string | null>(null)

  const saveChapters = useCallback((updated: Chapter[]) => {
    setChapters(updated)
    localStorage.setItem(storageKey, JSON.stringify(updated))
  }, [storageKey])

  const resetForm = () => {
    setFormTitle('')
    setFormContent('')
    setFormAuthor('Partner A')
    setEditingId(null)
  }

  const handleSubmit = () => {
    if (!formTitle.trim() || !formContent.trim()) return

    if (editingId) {
      const updated = chapters.map((ch) =>
        ch.id === editingId
          ? { ...ch, title: formTitle.trim(), content: formContent.trim(), author: formAuthor }
          : ch
      )
      saveChapters(updated)
    } else {
      const newChapter: Chapter = {
        id: crypto.randomUUID(),
        title: formTitle.trim(),
        content: formContent.trim(),
        author: formAuthor,
        created_at: new Date().toISOString(),
        chapter_number: chapters.length + 1,
      }
      saveChapters([...chapters, newChapter])
    }

    resetForm()
    setView('timeline')
  }

  const handleEdit = (chapter: Chapter) => {
    setFormTitle(chapter.title)
    setFormContent(chapter.content)
    setFormAuthor(chapter.author)
    setEditingId(chapter.id)
    setView('form')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus chapter ini?')) return
    setDeleting(id)
    await new Promise((r) => setTimeout(r, 200))
    const updated = chapters.filter((ch) => ch.id !== id)
    saveChapters(updated)
    setDeleting(null)
    if (activeChapter?.id === id) {
      setActiveChapter(null)
      setView('timeline')
    }
  }

  const openReading = (chapter: Chapter) => {
    setActiveChapter(chapter)
    setView('reading')
  }

  const authorBg = (author: string) =>
    author === 'Partner A' ? 'bg-brand-500' : 'bg-coral-500'

  const sortedChapters = [...chapters].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  // ── Reading Mode ──
  if (view === 'reading' && activeChapter) {
    return (
      <AuthenticatedLayout>
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => { setView('timeline'); setActiveChapter(null) }}
            className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 mb-8 font-medium"
          >
            <ChevronUp className="h-4 w-4" />
            Kembali ke Timeline
          </button>

          <article className="rounded-3xl bg-white border border-warm-100 p-8 md:p-12 shadow-xl shadow-warm-900/5">
            <div className="flex items-center gap-3 mb-6">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full text-white text-sm font-bold ${authorBg(activeChapter.author)}`}>
                {activeChapter.author === 'Partner A' ? 'A' : 'B'}
              </div>
              <div>
                <span className="text-sm font-medium text-warm-600">{activeChapter.author}</span>
                <p className="text-xs text-warm-400">
                  {new Date(activeChapter.created_at).toLocaleDateString('id-ID', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-warm-900 mb-8 leading-tight">
              {activeChapter.title}
            </h1>

            <div className="prose prose-lg max-w-none text-warm-700 leading-relaxed">
              {activeChapter.content.split('\n\n').map((para, i) => (
                <p key={i} className="mb-4">{para}</p>
              ))}
            </div>

            <div className="mt-10 pt-6 border-t border-warm-100 flex items-center justify-center gap-2 text-brand-400">
              <Heart className="h-5 w-5 fill-current" />
              <Heart className="h-3 w-3 fill-current" />
              <Heart className="h-5 w-5 fill-current" />
            </div>
          </article>
        </div>
      </AuthenticatedLayout>
    )
  }

  // ── Form Mode ──
  if (view === 'form') {
    return (
      <AuthenticatedLayout>
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => { setView('timeline'); resetForm() }}
            className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 mb-8 font-medium"
          >
            <ChevronUp className="h-4 w-4" />
            Kembali ke Timeline
          </button>

          <div className="rounded-3xl bg-white border border-warm-100 p-8 shadow-xl shadow-warm-900/5">
            <h2 className="text-2xl font-bold text-warm-900 mb-6">
              {editingId ? 'Edit Chapter' : 'Tulis Chapter Baru'}
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-warm-700 mb-1.5">Judul Chapter</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Contoh: Hari Pertama Kita Bertemu"
                  className="w-full rounded-2xl border border-warm-100 bg-warm-50 px-4 py-3 text-warm-900 placeholder-warm-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-warm-700 mb-1.5">Ditulis Oleh</label>
                <div className="flex gap-3">
                  {['Partner A', 'Partner B'].map((author) => (
                    <button
                      key={author}
                      onClick={() => setFormAuthor(author)}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium border-2 transition ${
                        formAuthor === author
                          ? `${authorBg(author)} text-white border-transparent shadow-md`
                          : 'border-warm-200 text-warm-600 hover:border-warm-300 bg-white'
                      }`}
                    >
                      <div className={`flex h-6 w-6 items-center justify-center rounded-full text-white text-xs font-bold ${
                        formAuthor === author ? 'bg-white/30' : authorBg(author)
                      }`}>
                        {author === 'Partner A' ? 'A' : 'B'}
                      </div>
                      {author}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-warm-700 mb-1.5">Isi Cerita</label>
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  rows={10}
                  placeholder="Tulis chapter Anda di sini... Biarkan kata-kata mengalir dari hati."
                  className="w-full rounded-2xl border border-warm-100 bg-warm-50 px-4 py-3 text-warm-900 placeholder-warm-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all resize-none"
                />
                <p className="mt-1 text-xs text-warm-400">Pisahkan paragraf dengan baris kosong</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setView('timeline'); resetForm() }}
                  className="flex-1 rounded-xl border border-warm-200 px-6 py-3 text-sm font-semibold text-warm-600 hover:bg-warm-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!formTitle.trim() || !formContent.trim()}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-coral-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:from-brand-600 hover:to-coral-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Heart className="h-4 w-4" />
                  {editingId ? 'Simpan Perubahan' : 'Terbitkan Chapter'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    )
  }

  // ── Timeline View (default) ──
  return (
    <AuthenticatedLayout
      header={
        <FadeIn>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100">
                <BookOpen className="h-6 w-6 text-brand-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-warm-900">Buku Cerita Kami</h1>
                <p className="text-warm-500">Tuliskan kisah cinta Anda bersama, chapter demi chapter</p>
              </div>
            </div>
            <button
              onClick={() => { resetForm(); setView('form') }}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-500 to-coral-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-brand-600 hover:to-coral-600 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              Chapter Baru
            </button>
          </div>
        </FadeIn>
      }
    >
      {chapters.length === 0 ? (
        <FadeIn delay={0.1}>
          <div className="text-center py-20">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-coral-100 text-brand-500 mb-6">
              <BookOpen className="h-12 w-12" />
            </div>
            <h2 className="text-2xl font-semibold text-warm-900 mb-2">Kisah Anda dimulai di sini</h2>
            <p className="text-warm-500 mb-6 max-w-md mx-auto">
              Setiap kisah cinta hebat ditulis satu chapter pada satu waktu. Mulai menulis kisah Anda bersama.
            </p>
            <button
              onClick={() => { resetForm(); setView('form') }}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-500 to-coral-500 px-6 py-3 font-semibold text-white shadow-sm transition-all hover:from-brand-600 hover:to-coral-600 active:scale-[0.98]"
            >
              <Plus className="h-5 w-5" />
              Tulis Chapter Pertama Anda
            </button>
          </div>
        </FadeIn>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-300 via-coral-400 to-coral-300 -translate-x-1/2 hidden md:block" />
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-300 via-coral-400 to-coral-300 md:hidden" />

          <StaggerContainer className="space-y-8 md:space-y-12">
            {sortedChapters.map((chapter, index) => {
              const isLeft = index % 2 === 0
              const isPartnerA = chapter.author === 'Partner A'

              return (
                <StaggerItem key={chapter.id}>
                  <div className="relative">
                    {/* Timeline dot */}
                    <div className={`absolute left-6 md:left-1/2 top-6 w-4 h-4 rounded-full border-4 border-white shadow-md -translate-x-1/2 z-10 ${
                      isPartnerA ? 'bg-brand-500' : 'bg-coral-500'
                    }`} />

                    {/* Card */}
                    <div className={`md:w-[calc(50%-2rem)] ${
                      isLeft ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'
                    } ml-12 md:ml-0`}>
                      <div
                        className="group rounded-3xl bg-white border border-warm-100 p-6 transition-all hover:shadow-xl hover:shadow-warm-900/5 cursor-pointer"
                        onClick={() => openReading(chapter)}
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-9 w-9 items-center justify-center rounded-full text-white text-sm font-bold ${authorBg(chapter.author)}`}>
                              {chapter.author === 'Partner A' ? 'A' : 'B'}
                            </div>
                            <div>
                              <span className="text-xs font-medium text-warm-500">{chapter.author}</span>
                              <p className="text-[11px] text-warm-400">
                                Chapter {chapter.chapter_number} · {new Date(chapter.created_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleEdit(chapter)}
                              className="p-1.5 text-warm-400 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors"
                              title="Edit chapter"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(chapter.id)}
                              disabled={deleting === chapter.id}
                              className="p-1.5 text-warm-400 hover:text-coral-600 hover:bg-coral-50 rounded-full transition-colors"
                              title="Hapus chapter"
                            >
                              {deleting === chapter.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        <h3 className="text-lg font-semibold text-warm-900 mb-2 group-hover:text-brand-600 transition-colors">
                          {chapter.title}
                        </h3>

                        <p className="text-sm text-warm-500 line-clamp-3 leading-relaxed">
                          {chapter.content}
                        </p>

                        <div className="mt-3 flex items-center gap-1 text-xs text-brand-500 font-medium">
                          <span>Baca chapter</span>
                          <ChevronDown className="h-3 w-3" />
                        </div>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              )
            })}
          </StaggerContainer>

          {/* End of story marker */}
          <div className="relative mt-12 text-center">
            <div className="absolute left-1/2 -top-4 w-3 h-3 bg-gradient-to-r from-brand-400 to-coral-400 rounded-full -translate-x-1/2 hidden md:block" />
            <div className="inline-flex items-center gap-2 rounded-full bg-white border border-warm-100 px-5 py-2.5 text-sm text-warm-500 shadow-sm">
              <Heart className="h-4 w-4 text-brand-400 fill-current" />
              Bersambung...
            </div>
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  )
}
