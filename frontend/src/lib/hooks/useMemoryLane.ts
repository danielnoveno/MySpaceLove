'use client'

import { useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

// Schema: memory_lane_configs table (one row per space)
// Columns: id, space_id (UNIQUE), active_levels, level_one_image, level_two_image, level_three_image,
//          level_one_title, level_one_body, level_two_title, level_two_body, level_three_title, level_three_body,
//          pin, content_set, custom_rewards, flipbook_pages, flipbook_cover_image, flipbook_cover_title,
//          created_at, updated_at

export type MemoryLaneLevel = {
  image: string | null
  title: string | null
  body: string | null
}

export type MemoryLaneConfig = {
  id: number
  space_id: number
  active_levels: number
  level_one: MemoryLaneLevel
  level_two: MemoryLaneLevel
  level_three: MemoryLaneLevel
  pin: string | null
  content_set: boolean
  custom_rewards: unknown
  flipbook_pages: unknown
  flipbook_cover_image: string | null
  flipbook_cover_title: string | null
  created_at: string
  updated_at: string
}

type UseMemoryLaneReturn = {
  config: MemoryLaneConfig | null
  loading: boolean
  error: string | null
  fetchConfig: (spaceId: number) => Promise<void>
  upsertConfig: (spaceId: number, data: Partial<{
    active_levels: number
    level_one_image: string | null
    level_two_image: string | null
    level_three_image: string | null
    level_one_title: string | null
    level_one_body: string | null
    level_two_title: string | null
    level_two_body: string | null
    level_three_title: string | null
    level_three_body: string | null
    pin: string | null
    content_set: boolean
    custom_rewards: unknown
    flipbook_pages: unknown
    flipbook_cover_image: string | null
    flipbook_cover_title: string | null
  }>) => Promise<{ error?: string }>
  uploadLevelImage: (file: File, spaceId: number, level: 1 | 2 | 3) => Promise<{ error?: string; url?: string }>
}

function rowToConfig(row: Record<string, unknown>): MemoryLaneConfig {
  return {
    id: row.id as number,
    space_id: row.space_id as number,
    active_levels: (row.active_levels as number) || 3,
    level_one: {
      image: (row.level_one_image as string) || null,
      title: (row.level_one_title as string) || null,
      body: (row.level_one_body as string) || null,
    },
    level_two: {
      image: (row.level_two_image as string) || null,
      title: (row.level_two_title as string) || null,
      body: (row.level_two_body as string) || null,
    },
    level_three: {
      image: (row.level_three_image as string) || null,
      title: (row.level_three_title as string) || null,
      body: (row.level_three_body as string) || null,
    },
    pin: (row.pin as string) || null,
    content_set: (row.content_set as boolean) || false,
    custom_rewards: row.custom_rewards || null,
    flipbook_pages: row.flipbook_pages || null,
    flipbook_cover_image: (row.flipbook_cover_image as string) || null,
    flipbook_cover_title: (row.flipbook_cover_title as string) || null,
    created_at: (row.created_at as string) || '',
    updated_at: (row.updated_at as string) || '',
  }
}

export function useMemoryLane(): UseMemoryLaneReturn {
  const [config, setConfig] = useState<MemoryLaneConfig | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = useMemo(() => createClient(), [])

  const fetchConfig = useCallback(async (spaceId: number) => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('memory_lane_configs')
      .select('*')
      .eq('space_id', spaceId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      setError(fetchError.message)
    } else if (data) {
      setConfig(rowToConfig(data))
    } else {
      // Create default config
      const { data: newConfig, error: createError } = await supabase
        .from('memory_lane_configs')
        .insert({
          space_id: spaceId,
          active_levels: 3,
          content_set: false,
        })
        .select()
        .single()

      if (createError) {
        setError(createError.message)
      } else if (newConfig) {
        setConfig(rowToConfig(newConfig))
      }
    }
    setLoading(false)
  }, [supabase])

  const uploadLevelImage = useCallback(async (file: File, spaceId: number, level: 1 | 2 | 3) => {
    try {
      const fileExt = file.name.split('.').pop() || 'jpg'
      const filePath = `spaces/${spaceId}/memory-lane/level${level}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('memory-lane')
        .upload(filePath, file, { contentType: file.type })

      if (uploadError) return { error: uploadError.message }

      const { data } = supabase.storage.from('memory-lane').getPublicUrl(filePath)
      return { url: data.publicUrl }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Image upload failed'
      setError(message)
      return { error: message }
    }
  }, [supabase])

  const upsertConfig = useCallback(async (spaceId: number, data: Partial<{
    active_levels: number
    level_one_image: string | null
    level_two_image: string | null
    level_three_image: string | null
    level_one_title: string | null
    level_one_body: string | null
    level_two_title: string | null
    level_two_body: string | null
    level_three_title: string | null
    level_three_body: string | null
    pin: string | null
    content_set: boolean
    custom_rewards: unknown
    flipbook_pages: unknown
    flipbook_cover_image: string | null
    flipbook_cover_title: string | null
  }>) => {
    try {
      const { error: upsertError } = await supabase
        .from('memory_lane_configs')
        .upsert({
          space_id: spaceId,
          ...data,
        }, { onConflict: 'space_id' })

      if (upsertError) return { error: upsertError.message }

      // Re-fetch to get updated config
      const { data: updated } = await supabase
        .from('memory_lane_configs')
        .select('*')
        .eq('space_id', spaceId)
        .single()

      if (updated) setConfig(rowToConfig(updated))
      return {}
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update memory lane'
      setError(message)
      return { error: message }
    }
  }, [supabase])

  return {
    config,
    loading,
    error,
    fetchConfig,
    upsertConfig,
    uploadLevelImage,
  }
}
