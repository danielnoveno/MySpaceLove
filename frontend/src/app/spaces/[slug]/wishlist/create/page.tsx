'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { FadeIn } from '@/components/motion'
import { ArrowLeft, Loader2, Check } from 'lucide-react'

export default function CreateWishlistPage() {
  const params = useParams()
  const slug = params.slug as string
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [spaceId, setSpaceId] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) { router.push('/auth/login'); return }
    if (user && slug) {
      ;(async () => {
        const { data: space } = await supabase.from('spaces').select('id').eq('slug', slug).single()
        if (space) setSpaceId(space.id)
        else router.push('/dashboard')
      })()
    }
  }, [user, authLoading, router, slug, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!spaceId) return
    if (!title.trim()) { setError('Masukkan judul.'); return }
    setSaving(true); setError('')
    const { error: insertError } = await supabase.from('wishlist_items').insert({
      space_id: spaceId, title: title.trim(), description: description.trim() || null,
      location: location.trim() || null, notes: notes.trim() || null, status: 'pending',
    })
    if (insertError) { setError('Gagal menyimpan. Silakan coba lagi.'); setSaving(false); return }
    router.push(`/spaces/${slug}/wishlist`)
  }

  if (authLoading) {
    return <AuthenticatedLayout><div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 text-brand-500 animate-spin" /></div></AuthenticatedLayout>
  }

  return (
    <AuthenticatedLayout header={
      <FadeIn><div className="flex items-center gap-4">
        <Link href={`/spaces/${slug}/wishlist`} className="p-2 text-warm-400 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors"><ArrowLeft className="h-5 w-5" /></Link>
        <div><h1 className="text-2xl font-bold text-warm-900">Tambah Wishlist</h1><p className="text-warm-500">Hal yang ingin dilakukan atau didapatkan bersama</p></div>
      </div></FadeIn>
    }>
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="rounded-2xl bg-coral-50 border border-coral-200 px-4 py-3 text-sm text-coral-700">{error}</div>}

          <FadeIn delay={0.1}><div className="rounded-3xl bg-white border border-warm-100 p-6 shadow-xl shadow-warm-900/5">
            <label htmlFor="title" className="block text-sm font-medium text-warm-700 mb-2">Apa yang Anda inginkan? <span className="text-brand-500">*</span></label>
            <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contoh: Jalan-jalan ke Paris, Beli jam matching..."
              className="w-full rounded-2xl border border-warm-100 bg-warm-50 px-4 py-3 text-warm-900 placeholder-warm-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:bg-white outline-none transition-all" />
          </div></FadeIn>

          <FadeIn delay={0.15}><div className="rounded-3xl bg-white border border-warm-100 p-6 shadow-xl shadow-warm-900/5">
            <label htmlFor="description" className="block text-sm font-medium text-warm-700 mb-2">Deskripsi</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Ceritakan lebih lanjut..."
              className="w-full rounded-2xl border border-warm-100 bg-warm-50 px-4 py-3 text-warm-900 placeholder-warm-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:bg-white outline-none transition-all resize-none" />
          </div></FadeIn>

          <FadeIn delay={0.2}><div className="rounded-3xl bg-white border border-warm-100 p-6 shadow-xl shadow-warm-900/5">
            <label htmlFor="location" className="block text-sm font-medium text-warm-700 mb-2">Lokasi</label>
            <input id="location" type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Di mana? (opsional)"
              className="w-full rounded-2xl border border-warm-100 bg-warm-50 px-4 py-3 text-warm-900 placeholder-warm-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:bg-white outline-none transition-all" />
          </div></FadeIn>

          <FadeIn delay={0.25}><div className="rounded-3xl bg-white border border-warm-100 p-6 shadow-xl shadow-warm-900/5">
            <label htmlFor="notes" className="block text-sm font-medium text-warm-700 mb-2">Catatan</label>
            <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Catatan tambahan..."
              className="w-full rounded-2xl border border-warm-100 bg-warm-50 px-4 py-3 text-warm-900 placeholder-warm-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:bg-white outline-none transition-all resize-none" />
          </div></FadeIn>

          <div className="flex items-center justify-end gap-3">
            <Link href={`/spaces/${slug}/wishlist`} className="rounded-xl px-6 py-3 text-sm font-medium text-warm-600 hover:bg-warm-50 transition-colors">Batal</Link>
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-600 disabled:opacity-50">
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Menyimpan...</> : <><Check className="h-4 w-4" />Tambah ke Wishlist</>}
            </button>
          </div>
        </form>
      </div>
    </AuthenticatedLayout>
  )
}
