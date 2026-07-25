'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import {
  Plus,
  Image as ImageIcon,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Upload,
  Calendar,
  Loader2,
  FolderOpen,
} from 'lucide-react'

type GalleryPhoto = {
  id: string
  collection_id: string
  url: string
  caption: string | null
  created_at: string
}

type GalleryCollection = {
  id: string
  space_id: string
  title: string
  created_at: string
  photos: GalleryPhoto[]
}

export default function GalleryPage() {
  const params = useParams()
  const slug = params.slug as string
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [collections, setCollections] = useState<GalleryCollection[]>([])
  const [loading, setLoading] = useState(true)

  // Modal state
  const [selectedCollection, setSelectedCollection] = useState<GalleryCollection | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

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

        const { data: collectionsData } = await supabase
          .from('gallery_collections')
          .select('*')
          .eq('space_id', space.id)
          .order('created_at', { ascending: false })

        if (!collectionsData) {
          setCollections([])
          setLoading(false)
          return
        }

        const collectionsWithPhotos = await Promise.all(
          collectionsData.map(async (col) => {
            const { data: photos } = await supabase
              .from('gallery_photos')
              .select('*')
              .eq('collection_id', col.id)
              .order('created_at', { ascending: true })

            return { ...col, photos: photos || [] }
          })
        )

        setCollections(collectionsWithPhotos)
        setLoading(false)
      })()
    }
  }, [user, authLoading, router, slug, supabase])

  const deleteCollection = useCallback(async (collectionId: string) => {
    if (!confirm('Delete this collection and all its photos?')) return

    setDeleting(collectionId)

    const { data: photos } = await supabase
      .from('gallery_photos')
      .select('url')
      .eq('collection_id', collectionId)

    if (photos) {
      for (const photo of photos) {
        const path = photo.url.split('/').pop()
        if (path) {
          await supabase.storage.from('gallery').remove([path])
        }
      }
    }

    await supabase.from('gallery_photos').delete().eq('collection_id', collectionId)
    await supabase.from('gallery_collections').delete().eq('id', collectionId)

    setCollections((prev) => prev.filter((c) => c.id !== collectionId))
    if (selectedCollection?.id === collectionId) {
      setSelectedCollection(null)
    }
    setDeleting(null)
  }, [supabase, selectedCollection])

  const deletePhoto = useCallback(async (photo: GalleryPhoto) => {
    if (!confirm('Delete this photo?')) return

    const path = photo.url.split('/').pop()
    if (path) {
      await supabase.storage.from('gallery').remove([path])
    }

    await supabase.from('gallery_photos').delete().eq('id', photo.id)

    setCollections((prev) =>
      prev.map((col) => {
        if (col.id === photo.collection_id) {
          return { ...col, photos: col.photos.filter((p) => p.id !== photo.id) }
        }
        return col
      })
    )

    if (selectedCollection) {
      setSelectedCollection((prev) => {
        if (!prev) return null
        return {
          ...prev,
          photos: prev.photos.filter((p) => p.id !== photo.id),
        }
      })
    }
  }, [supabase, selectedCollection])

  const lightboxPhotos = selectedCollection?.photos || []

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)

  const navigateLightbox = useCallback(
    (dir: number) => {
      if (lightboxIndex === null) return
      const next = lightboxIndex + dir
      if (next < 0 || next >= lightboxPhotos.length) return
      setLightboxIndex(next)
    },
    [lightboxIndex, lightboxPhotos.length]
  )

  useEffect(() => {
    if (lightboxIndex === null) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') navigateLightbox(-1)
      if (e.key === 'ArrowRight') navigateLightbox(1)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxIndex, navigateLightbox])

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
            <h1 className="text-2xl font-bold text-gray-900">Photo Gallery</h1>
            <p className="text-gray-600">Your precious moments together</p>
          </div>
          <Link
            href={`/spaces/${slug}/gallery/create`}
            className="inline-flex items-center gap-2 rounded-full bg-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-600"
          >
            <Plus className="h-4 w-4" />
            New Collection
          </Link>
        </div>
      }
    >
      {collections.length === 0 ? (
        <div className="text-center py-20">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-pink-100 text-pink-500 mb-6">
            <ImageIcon className="h-12 w-12" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No collections yet</h2>
          <p className="text-gray-600 mb-6">
            Create your first photo collection to start preserving memories.
          </p>
          <Link
            href={`/spaces/${slug}/gallery/create`}
            className="inline-flex items-center gap-2 rounded-full bg-pink-500 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-pink-600"
          >
            <Upload className="h-5 w-5" />
            Upload Photos
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="group relative rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/70 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer"
              onClick={() => setSelectedCollection(collection)}
            >
              {/* Stacked card preview */}
              <div className="relative h-56 bg-gradient-to-br from-pink-100 to-purple-100">
                {collection.photos.length > 0 ? (
                  <>
                    {/* Background stacked cards */}
                    {collection.photos.length > 2 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="absolute w-[85%] h-[85%] bg-white/40 rounded-2xl rotate-3 translate-y-2" />
                        <div className="absolute w-[85%] h-[85%] bg-white/30 rounded-2xl -rotate-2 translate-y-1" />
                      </div>
                    )}
                    {/* Top image */}
                    <img
                      src={collection.photos[0].url}
                      alt={collection.photos[0].caption || collection.title}
                      className="absolute inset-0 w-full h-full object-cover rounded-t-3xl"
                    />
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FolderOpen className="h-16 w-16 text-pink-300" />
                  </div>
                )}

                {/* Photo count badge */}
                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                  <ImageIcon className="h-3 w-3" />
                  {collection.photos.length}
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteCollection(collection.id)
                  }}
                  disabled={deleting === collection.id}
                  className="absolute top-3 left-3 bg-red-500/80 backdrop-blur-sm text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  {deleting === collection.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
                  {collection.title}
                </h3>
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  {new Date(collection.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Collection Modal */}
      {selectedCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedCollection.title}</h2>
                <p className="text-sm text-gray-500">
                  {selectedCollection.photos.length} photo{selectedCollection.photos.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/spaces/${slug}/gallery/create`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-pink-100 px-3 py-1.5 text-sm font-medium text-pink-700 hover:bg-pink-200 transition-colors"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Add Photos
                </Link>
                <button
                  onClick={() => setSelectedCollection(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Photo Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectedCollection.photos.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No photos in this collection yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {selectedCollection.photos.map((photo, idx) => (
                    <div
                      key={photo.id}
                      className="relative group/photo rounded-2xl overflow-hidden aspect-square cursor-pointer"
                      onClick={() => openLightbox(idx)}
                    >
                      <img
                        src={photo.url}
                        alt={photo.caption || `Photo ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deletePhoto(photo)
                        }}
                        className="absolute top-2 right-2 bg-red-500/80 backdrop-blur-sm text-white p-1.5 rounded-full opacity-0 group-hover/photo:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && lightboxPhotos[lightboxIndex] && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-10"
          >
            <X className="h-6 w-6" />
          </button>

          {lightboxIndex > 0 && (
            <button
              onClick={() => navigateLightbox(-1)}
              className="absolute left-4 text-white/80 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors z-10"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
          )}

          <div className="max-w-[90vw] max-h-[85vh] flex items-center justify-center">
            <img
              src={lightboxPhotos[lightboxIndex].url}
              alt={lightboxPhotos[lightboxIndex].caption || `Photo ${lightboxIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
          </div>

          {lightboxIndex < lightboxPhotos.length - 1 && (
            <button
              onClick={() => navigateLightbox(1)}
              className="absolute right-4 text-white/80 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors z-10"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          )}

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full">
            {lightboxIndex + 1} / {lightboxPhotos.length}
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  )
}
