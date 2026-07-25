'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export type GalleryCollection = {
  id: number
  space_id: number
  title: string
  created_at: string
}

export type GalleryPhoto = {
  id: number
  collection_id: number
  url: string
  caption: string | null
  uploaded_by: string
  created_at: string
}

type UseGalleryReturn = {
  collections: GalleryCollection[]
  photos: GalleryPhoto[]
  loading: boolean
  error: string | null
  fetchCollections: (spaceId: number) => Promise<void>
  createCollection: (spaceId: number, title: string) => Promise<{ error?: string; collection?: GalleryCollection }>
  deleteCollection: (id: number) => Promise<{ error?: string }>
  fetchPhotos: (collectionId: number) => Promise<void>
  uploadPhotos: (collectionId: number, spaceId: number, files: File[], caption?: string) => Promise<{ error?: string; photos?: GalleryPhoto[] }>
  deletePhoto: (id: number) => Promise<{ error?: string }>
}

export function useGallery(): UseGalleryReturn {
  const [collections, setCollections] = useState<GalleryCollection[]>([])
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchCollections = useCallback(async (spaceId: number) => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('gallery_collections')
      .select('*')
      .eq('space_id', spaceId)
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setCollections(data || [])
    }
    setLoading(false)
  }, [supabase])

  const createCollection = useCallback(async (spaceId: number, title: string) => {
    try {
      const { data, error: insertError } = await supabase
        .from('gallery_collections')
        .insert({ space_id: spaceId, title })
        .select()
        .single()

      if (insertError) return { error: insertError.message }

      setCollections((prev) => [data, ...prev])
      return { collection: data }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create collection'
      setError(message)
      return { error: message }
    }
  }, [supabase])

  const deleteCollection = useCallback(async (id: number) => {
    try {
      const { error: deleteError } = await supabase
        .from('gallery_collections')
        .delete()
        .eq('id', id)

      if (deleteError) return { error: deleteError.message }

      setCollections((prev) => prev.filter((c) => c.id !== id))
      return {}
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete collection'
      setError(message)
      return { error: message }
    }
  }, [supabase])

  const fetchPhotos = useCallback(async (collectionId: number) => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('gallery_photos')
      .select('*')
      .eq('collection_id', collectionId)
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setPhotos(data || [])
    }
    setLoading(false)
  }, [supabase])

  const uploadPhotos = useCallback(async (collectionId: number, spaceId: number, files: File[], caption?: string) => {
    try {
      const uploadedPhotos: GalleryPhoto[] = []

      for (const file of files) {
        const fileExt = file.name.split('.').pop() || 'jpg'
        const filePath = `spaces/${spaceId}/gallery/${collectionId}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('public')
          .upload(filePath, file, { contentType: file.type })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          continue
        }

        const { data: urlData } = supabase.storage.from('public').getPublicUrl(filePath)

        const { data: photo, error: insertError } = await supabase
          .from('gallery_photos')
          .insert({
            collection_id: collectionId,
            url: urlData.publicUrl,
            caption: caption || null,
            uploaded_by: (await supabase.auth.getUser()).data.user?.id,
          })
          .select()
          .single()

        if (!insertError && photo) {
          uploadedPhotos.push(photo)
        }
      }

      setPhotos((prev) => [...uploadedPhotos, ...prev])
      return { photos: uploadedPhotos }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      setError(message)
      return { error: message }
    }
  }, [supabase])

  const deletePhoto = useCallback(async (id: number) => {
    try {
      const photo = photos.find((p) => p.id === id)

      if (photo?.url) {
        const path = photo.url.split('/public/')[1]
        if (path) {
          await supabase.storage.from('public').remove([path])
        }
      }

      const { error: deleteError } = await supabase
        .from('gallery_photos')
        .delete()
        .eq('id', id)

      if (deleteError) return { error: deleteError.message }

      setPhotos((prev) => prev.filter((p) => p.id !== id))
      return {}
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete photo'
      setError(message)
      return { error: message }
    }
  }, [photos, supabase])

  return {
    collections,
    photos,
    loading,
    error,
    fetchCollections,
    createCollection,
    deleteCollection,
    fetchPhotos,
    uploadPhotos,
    deletePhoto,
  }
}
