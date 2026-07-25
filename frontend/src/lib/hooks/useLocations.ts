'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export type Location = {
  id: number
  space_id: number
  name: string
  address: string | null
  city: string | null
  category: string | null
  notes: string | null
  rating: number | null
  added_by: string
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
  }) => Promise<{ error?: string; location?: Location }>
  updateLocation: (id: number, data: {
    name?: string
    address?: string
    city?: string
    category?: string
    notes?: string
    rating?: number
  }) => Promise<{ error?: string }>
  deleteLocation: (id: number) => Promise<{ error?: string }>
}

export function useLocations(): UseLocationsReturn {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchLocations = useCallback(async (spaceId: number) => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('locations')
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
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { error: 'Not authenticated' }

      const { data: location, error: insertError } = await supabase
        .from('locations')
        .insert({
          space_id: data.space_id,
          name: data.name,
          address: data.address || null,
          city: data.city || null,
          category: data.category || null,
          notes: data.notes || null,
          rating: data.rating ?? null,
          added_by: user.id,
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
  }) => {
    try {
      const updatePayload: Record<string, unknown> = { updated_at: new Date().toISOString() }
      if (data.name !== undefined) updatePayload.name = data.name
      if (data.address !== undefined) updatePayload.address = data.address
      if (data.city !== undefined) updatePayload.city = data.city
      if (data.category !== undefined) updatePayload.category = data.category
      if (data.notes !== undefined) updatePayload.notes = data.notes
      if (data.rating !== undefined) updatePayload.rating = data.rating

      const { error: updateError } = await supabase
        .from('locations')
        .update(updatePayload)
        .eq('id', id)

      if (updateError) return { error: updateError.message }

      setLocations((prev) =>
        prev.map((loc) =>
          loc.id === id ? { ...loc, ...data, updated_at: new Date().toISOString() } : loc
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
        .from('locations')
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
