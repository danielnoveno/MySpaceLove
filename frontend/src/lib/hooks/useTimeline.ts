'use client'

import { useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

// Schema: love_timelines table
// Columns: id, uuid, space_id, title, description, date, media_path, media_paths (JSONB), thumbnail_path, created_at, updated_at

export type TimelineItem = {
  id: number
  uuid: string
  space_id: number
  title: string
  description: string | null
  date: string
  media_path: string | null
  media_paths: string[] | null
  thumbnail_path: string | null
  created_at: string
  updated_at: string
}

type UseTimelineReturn = {
  timelines: TimelineItem[]
  loading: boolean
  error: string | null
  fetchTimelines: (spaceId: number) => Promise<void>
  createTimeline: (spaceId: number, data: {
    title: string
    description?: string
    date: string
    media?: File[]
  }) => Promise<{ error?: string; timeline?: TimelineItem }>
  updateTimeline: (uuid: string, data: {
    title: string
    description?: string
    date: string
    media?: File[]
    removed?: string[]
  }) => Promise<{ error?: string }>
  deleteTimeline: (uuid: string) => Promise<{ error?: string }>
  setThumbnail: (uuid: string, path: string | null) => Promise<{ error?: string }>
}

export function useTimeline(): UseTimelineReturn {
  const [timelines, setTimelines] = useState<TimelineItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = useMemo(() => createClient(), [])

  const fetchTimelines = useCallback(async (spaceId: number) => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('love_timelines')
      .select('*')
      .eq('space_id', spaceId)
      .order('date', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setTimelines(data || [])
    }
    setLoading(false)
  }, [supabase])

  const uploadMedia = useCallback(async (spaceId: number, files: File[]): Promise<string[]> => {
    const paths: string[] = []

    for (const file of files) {
      const fileExt = file.name.split('.').pop() || 'jpg'
      const filePath = `spaces/${spaceId}/timeline/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('love-timelines')
        .upload(filePath, file, { contentType: file.type })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        continue
      }

      paths.push(filePath)
    }

    return paths
  }, [supabase])

  const generateUuid = useCallback((): string => {
    return crypto.randomUUID()
  }, [])

  const createTimeline = useCallback(async (spaceId: number, data: {
    title: string
    description?: string
    date: string
    media?: File[]
  }) => {
    let mediaPaths: string[] = []

    if (data.media && data.media.length > 0) {
      mediaPaths = await uploadMedia(spaceId, data.media)
    }

    const uuid = generateUuid()

    const { data: timeline, error: insertError } = await supabase
      .from('love_timelines')
      .insert({
        uuid,
        space_id: spaceId,
        title: data.title,
        description: data.description || null,
        date: data.date,
        media_path: mediaPaths[0] || null,
        media_paths: mediaPaths,
        thumbnail_path: mediaPaths[0] || null,
      })
      .select()
      .single()

    if (insertError) {
      return { error: insertError.message }
    }

    return { timeline }
  }, [supabase, uploadMedia, generateUuid])

  const updateTimeline = useCallback(async (uuid: string, data: {
    title: string
    description?: string
    date: string
    media?: File[]
    removed?: string[]
  }) => {
    const existing = timelines.find((t) => t.uuid === uuid)
    if (!existing) return { error: 'Timeline not found.' }

    let existingPaths = [...(existing.media_paths || [])]

    if (data.removed && data.removed.length > 0) {
      for (const path of data.removed) {
        await supabase.storage.from('love-timelines').remove([path])
      }
      existingPaths = existingPaths.filter((p) => !data.removed!.includes(p))
    }

    let newPaths: string[] = []
    if (data.media && data.media.length > 0) {
      newPaths = await uploadMedia(existing.space_id, data.media)
    }

    const finalPaths = [...existingPaths, ...newPaths]

    let thumbnailPath = existing.thumbnail_path
    if (thumbnailPath && !finalPaths.includes(thumbnailPath)) {
      thumbnailPath = finalPaths[0] || null
    }

    const { error: updateError } = await supabase
      .from('love_timelines')
      .update({
        title: data.title,
        description: data.description || null,
        date: data.date,
        media_path: finalPaths[0] || null,
        media_paths: finalPaths,
        thumbnail_path: thumbnailPath,
      })
      .eq('uuid', uuid)

    if (updateError) return { error: updateError.message }

    setTimelines((prev) =>
      prev.map((t) =>
        t.uuid === uuid
          ? { ...t, title: data.title, description: data.description || null, date: data.date, media_path: finalPaths[0] || null, media_paths: finalPaths, thumbnail_path: thumbnailPath }
          : t
      )
    )

    return {}
  }, [timelines, supabase, uploadMedia])

  const deleteTimeline = useCallback(async (uuid: string) => {
    const existing = timelines.find((t) => t.uuid === uuid)

    if (existing?.media_paths) {
      for (const path of existing.media_paths) {
        await supabase.storage.from('love-timelines').remove([path])
      }
    }

    const { error: deleteError } = await supabase
      .from('love_timelines')
      .delete()
      .eq('uuid', uuid)

    if (deleteError) return { error: deleteError.message }

    setTimelines((prev) => prev.filter((t) => t.uuid !== uuid))
    return {}
  }, [timelines, supabase])

  const setThumbnail = useCallback(async (uuid: string, path: string | null) => {
    const { error: updateError } = await supabase
      .from('love_timelines')
      .update({ thumbnail_path: path })
      .eq('uuid', uuid)

    if (updateError) return { error: updateError.message }

    setTimelines((prev) =>
      prev.map((t) => (t.uuid === uuid ? { ...t, thumbnail_path: path } : t))
    )
    return {}
  }, [supabase])

  return {
    timelines,
    loading,
    error,
    fetchTimelines,
    createTimeline,
    updateTimeline,
    deleteTimeline,
    setThumbnail,
  }
}
