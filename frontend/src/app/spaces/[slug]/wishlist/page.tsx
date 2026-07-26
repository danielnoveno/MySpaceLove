'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/motion'
import {
  Plus,
  Gift,
  Trash2,
  Edit3,
  Check,
  Circle,
  MapPin,
  Loader2,
  FileText,
  Star,
} from 'lucide-react'

type WishlistItem = {
  id: string
  space_id: string
  title: string
  description: string | null
  location: string | null
  notes: string | null
  status: 'pending' | 'done'
  created_at: string
}

export default function WishlistPage() {
  const params = useParams()
  const slug = params.slug as string
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)

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
          .from('wishlist_items')
          .select('*')
          .eq('space_id', space.id)
          .order('created_at', { ascending: false })

        setItems(data || [])
        setLoading(false)
      })()
    }
  }, [user, authLoading, router, slug, supabase])

  const toggleStatus = useCallback(async (item: WishlistItem) => {
    setToggling(item.id)
    const newStatus = item.status === 'done' ? 'pending' : 'done'

    const { error } = await supabase
      .from('wishlist_items')
      .update({ status: newStatus })
      .eq('id', item.id)

    if (!error) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: newStatus } : i))
      )
    }
    setToggling(null)
  }, [supabase])

  const deleteItem = useCallback(async (id: string) => {
    if (!confirm('Hapus item wishlist ini?')) return

    setDeleting(id)
    await supabase.from('wishlist_items').delete().eq('id', id)
    setItems((prev) => prev.filter((i) => i.id !== id))
    setDeleting(null)
  }, [supabase])

  const pendingItems = items.filter((i) => i.status === 'pending')
  const doneItems = items.filter((i) => i.status === 'done')

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
        <FadeIn>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100">
                <Star className="h-6 w-6 text-brand-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-warm-900">Wishlist</h1>
                <p className="text-warm-500">Hal-hal yang ingin kita lakukan dan dapatkan bersama</p>
              </div>
            </div>
            <Link
              href={`/spaces/${slug}/wishlist/create`}
              className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-600 hover:shadow-md hover:shadow-brand-500/25 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              Tambah Item
            </Link>
          </div>
        </FadeIn>
      }
    >
      {items.length === 0 ? (
        <FadeIn delay={0.1}>
          <div className="text-center py-20">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-brand-50 text-brand-400 mb-6">
              <Gift className="h-12 w-12" />
            </div>
            <h2 className="text-2xl font-semibold text-warm-900 mb-2">Wishlist Anda kosong</h2>
            <p className="text-warm-500 mb-6">
              Tambahkan hal-hal yang ingin Anda lakukan atau dapatkan bersama.
            </p>
            <Link
              href={`/spaces/${slug}/wishlist/create`}
              className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 font-semibold text-white transition-all hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-500/25 active:scale-[0.98]"
            >
              <Plus className="h-5 w-5" />
              Tambah Item Pertama
            </Link>
          </div>
        </FadeIn>
      ) : (
        <div className="space-y-8">
          {/* Pending Items */}
          {pendingItems.length > 0 && (
            <FadeIn delay={0.1}>
              <div>
                <h2 className="text-sm font-semibold text-warm-400 uppercase tracking-wide mb-3">
                  Belum Selesai ({pendingItems.length})
                </h2>
                <StaggerContainer className="space-y-3">
                  {pendingItems.map((item) => (
                    <StaggerItem key={item.id}>
                      <div className="group rounded-3xl bg-white border border-warm-100 p-5 transition-all hover:shadow-lg hover:shadow-warm-900/5">
                        <div className="flex items-start gap-4">
                          <button
                            onClick={() => toggleStatus(item)}
                            disabled={toggling === item.id}
                            className="mt-1 shrink-0"
                          >
                            {toggling === item.id ? (
                              <Loader2 className="h-5 w-5 text-warm-300 animate-spin" />
                            ) : (
                              <Circle className="h-5 w-5 text-warm-300 hover:text-brand-500 transition-colors" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-warm-900">{item.title}</h3>
                            {item.description && (
                              <p className="mt-1 text-sm text-warm-500 line-clamp-2">{item.description}</p>
                            )}
                            {item.location && (
                              <div className="mt-2 inline-flex items-center gap-1 text-xs text-warm-500 bg-warm-50 rounded-full px-2.5 py-1">
                                <MapPin className="h-3 w-3" />
                                {item.location}
                              </div>
                            )}
                            {item.notes && (
                              <div className="mt-2 inline-flex items-center gap-1 text-xs text-warm-500 bg-warm-50 rounded-full px-2.5 py-1 ml-1">
                                <FileText className="h-3 w-3" />
                                Ada catatan
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <Link
                              href={`/spaces/${slug}/wishlist/${item.id}/edit`}
                              className="p-2 text-warm-400 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => deleteItem(item.id)}
                              disabled={deleting === item.id}
                              className="p-2 text-warm-400 hover:text-coral-600 hover:bg-coral-50 rounded-full transition-colors"
                            >
                              {deleting === item.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </div>
            </FadeIn>
          )}

          {/* Done Items */}
          {doneItems.length > 0 && (
            <FadeIn delay={0.2}>
              <div>
                <h2 className="text-sm font-semibold text-warm-400 uppercase tracking-wide mb-3">
                  Selesai ({doneItems.length})
                </h2>
                <StaggerContainer className="space-y-3">
                  {doneItems.map((item) => (
                    <StaggerItem key={item.id}>
                      <div className="group rounded-3xl bg-warm-50 border border-warm-100 p-5 transition-all hover:shadow-md opacity-70">
                        <div className="flex items-start gap-4">
                          <button
                            onClick={() => toggleStatus(item)}
                            disabled={toggling === item.id}
                            className="mt-1 shrink-0"
                          >
                            {toggling === item.id ? (
                              <Loader2 className="h-5 w-5 text-brand-300 animate-spin" />
                            ) : (
                              <Check className="h-5 w-5 text-brand-500" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-warm-900 line-through decoration-warm-400">
                              {item.title}
                            </h3>
                            {item.description && (
                              <p className="mt-1 text-sm text-warm-500 line-clamp-2">{item.description}</p>
                            )}
                            {item.location && (
                              <div className="mt-2 inline-flex items-center gap-1 text-xs text-warm-400 bg-warm-100 rounded-full px-2.5 py-1">
                                <MapPin className="h-3 w-3" />
                                {item.location}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <Link
                              href={`/spaces/${slug}/wishlist/${item.id}/edit`}
                              className="p-2 text-warm-400 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => deleteItem(item.id)}
                              disabled={deleting === item.id}
                              className="p-2 text-warm-400 hover:text-coral-600 hover:bg-coral-50 rounded-full transition-colors"
                            >
                              {deleting === item.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </div>
            </FadeIn>
          )}
        </div>
      )}
    </AuthenticatedLayout>
  )
}
