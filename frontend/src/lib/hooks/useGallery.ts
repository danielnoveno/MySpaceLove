'use client'

import { useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

// Schema: media_galleries table
// Columns: id, space_id, user_id, title, file_path, type, collection_key (UUID), collection_index, created_at, updated_at
// Collections are virtual groups via collection_key (UUID)

export type GalleryItem = {
  id: number
  space_id: number
  user_id: string
  title: string | null
  file_path: string
  type: string | null
  collection_key: string | null
  collection_index: number
  created_at: string
  updated_at: string
}

// A virtual collection is a group of items sharing collection_key
export type GalleryCollection = {
  collection_key: string
  title: string | null
  items: GalleryItem[]
  created_at: string
}

type UseGalleryReturn = {
  collections: GalleryCollection[]
  items: GalleryItem[]
  loading: boolean
  error: string | null
  fetchItems: (spaceId: number) => Promise<void>
  createCollection: (spaceId: number, title: string) => Promise<{ error?: string; collection_key?: string }>
  deleteCollection: (collectionKey: string) => Promise<{ error?: string }>
  uploadItems: (collectionKey: string | null, spaceId: number, files: File[], title?: string) => Promise<{ error?: string; items?: GalleryItem[] }>
  deleteItem: (id: number) => Promise<{ error?: string }>
}

export function useGallery(): UseGalleryReturn {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = useMemo(() => createClient(), [])

  // Derive collections from items by grouping on collection_key
  const collections: GalleryCollection[] = useMemo(() => {
    const grouped = new Map<string, GalleryItem[]>()
    for (const item of items) {
      const key = item.collection_key || '__uncategorized__'
      if (!grouped.has(key)) grouped.set(key, [])
      grouped.get(key)!.push(item)
    }
    return Array.from(grouped.entries())
      .filter(([key]) => key !== '__uncategorized__')
      .map(([key, colItems]) => ({
        collection_key: key,
        title: colItems.find((i) => i.title)?.title || null,
        items: colItems.sort((a, b) => a.collection_index - b.collection_index),
        created_at: colItems[0]?.created_at || '',
      }))
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
  }, [items])

  const fetchItems = useCallback(async (spaceId: number) => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('media_galleries')
      .select('*')
      .eq('space_id', spaceId)
      .order('collection_index', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setItems(data || [])
    }
    setLoading(false)
  }, [supabase])

  const createCollection = useCallback(async (spaceId: number, title: string) => {
    try {
      const collectionKey = crypto.randomUUID()

      // Insert a placeholder item so the collection_key exists
      const { error: insertError } = await supabase
        .from('media_galleries')
        .insert({
          space_id: spaceId,
          title,
          file_path: '__placeholder__',
          type: 'collection_header',
          collection_key: collectionKey,
          collection_index: 0,
        })

      if (insertError) return { error: insertError.message }

      return { collection_key: collectionKey }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create collection'
      setError(message)
      return { error: message }
    }
  }, [supabase])

  const deleteCollection = useCallback(async (collectionKey: string) => {
    try {
      // Delete all items in this collection
      const { error: deleteError } = await supabase
        .from('media_galleries')
        .delete()
        .eq('collection_key', collectionKey)

      if (deleteError) return { error: deleteError.message }

      setItems((prev) => prev.filter((i) => i.collection_key !== collectionKey))
      return {}
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete collection'
      setError(message)
      return { error: message }
    }
  }, [supabase])

  const uploadItems = useCallback(async (collectionKey: string | null, spaceId: number, files: File[], title?: string) => {
    try {
      const uploadedItems: GalleryItem[] = []
      const key = collectionKey || crypto.randomUUID()

      // Get current max index for this collection
      const maxIndex = items
        .filter((i) => i.collection_key === key)
        .reduce((max, i) => Math.max(max, i.collection_index), -1)

      for (let idx = 0; idx < files.length; idx++) {
        const file = files[idx]
        const fileExt = file.name.split('.').pop() || 'jpg'
        const filePath = `spaces/${spaceId}/galleries/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('galleries')
          .upload(filePath, file, { contentType: file.type })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          continue
        }

        const { data: item, error: insertError } = await supabase
          .from('media_galleries')
          .insert({
            space_id: spaceId,
            title: idx === 0 ? (title || null) : null,
            file_path: filePath,
            type: file.type,
            collection_key: key,
            collection_index: maxIndex + idx + 1,
          })
          .select()
          .single()

        if (!insertError && item) {
          uploadedItems.push(item)
        }
      }

      setItems((prev) => [...prev, ...uploadedItems])
      return { items: uploadedItems }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      setError(message)
      return { error: message }
    }
  }, [supabase, items])

  const deleteItem = useCallback(async (id: number) => {
    try {
      const item = items.find((i) => i.id === id)

      if (item?.file_path && item.file_path !== '__placeholder__') {
        await supabase.storage.from('galleries').remove([item.file_path])
      }

      const { error: deleteError } = await supabase
        .from('media_galleries')
        .delete()
        .eq('id', id)

      if (deleteError) return { error: deleteError.message }

      setItems((prev) => prev.filter((i) => i.id !== id))
      return {}
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete item'
      setError(message)
      return { error: message }
    }
  }, [items, supabase])

  return {
    collections,
    items,
    loading,
    error,
    fetchItems,
    createCollection,
    deleteCollection,
    uploadItems,
    deleteItem,
  }
}
