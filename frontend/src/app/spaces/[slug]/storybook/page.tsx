'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import {
  BookOpen, Plus, Edit3, Trash2, Heart, ChevronDown, ChevronUp, X, Loader2,
} from 'lucide-react'

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

  const [chapters, setChapters] = useState<Chapter[]>([])
  const [view, setView] = useState<ViewMode>('timeline')
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Form state
  const [formTitle, setFormTitle] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formAuthor, setFormAuthor] = useState('Partner A')
  const [editingId, setEditingId] = useState<string | null>(null)

  // Load chapters from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        setChapters(JSON.parse(stored))
      }
    } catch {
      // ignore parse errors
    }
  }, [storageKey])

  // Save chapters to localStorage
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
    if (!confirm('Delete this chapter?')) return
    setDeleting(id)
    // small delay for UX
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

  const authorColor = (author: string) =>
    author === 'Partner A'
      ? 'from-pink-400 to-rose-500'
      : 'from-purple-400 to-indigo-500'

  const authorBg = (author: string) =>
    author === 'Partner A' ? 'bg-pink-500' : 'bg-purple-500'

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
            className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 mb-8 font-medium"
          >
            <ChevronUp className="h-4 w-4" />
            Back to Timeline
          </button>

          <article className="rounded-3xl bg-white/90 backdrop-blur shadow-lg border border-pink-100 p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full text-white text-sm font-bold ${authorBg(activeChapter.author)}`}>
                {activeChapter.author === 'Partner A' ? 'A' : 'B'}
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">{activeChapter.author}</span>
                <p className="text-xs text-gray-400">
                  {new Date(activeChapter.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 leading-tight">
              {activeChapter.title}
            </h1>

            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
              {activeChapter.content.split('\n\n').map((para, i) => (
                <p key={i} className="mb-4">{para}</p>
              ))}
            </div>

            <div className="mt-10 pt-6 border-t border-pink-100 flex items-center justify-center gap-2 text-pink-400">
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
            className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 mb-8 font-medium"
          >
            <ChevronUp className="h-4 w-4" />
            Back to Timeline
          </button>

          <div className="rounded-3xl bg-white/90 backdrop-blur shadow-lg border border-pink-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingId ? 'Edit Chapter' : 'Write a New Chapter'}
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Chapter Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. The Day We Met"
                  className="w-full rounded-xl border border-pink-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Written By</label>
                <div className="flex gap-3">
                  {['Partner A', 'Partner B'].map((author) => (
                    <button
                      key={author}
                      onClick={() => setFormAuthor(author)}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium border-2 transition ${
                        formAuthor === author
                          ? `${authorBg(author)} text-white border-transparent shadow-md`
                          : 'border-pink-200 text-gray-600 hover:border-pink-300 bg-white'
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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Story Content</label>
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  rows={10}
                  placeholder="Write your chapter here... Let the words flow from your heart."
                  className="w-full rounded-xl border border-pink-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition resize-none"
                />
                <p className="mt-1 text-xs text-gray-400">Separate paragraphs with a blank line</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setView('timeline'); resetForm() }}
                  className="flex-1 rounded-xl border border-pink-200 px-6 py-3 text-sm font-semibold text-gray-600 hover:bg-pink-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!formTitle.trim() || !formContent.trim()}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Heart className="h-4 w-4" />
                  {editingId ? 'Save Changes' : 'Publish Chapter'}
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-pink-500" />
              Our Storybook
            </h1>
            <p className="text-gray-600">Write your love story together, chapter by chapter</p>
          </div>
          <button
            onClick={() => { resetForm(); setView('form') }}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-pink-600 hover:to-rose-600"
          >
            <Plus className="h-4 w-4" />
            New Chapter
          </button>
        </div>
      }
    >
      {chapters.length === 0 ? (
        <div className="text-center py-20">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-rose-100 text-pink-500 mb-6">
            <BookOpen className="h-12 w-12" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your story begins here</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Every great love story is written one chapter at a time. Start writing yours together.
          </p>
          <button
            onClick={() => { resetForm(); setView('form') }}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-3 font-semibold text-white shadow-sm transition hover:from-pink-600 hover:to-rose-600"
          >
            <Plus className="h-5 w-5" />
            Write Your First Chapter
          </button>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-pink-300 via-rose-400 to-purple-400 -translate-x-1/2 hidden md:block" />
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-pink-300 via-rose-400 to-purple-400 md:hidden" />

          <div className="space-y-8 md:space-y-12">
            {sortedChapters.map((chapter, index) => {
              const isLeft = index % 2 === 0
              const isPartnerA = chapter.author === 'Partner A'

              return (
                <div key={chapter.id} className="relative">
                  {/* Timeline dot */}
                  <div className={`absolute left-6 md:left-1/2 top-6 w-4 h-4 rounded-full border-4 border-white shadow-md -translate-x-1/2 z-10 ${
                    isPartnerA ? 'bg-pink-500' : 'bg-purple-500'
                  }`} />

                  {/* Card */}
                  <div className={`md:w-[calc(50%-2rem)] ${
                    isLeft ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'
                  } ml-12 md:ml-0`}>
                    <div
                      className="group rounded-3xl bg-white/90 backdrop-blur shadow-sm border border-white/70 p-6 transition-all hover:shadow-lg cursor-pointer"
                      onClick={() => openReading(chapter)}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-full text-white text-sm font-bold ${authorBg(chapter.author)}`}>
                            {chapter.author === 'Partner A' ? 'A' : 'B'}
                          </div>
                          <div>
                            <span className="text-xs font-medium text-gray-500">{chapter.author}</span>
                            <p className="text-[11px] text-gray-400">
                              Chapter {chapter.chapter_number} · {new Date(chapter.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleEdit(chapter)}
                            className="p-1.5 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-colors"
                            title="Edit chapter"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(chapter.id)}
                            disabled={deleting === chapter.id}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Delete chapter"
                          >
                            {deleting === chapter.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors">
                        {chapter.title}
                      </h3>

                      {/* Preview */}
                      <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                        {chapter.content}
                      </p>

                      {/* Read more indicator */}
                      <div className="mt-3 flex items-center gap-1 text-xs text-pink-500 font-medium">
                        <span>Read chapter</span>
                        <ChevronDown className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* End of story marker */}
          <div className="relative mt-12 text-center">
            <div className="absolute left-1/2 -top-4 w-3 h-3 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full -translate-x-1/2 hidden md:block" />
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur px-5 py-2.5 text-sm text-gray-500 shadow-sm border border-pink-100">
              <Heart className="h-4 w-4 text-pink-400 fill-current" />
              To be continued...
            </div>
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  )
}
