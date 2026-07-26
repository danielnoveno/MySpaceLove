'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { Heart, BookOpen, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

type Chapter = { id: string; title: string; content: string; author: string; created_at: string; chapter_number: number }

export default function PublicSurpriseStoryPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params.slug as string
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadChapters = useCallback(() => {
    setLoading(true)
    try {
      const dataParam = searchParams.get('data')
      if (dataParam) { try { const decoded = JSON.parse(atob(dataParam)); if (Array.isArray(decoded) && decoded.length > 0) { setChapters(decoded); setLoading(false); return } } catch {} }
      const storageKey = `storybook_${slug}`; const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) { setChapters([...parsed].sort((a: Chapter, b: Chapter) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())) }
        else setError('No chapters found in the storybook')
      } else setError('No storybook found for this space')
    } catch { setError('Failed to load story') }
    setLoading(false)
  }, [slug, searchParams])

  useEffect(() => { loadChapters() }, [loadChapters])

  const activeChapter = chapters[activeIndex]
  const totalPages = chapters.length
  const authorBg = (author: string) => author === 'Partner A' ? 'bg-brand-500' : 'bg-purple-500'

  if (loading) {
    return <div className="story-page"><FloatingHearts /><div className="story-content"><Loader2 className="h-12 w-12 text-white animate-spin mx-auto" /><p className="text-white/80 mt-4 text-lg">Opening your storybook...</p></div></div>
  }

  if (error || chapters.length === 0) {
    return <div className="story-page"><FloatingHearts /><div className="story-content"><div className="story-card text-center max-w-md mx-auto"><BookOpen className="h-16 w-16 text-brand-300 mx-auto mb-4" /><h2 className="text-2xl font-bold text-warm-800 mb-2">No Story Yet</h2><p className="text-warm-600">{error || 'The storybook is empty'}</p></div></div></div>
  }

  return (
    <div className="story-page">
      <FloatingHearts />
      <div className="story-content">
        <div className="text-center mb-6 animate-fade-in">
          <BookOpen className="h-10 w-10 text-white/80 mx-auto mb-3" />
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Georgia, serif' }}>Our Love Story</h1>
          <div className="w-24 h-0.5 bg-white/40 mx-auto mt-3" />
        </div>

        <div className="story-card animate-slide-up max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full text-white text-sm font-bold ${authorBg(activeChapter.author)}`}>{activeChapter.author === 'Partner A' ? 'A' : 'B'}</div>
            <div>
              <span className="text-sm font-medium text-warm-600">{activeChapter.author}</span>
              <p className="text-xs text-warm-400">{new Date(activeChapter.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>

          <div className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-2">Chapter {activeChapter.chapter_number}</div>
          <h2 className="text-2xl md:text-3xl font-bold text-warm-900 mb-6 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>{activeChapter.title}</h2>
          <div className="prose prose-lg max-w-none text-warm-700 leading-relaxed">
            {activeChapter.content.split('\n\n').map((para, i) => <p key={i} className="mb-4 text-base md:text-lg">{para}</p>)}
          </div>

          <div className="mt-8 pt-6 border-t border-brand-100 flex items-center justify-center gap-2 text-brand-400">
            <Heart className="h-5 w-5 fill-current" /><Heart className="h-3 w-3 fill-current" /><Heart className="h-5 w-5 fill-current" />
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8 animate-fade-in">
            <button onClick={() => setActiveIndex((i) => Math.max(0, i - 1))} disabled={activeIndex === 0} className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition disabled:opacity-30 disabled:cursor-not-allowed"><ChevronLeft className="h-5 w-5" /></button>
            <span className="text-white/80 text-sm font-medium">{activeIndex + 1} / {totalPages}</span>
            <button onClick={() => setActiveIndex((i) => Math.min(totalPages - 1, i + 1))} disabled={activeIndex === totalPages - 1} className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition disabled:opacity-30 disabled:cursor-not-allowed"><ChevronRight className="h-5 w-5" /></button>
          </div>
        )}

        <div className="text-center mt-8 animate-fade-in">
          <div className="flex items-center justify-center gap-2 text-white/60 text-sm"><Heart className="h-4 w-4 fill-current" /><span>A story written with love</span><Heart className="h-4 w-4 fill-current" /></div>
          <p className="text-white/40 text-xs mt-2">MySpaceLove</p>
        </div>
      </div>

      <style jsx global>{`
        .story-page { min-height: 100vh; background: linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #f43f5e 100%); display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
        .story-content { position: relative; z-index: 10; width: 100%; max-width: 42rem; padding: 2rem 1rem; }
        .story-card { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px); border-radius: 1.5rem; padding: 2rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.2); }
        @keyframes float-heart { 0% { transform: translateY(100vh) rotate(0deg) scale(1); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(-10vh) rotate(720deg) scale(0.5); opacity: 0; } }
        .floating-heart { position: fixed; color: rgba(255, 255, 255, 0.15); animation: float-heart linear infinite; pointer-events: none; z-index: 1; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.8s ease-out 0.3s forwards; opacity: 0; }
      `}</style>
    </div>
  )
}

function FloatingHearts() {
  const hearts = Array.from({ length: 15 }, (_, i) => ({ id: i, left: `${Math.random() * 100}%`, delay: `${Math.random() * 10}s`, duration: `${8 + Math.random() * 7}s`, size: 14 + Math.random() * 20 }))
  return <>{hearts.map((heart) => <div key={heart.id} className="floating-heart" style={{ left: heart.left, animationDelay: heart.delay, animationDuration: heart.duration, fontSize: `${heart.size}px` }}>❤</div>)}</>
}
