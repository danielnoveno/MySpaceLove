'use client'

import { useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

// Schema: rooms table (per-space real-time room state)
// Columns: id, space_id (UNIQUE), is_active, settings (JSONB), created_at, updated_at
// Default settings: {"background_music_url": null, "ambient_sound": null, "theme": "default", "font_size": "medium", "showActivity": true}

export type RoomSettings = {
  background_music_url: string | null
  ambient_sound: string | null
  theme: string
  font_size: string
  showActivity: boolean
}

export type Room = {
  id: number
  space_id: number
  is_active: boolean
  settings: RoomSettings
  created_at: string
  updated_at: string
}

type UseRoomReturn = {
  room: Room | null
  loading: boolean
  error: string | null
  getRoom: (spaceId: number) => Promise<void>
  updateRoom: (spaceId: number, settings: Partial<RoomSettings>) => Promise<{ error?: string }>
  toggleActive: (spaceId: number) => Promise<{ error?: string }>
}

const DEFAULT_SETTINGS: RoomSettings = {
  background_music_url: null,
  ambient_sound: null,
  theme: 'default',
  font_size: 'medium',
  showActivity: true,
}

export function useRoom(): UseRoomReturn {
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = useMemo(() => createClient(), [])

  const getRoom = useCallback(async (spaceId: number) => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('rooms')
      .select('*')
      .eq('space_id', spaceId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      setError(fetchError.message)
    } else if (data) {
      setRoom(data)
    } else {
      // Create default room if it doesn't exist
      const { data: newRoom, error: createError } = await supabase
        .from('rooms')
        .insert({
          space_id: spaceId,
          is_active: false,
          settings: DEFAULT_SETTINGS,
        })
        .select()
        .single()

      if (createError) {
        setError(createError.message)
      } else {
        setRoom(newRoom)
      }
    }
    setLoading(false)
  }, [supabase])

  const updateRoom = useCallback(async (spaceId: number, settings: Partial<RoomSettings>) => {
    try {
      if (!room) return { error: 'Room not loaded' }

      const updatedSettings = { ...room.settings, ...settings }

      const { error: updateError } = await supabase
        .from('rooms')
        .update({
          settings: updatedSettings,
        })
        .eq('space_id', spaceId)

      if (updateError) return { error: updateError.message }

      setRoom((prev) =>
        prev
          ? { ...prev, settings: updatedSettings }
          : prev
      )
      return {}
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update room'
      setError(message)
      return { error: message }
    }
  }, [room, supabase])

  const toggleActive = useCallback(async (spaceId: number) => {
    try {
      if (!room) return { error: 'Room not loaded' }

      const newActiveState = !room.is_active

      const { error: updateError } = await supabase
        .from('rooms')
        .update({
          is_active: newActiveState,
        })
        .eq('space_id', spaceId)

      if (updateError) return { error: updateError.message }

      setRoom((prev) =>
        prev
          ? { ...prev, is_active: newActiveState }
          : prev
      )
      return {}
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to toggle room'
      setError(message)
      return { error: message }
    }
  }, [room, supabase])

  return {
    room,
    loading,
    error,
    getRoom,
    updateRoom,
    toggleActive,
  }
}
