'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import {
  Plus,
  Heart,
  Trash2,
  Edit,
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
  'first-date': { label: 'First Date', color: 'text-pink-600', bg: 'bg-pink-100', icon: Heart },
  anniversary: { label: 'Anniversary', color: 'text-red-600', bg: 'bg-red-100', icon: Star },
  trip: { label: 'Trip', color: 'text-blue-600', bg: 'bg-blue-100', icon: Plane },
  milestone: { label: 'Milestone', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: Award },
  gift: { label: 'Gift', color: 'text-purple-600', bg: 'bg-purple-100', icon: Gift },
  adventure: { label: 'Adventure', color: 'text-green-600', bg: 'bg-green-100', icon: MapPin },
  other: { label: 'Other', color: 'text-gray-600', bg: 'bg-gray-100', icon: Heart },
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
    if (!confirm(`Delete "${memory.title}"?`)) return

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
            <p className="text-xs uppercase tracking-[0.4em] text-pink-400">Memory Lane</p>
            <h1 className="text-2xl font-bold text-gray-900">Your Memories</h1>
            <p className="text-gray-600 text-sm">A curated collection of meaningful moments</p>
          </div>
          <Link
            href={`/spaces/${slug}/memory-lane/create`}
            className="inline-flex items-center gap-2 rounded-full bg-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-600"
          >
            <Plus className="h-4 w-4" />
            New Memory
          </Link>
        </div>
      }
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Filter className="h-4 w-4 text-gray-400 shrink-0" />
          <button
            onClick={() => setSelectedCategory(null)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              selectedCategory === null
                ? 'bg-pink-500 text-white'
                : 'bg-white/80 text-gray-600 hover:bg-pink-50 border border-pink-100'
            }`}
          >
            All ({memories.length})
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
                    ? 'bg-pink-500 text-white'
                    : `bg-white/80 ${config.color} hover:bg-pink-50 border border-pink-100`
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {config.label} ({count})
              </button>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredMemories.length === 0 ? (
          <div className="text-center py-20">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-pink-100 text-pink-500 mb-6">
              <Heart className="h-12 w-12" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {selectedCategory ? 'No memories in this category' : 'No memories yet'}
            </h2>
            <p className="text-gray-600 mb-6">
              Start capturing your meaningful moments together.
            </p>
            <Link
              href={`/spaces/${slug}/memory-lane/create`}
              className="inline-flex items-center gap-2 rounded-full bg-pink-500 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-pink-600"
            >
              <Plus className="h-5 w-5" />
              Add First Memory
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMemories.map((memory) => {
              const catConfig = getCategoryConfig(memory.category)
              const CatIcon = catConfig.icon

              return (
                <div
                  key={memory.id}
                  className="group relative rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/70 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-pink-100 to-purple-100">
                    {memory.image_url ? (
                      <img
                        src={memory.image_url}
                        alt={memory.title}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setPreviewImage(memory.image_url)}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <ImageIcon className="h-16 w-16 text-pink-200" />
                      </div>
                    )}

                    {/* Category Badge */}
                    <div className={`absolute top-3 left-3 inline-flex items-center gap-1 ${catConfig.bg} ${catConfig.color} text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm`}>
                      <CatIcon className="h-3 w-3" />
                      {catConfig.label}
                    </div>

                    {/* Actions */}
                    <div className="absolute top-3 right-3 flex gap-1.5">
                      <Link
                        href={`/spaces/${slug}/memory-lane/${memory.id}/edit`}
                        className="bg-blue-500/80 backdrop-blur-sm text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => deleteMemory(memory)}
                        disabled={deleting === memory.id}
                        className="bg-red-500/80 backdrop-blur-sm text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
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
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
                      {memory.title}
                    </h3>

                    {memory.description && (
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                        {memory.description}
                      </p>
                    )}

                    {memory.notes && (
                      <p className="mt-2 text-xs text-gray-500 line-clamp-2 italic">
                        {memory.notes}
                      </p>
                    )}

                    <div className="mt-3 flex items-center gap-1 text-xs text-gray-400">
                      <Calendar className="h-3 w-3" />
                      {new Date(memory.date).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
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
            alt="Memory preview"
            className="max-h-[90vh] max-w-[90vw] rounded-3xl object-contain shadow-2xl"
          />
        </div>
      )}
    </AuthenticatedLayout>
  )
}
