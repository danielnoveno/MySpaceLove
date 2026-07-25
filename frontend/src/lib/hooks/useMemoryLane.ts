'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export type MemoryLane = {
  id: number
  space_id: number
  title: string
  description: string | null
  date: string
  category: string
  image_url: string | null
  created_by: string
  created_at: string
}

type UseMemoryLaneReturn = {
  memories: MemoryLane[]
  loading: boolean
  error: string | null
  fetchMemories: (spaceId: number, category?: string) => Promise<void>
  createMemory: (data: {
    space_id: number
    title: string
    description?: string
    date: string
    category: string
    image?: File
  }) => Promise<{ error?: string; memory?: MemoryLane }>
  updateMemory: (id: number, data: {
    title?: string
    description?: string
    date?: string
    category?: string
    image?: File
  }) => Promise<{ error?: string }>
  deleteMemory: (id: number) => Promise<{ error?: string }>
  uploadMemoryImage: (file: File, spaceId: number) => Promise<{ error?: string; url?: string }>
}

export function useMemoryLane(): UseMemoryLaneReturn {
  const [memories, setMemories] = useState<MemoryLane[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const uploadMemoryImage = useCallback(async (file: File, spaceId: number) => {
    try {
      const fileExt = file.name.split('.').pop() || 'jpg'
      const filePath = `spaces/${spaceId}/memories/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file, { contentType: file.type })

      if (uploadError) return { error: uploadError.message }

      const { data } = supabase.storage.from('public').getPublicUrl(filePath)
      return { url: data.publicUrl }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Image upload failed'
      setError(message)
      return { error: message }
    }
  }, [supabase])

  const fetchMemories = useCallback(async (spaceId: number, category?: string) => {
    setLoading(true)
    setError(null)

    let query = supabase
      .from('memory_lane')
      .select('*')
      .eq('space_id', spaceId)

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error: fetchError } = await query.order('date', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setMemories(data || [])
    }
    setLoading(false)
  }, [supabase])

  const createMemory = useCallback(async (data: {
    space_id: number
    title: string
    description?: string
    date: string
    category: string
    image?: File
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { error: 'Not authenticated' }

      let imageUrl: string | null = null
      if (data.image) {
        const uploadResult = await uploadMemoryImage(data.image, data.space_id)
        if (uploadResult.error) return { error: uploadResult.error }
        imageUrl = uploadResult.url || null
      }

      const { data: memory, error: insertError } = await supabase
        .from('memory_lane')
        .insert({
          space_id: data.space_id,
          title: data.title,
          description: data.description || null,
          date: data.date,
          category: data.category,
          image_url: imageUrl,
          created_by: user.id,
        })
        .select()
        .single()

      if (insertError) return { error: insertError.message }

      setMemories((prev) => [memory, ...prev])
      return { memory }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create memory'
      setError(message)
      return { error: message }
    }
  }, [supabase, uploadMemoryImage])

  const updateMemory = useCallback(async (id: number, data: {
    title?: string
    description?: string
    date?: string
    category?: string
    image?: File
  }) => {
    try {
      const existing = memories.find((m) => m.id === id)

      let imageUrl = existing?.image_url || null
      if (data.image && existing) {
        if (imageUrl) {
          const oldPath = imageUrl.split('/public/')[1]
          if (oldPath) {
            await supabase.storage.from('public').remove([oldPath])
          }
        }

        const uploadResult = await uploadMemoryImage(data.image, existing.space_id)
        if (uploadResult.error) return { error: uploadResult.error }
        imageUrl = uploadResult.url || null
      }

      const updatePayload: Record<string, unknown> = {}
      if (data.title !== undefined) updatePayload.title = data.title
      if (data.description !== undefined) updatePayload.description = data.description
      if (data.date !== undefined) updatePayload.date = data.date
      if (data.category !== undefined) updatePayload.category = data.category
      if (imageUrl !== existing?.image_url) updatePayload.image_url = imageUrl

      if (Object.keys(updatePayload).length === 0) return {}

      const { error: updateError } = await supabase
        .from('memory_lane')
        .update(updatePayload)
        .eq('id', id)

      if (updateError) return { error: updateError.message }

      setMemories((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, ...updatePayload } as MemoryLane : m
        )
      )
      return {}
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update memory'
      setError(message)
      return { error: message }
    }
  }, [memories, supabase, uploadMemoryImage])

  const deleteMemory = useCallback(async (id: number) => {
    try {
      const memory = memories.find((m) => m.id === id)

      if (memory?.image_url) {
        const path = memory.image_url.split('/public/')[1]
        if (path) {
          await supabase.storage.from('public').remove([path])
        }
      }

      const { error: deleteError } = await supabase
        .from('memory_lane')
        .delete()
        .eq('id', id)

      if (deleteError) return { error: deleteError.message }

      setMemories((prev) => prev.filter((m) => m.id !== id))
      return {}
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete memory'
      setError(message)
      return { error: message }
    }
  }, [memories, supabase])

  return {
    memories,
    loading,
    error,
    fetchMemories,
    createMemory,
    updateMemory,
    deleteMemory,
    uploadMemoryImage,
  }
}
