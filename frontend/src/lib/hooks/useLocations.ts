'use client'

import { useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

// Schema: shared_locations table
// Columns: id, space_id, user_id (NOT added_by), name, address, city, category, notes, rating, latitude, longitude, created_at, updated_at

export type Location = {
  id: number
  space_id: number
  user_id: string
  name: string
  address: string | null
  city: string | null
  category: string | null
  notes: string | null
  rating: number | null
  latitude: number | null
  longitude: number | null
  created_at: string
  updated_at: string
}

type UseLocationsReturn = {
  locations: Location[]
  loading: boolean
  error: string | null
  fetchLocations: (spaceId: number) => Promise<void>
  createLocation: (data: {
    space_id: number
    name: string
    address?: string
    city?: string
    category?: string
    notes?: string
    rating?: number
    latitude?: number
    longitude?: number
  }) => Promise<{ error?: string; location?: Location }>
  updateLocation: (id: number, data: {
    name?: string
    address?: string
    city?: string
    category?: string
    notes?: string
    rating?: number
    latitude?: number
    longitude?: number
  }) => Promise<{ error?: string }>
  deleteLocation: (id: number) => Promise<{ error?: string }>
}

export function useLocations(): UseLocationsReturn {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = useMemo(() => createClient(), [])

  const fetchLocations = useCallback(async (spaceId: number) => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('shared_locations')
      .select('*')
      .eq('space_id', spaceId)
      .order('name', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setLocations(data || [])
    }
    setLoading(false)
  }, [supabase])

  const createLocation = useCallback(async (data: {
    space_id: number
    name: string
    address?: string
    city?: string
    category?: string
    notes?: string
    rating?: number
    latitude?: number
    longitude?: number
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { error: 'Not authenticated' }

      const { data: location, error: insertError } = await supabase
        .from('shared_locations')
        .insert({
          space_id: data.space_id,
          user_id: user.id,
          name: data.name,
          address: data.address || null,
          city: data.city || null,
          category: data.category || null,
          notes: data.notes || null,
          rating: data.rating ?? null,
          latitude: data.latitude ?? null,
          longitude: data.longitude ?? null,
        })
        .select()
        .single()

      if (insertError) return { error: insertError.message }

      setLocations((prev) => [...prev, location].sort((a, b) => a.name.localeCompare(b.name)))
      return { location }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create location'
      setError(message)
      return { error: message }
    }
  }, [supabase])

  const updateLocation = useCallback(async (id: number, data: {
    name?: string
    address?: string
    city?: string
    category?: string
    notes?: string
    rating?: number
    latitude?: number
    longitude?: number
  }) => {
    try {
      const updatePayload: Record<string, unknown> = {}
      if (data.name !== undefined) updatePayload.name = data.name
      if (data.address !== undefined) updatePayload.address = data.address
      if (data.city !== undefined) updatePayload.city = data.city
      if (data.category !== undefined) updatePayload.category = data.category
      if (data.notes !== undefined) updatePayload.notes = data.notes
      if (data.rating !== undefined) updatePayload.rating = data.rating
      if (data.latitude !== undefined) updatePayload.latitude = data.latitude
      if (data.longitude !== undefined) updatePayload.longitude = data.longitude

      if (Object.keys(updatePayload).length === 0) return {}

      const { error: updateError } = await supabase
        .from('shared_locations')
        .update(updatePayload)
        .eq('id', id)

      if (updateError) return { error: updateError.message }

      setLocations((prev) =>
        prev.map((loc) =>
          loc.id === id ? { ...loc, ...data } : loc
        )
      )
      return {}
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update location'
      setError(message)
      return { error: message }
    }
  }, [supabase])

  const deleteLocation = useCallback(async (id: number) => {
    try {
      const { error: deleteError } = await supabase
        .from('shared_locations')
        .delete()
        .eq('id', id)

      if (deleteError) return { error: deleteError.message }

      setLocations((prev) => prev.filter((loc) => loc.id !== id))
      return {}
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete location'
      setError(message)
      return { error: message }
    }
  }, [supabase])

  return {
    locations,
    loading,
    error,
    fetchLocations,
    createLocation,
    updateLocation,
    deleteLocation,
  }
}
