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
  Heart,
  Trash2,
  Edit3,
  Calendar,
  Loader2,
  Image as ImageIcon,
  Filter,
  MapPin,
  Star,
  Gift,
  Plane,
  Award,
  X,
} from 'lucide-react'

type Memory = {
  id: string
  space_id: string
  user_id: string
  title: string
  description: string | null
  date: string
  category: string
  image_url: string | null
  notes: string | null
  created_at: string
}

const CATEGORY_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof Heart }> = {
  'first-date': { label: 'Kencan Pertama', color: 'text-brand-600', bg: 'bg-brand-50', icon: Heart },
  anniversary: { label: 'Anniversary', color: 'text-coral-600', bg: 'bg-coral-50', icon: Star },
  trip: { label: 'Perjalanan', color: 'text-blue-600', bg: 'bg-blue-50', icon: Plane },
  milestone: { label: 'Pencapaian', color: 'text-amber-600', bg: 'bg-amber-50', icon: Award },
  gift: { label: 'Hadiah', color: 'text-purple-600', bg: 'bg-purple-50', icon: Gift },
  adventure: { label: 'Petualangan', color: 'text-green-600', bg: 'bg-green-50', icon: MapPin },
  other: { label: 'Lainnya', color: 'text-warm-600', bg: 'bg-warm-50', icon: Heart },
}

export default function MemoryLanePage() {
  const params = useParams()
  const slug = params.slug as string
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }
    if (user && slug) {
      fetchMemories()
    }
  }, [user, authLoading, slug, router])

  const fetchMemories = async () => {
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
      .from('memory_lane')
      .select('*')
      .eq('space_id', space.id)
      .order('date', { ascending: false })

    setMemories(data || [])
    setLoading(false)
  }

  const deleteMemory = useCallback(async (memory: Memory) => {
    if (!confirm(`Hapus "${memory.title}"?`)) return

    setDeleting(memory.id)

    if (memory.image_url) {
      const path = memory.image_url.split('/').pop()
      if (path) {
        await supabase.storage.from('memory-lane').remove([path])
      }
    }

    await supabase.from('memory_lane').delete().eq('id', memory.id)
    setMemories((prev) => prev.filter((m) => m.id !== memory.id))
    setDeleting(null)
  }, [supabase])

  const filteredMemories = selectedCategory
    ? memories.filter((m) => m.category === selectedCategory)
    : memories

  const categories = Object.keys(CATEGORY_CONFIG)

  const getCategoryConfig = (category: string) =>
    CATEGORY_CONFIG[category] || CATEGORY_CONFIG.other

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
                <Heart className="h-6 w-6 text-brand-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-warm-900">Memory Lane</h1>
                <p className="text-warm-500">Koleksi momen-momen berharga bersama</p>
              </div>
            </div>
            <Link
              href={`/spaces/${slug}/memory-lane/create`}
              className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-600 hover:shadow-md hover:shadow-brand-500/25 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              Tambah Memori
            </Link>
          </div>
        </FadeIn>
      }
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Category Filter */}
        <FadeIn delay={0.1}>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Filter className="h-4 w-4 text-warm-400 shrink-0" />
            <button
              onClick={() => setSelectedCategory(null)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                selectedCategory === null
                  ? 'bg-brand-500 text-white'
                  : 'bg-white text-warm-600 hover:bg-brand-50 border border-warm-100'
              }`}
            >
              Semua ({memories.length})
            </button>
            {categories.map((cat) => {
              const config = getCategoryConfig(cat)
              const count = memories.filter((m) => m.category === cat).length
              if (count === 0) return null
              const Icon = config.icon
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                  className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-brand-500 text-white'
                      : `${config.bg} ${config.color} hover:opacity-80`
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {config.label} ({count})
                </button>
              )
            })}
          </div>
        </FadeIn>

        {/* Empty State */}
        {filteredMemories.length === 0 ? (
          <FadeIn delay={0.15}>
            <div className="text-center py-20">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-brand-50 text-brand-400 mb-6">
                <Heart className="h-12 w-12" />
              </div>
              <h2 className="text-2xl font-semibold text-warm-900 mb-2">
                {selectedCategory ? 'Tidak ada memori dalam kategori ini' : 'Belum ada memori'}
              </h2>
              <p className="text-warm-500 mb-6">
                Mulai abadikan momen-momen berharga bersama.
              </p>
              <Link
                href={`/spaces/${slug}/memory-lane/create`}
                className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 font-semibold text-white shadow-sm transition-all hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-500/25 active:scale-[0.98]"
              >
                <Plus className="h-5 w-5" />
                Tambah Memori Pertama
              </Link>
            </div>
          </FadeIn>
        ) : (
          <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMemories.map((memory) => {
              const catConfig = getCategoryConfig(memory.category)
              const CatIcon = catConfig.icon

              return (
                <StaggerItem key={memory.id}>
                  <div className="group relative rounded-3xl bg-white border border-warm-100 overflow-hidden transition-all hover:shadow-xl hover:shadow-warm-900/5 hover:-translate-y-1">
                    {/* Image */}
                    <div className="relative h-48 bg-gradient-to-br from-brand-50 to-coral-50">
                      {memory.image_url ? (
                        <img
                          src={memory.image_url}
                          alt={memory.title}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => setPreviewImage(memory.image_url)}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <ImageIcon className="h-16 w-16 text-brand-200" />
                        </div>
                      )}

                      {/* Category Badge */}
                      <div className={`absolute top-3 left-3 inline-flex items-center gap-1 ${catConfig.bg} ${catConfig.color} text-xs font-semibold px-2.5 py-1 rounded-full`}>
                        <CatIcon className="h-3 w-3" />
                        {catConfig.label}
                      </div>

                      {/* Actions */}
                      <div className="absolute top-3 right-3 flex gap-1.5">
                        <Link
                          href={`/spaces/${slug}/memory-lane/${memory.id}/edit`}
                          className="bg-brand-500/90 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-600"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => deleteMemory(memory)}
                          disabled={deleting === memory.id}
                          className="bg-coral-500/90 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-coral-600"
                        >
                          {deleting === memory.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-warm-900 group-hover:text-brand-600 transition-colors">
                        {memory.title}
                      </h3>

                      {memory.description && (
                        <p className="mt-1 text-sm text-warm-500 line-clamp-2">
                          {memory.description}
                        </p>
                      )}

                      {memory.notes && (
                        <p className="mt-2 text-xs text-warm-400 line-clamp-2 italic">
                          {memory.notes}
                        </p>
                      )}

                      <div className="mt-3 flex items-center gap-1 text-xs text-warm-400">
                        <Calendar className="h-3 w-3" />
                        {new Date(memory.date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              )
            })}
          </StaggerContainer>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-10"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={previewImage}
            alt="Preview memori"
            className="max-h-[90vh] max-w-[90vw] rounded-3xl object-contain shadow-2xl"
          />
        </div>
      )}
    </AuthenticatedLayout>
  )
}
