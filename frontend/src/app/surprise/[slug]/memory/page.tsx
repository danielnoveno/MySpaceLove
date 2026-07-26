'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Heart, Lock, Calendar, MapPin, Star, Gift, Plane, Award, Loader2 } from 'lucide-react'

type Memory = { id: string; space_id: string; user_id: string; title: string; description: string | null; date: string; category: string; image_url: string | null; notes: string | null; created_at: string }
type Space = { id: string; name: string; slug: string }

const CATEGORY_CONFIG: Record<string, { label: string; icon: typeof Heart }> = { 'first-date': { label: 'First Date', icon: Heart }, anniversary: { label: 'Anniversary', icon: Star }, trip: { label: 'Trip', icon: Plane }, milestone: { label: 'Milestone', icon: Award }, gift: { label: 'Gift', icon: Gift }, adventure: { label: 'Adventure', icon: MapPin }, other: { label: 'Other', icon: Heart } }

export default function PublicSurpriseMemoryPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params.slug as string
  const memoryId = searchParams.get('memory_id')
  const [memory, setMemory] = useState<Memory | null>(null)
  const [space, setSpace] = useState<Space | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pinInput, setPinInput] = useState('')
  const [pinRequired, setPinRequired] = useState(false)
  const [pinError, setPinError] = useState('')
  const [unlocking, setUnlocking] = useState(false)
  const supabase = createClient()

  const fetchMemory = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const { data: spaceData } = await supabase.from('spaces').select('id, name, slug').eq('slug', slug).single()
      if (!spaceData) { setError('Space not found'); setLoading(false); return }
      setSpace(spaceData)
      let query = supabase.from('memory_lane').select('*').eq('space_id', spaceData.id).order('date', { ascending: false })
      if (memoryId) query = query.eq('id', memoryId); else query = query.limit(1)
      const { data: memoryData, error: memError } = await query.single()
      if (memError || !memoryData) { setError('No memories found to share'); setLoading(false); return }
      setMemory(memoryData); setLoading(false)
    } catch { setError('Failed to load memory'); setLoading(false) }
  }, [slug, memoryId, supabase])

  useEffect(() => { fetchMemory() }, [fetchMemory])

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault(); setUnlocking(true)
    setTimeout(() => { if (pinInput.length === 4) { setPinRequired(false); setPinError('') } else setPinError('Please enter a valid PIN'); setUnlocking(false) }, 500)
  }

  const catConfig = memory ? CATEGORY_CONFIG[memory.category] || CATEGORY_CONFIG.other : null
  const CatIcon = catConfig?.icon || Heart

  if (loading) {
    return <div className="surprise-page"><FloatingHearts /><div className="surprise-content"><Loader2 className="h-12 w-12 text-white animate-spin mx-auto" /><p className="text-white/80 mt-4 text-lg">Loading your surprise...</p></div></div>
  }

  if (error || !memory) {
    return <div className="surprise-page"><FloatingHearts /><div className="surprise-content"><div className="surprise-card text-center"><Heart className="h-16 w-16 text-brand-300 mx-auto mb-4" /><h2 className="text-2xl font-bold text-warm-800 mb-2">Oops!</h2><p className="text-warm-600">{error || 'Memory not found'}</p></div></div></div>
  }

  if (pinRequired) {
    return (
      <div className="surprise-page"><FloatingHearts /><div className="surprise-content"><div className="surprise-card text-center max-w-sm mx-auto">
        <Lock className="h-12 w-12 text-brand-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-warm-800 mb-2">This memory is locked</h2>
        <p className="text-warm-600 mb-6">Enter the PIN to view this surprise</p>
        <form onSubmit={handlePinSubmit} className="space-y-4">
          <input type="password" maxLength={6} value={pinInput} onChange={(e) => setPinInput(e.target.value)} placeholder="Enter PIN"
            className="w-full text-center text-2xl tracking-[0.5em] rounded-2xl border border-brand-200 bg-white/80 px-4 py-3 text-warm-900 placeholder-warm-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-200 outline-none transition" autoFocus />
          {pinError && <p className="text-coral-500 text-sm">{pinError}</p>}
          <button type="submit" disabled={unlocking || pinInput.length < 4}
            className="w-full rounded-2xl bg-gradient-to-r from-brand-500 to-rose-500 px-6 py-3 text-white font-semibold shadow-lg transition hover:from-brand-600 hover:to-rose-600 disabled:opacity-50">{unlocking ? 'Unlocking...' : 'Unlock'}</button>
        </form>
      </div></div></div>
    )
  }

  return (
    <div className="surprise-page">
      <FloatingHearts />
      <div className="surprise-content">
        <div className="text-center mb-8 animate-fade-in">
          <Heart className="h-10 w-10 text-white/80 mx-auto mb-3 fill-current" />
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Georgia, serif' }}>A Special Memory For You</h1>
          <div className="w-24 h-0.5 bg-white/40 mx-auto mt-3" />
        </div>

        <div className="surprise-card animate-slide-up max-w-2xl mx-auto">
          {memory.image_url && (
            <div className="relative h-64 md:h-80 -mx-6 -mt-6 mb-6 overflow-hidden rounded-t-3xl">
              <img src={memory.image_url} alt={memory.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          )}
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 text-brand-600 text-xs font-semibold px-3 py-1"><CatIcon className="h-3 w-3" />{catConfig?.label}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-warm-900 mb-3" style={{ fontFamily: 'Georgia, serif' }}>{memory.title}</h2>
          <div className="flex items-center gap-2 text-sm text-warm-500 mb-6"><Calendar className="h-4 w-4" /><span>{new Date(memory.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
          {memory.description && <p className="text-warm-700 text-lg leading-relaxed mb-4 whitespace-pre-wrap">{memory.description}</p>}
          {memory.notes && <div className="mt-4 pt-4 border-t border-brand-100"><p className="text-warm-500 italic text-sm whitespace-pre-wrap">{memory.notes}</p></div>}
        </div>

        <div className="text-center mt-10 animate-fade-in">
          <div className="flex items-center justify-center gap-2 text-white/60 text-sm"><Heart className="h-4 w-4 fill-current" /><span>Made with love by {space?.name || 'Someone Special'}</span><Heart className="h-4 w-4 fill-current" /></div>
          <p className="text-white/40 text-xs mt-2">MySpaceLove</p>
        </div>
      </div>

      <style jsx global>{`
        .surprise-page { min-height: 100vh; background: linear-gradient(135deg, #ec4899 0%, #a855f7 50%, #f43f5e 100%); display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
        .surprise-content { position: relative; z-index: 10; width: 100%; max-width: 32rem; padding: 2rem 1rem; }
        .surprise-card { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px); border-radius: 1.5rem; padding: 2rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.2); }
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
