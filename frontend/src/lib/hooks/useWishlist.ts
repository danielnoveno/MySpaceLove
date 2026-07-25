'use client'

import { useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

// Schema: wishlist_items table
// Columns: id, space_id, title, description, location, status, notes, created_at, updated_at
// NOTE: No user/author column — wishlist items are space-level

export type WishlistItem = {
  id: number
  space_id: number
  title: string
  description: string | null
  location: string | null
  notes: string | null
  status: 'pending' | 'done'
  created_at: string
  updated_at: string
}

type UseWishlistReturn = {
  items: WishlistItem[]
  loading: boolean
  error: string | null
  fetchWishlist: (spaceId: number) => Promise<void>
  createWishlistItem: (data: {
    space_id: number
    title: string
    description?: string
    location?: string
    notes?: string
  }) => Promise<{ error?: string; item?: WishlistItem }>
  updateWishlistItem: (id: number, data: {
    title?: string
    description?: string
    location?: string
    notes?: string
  }) => Promise<{ error?: string }>
  deleteWishlistItem: (id: number) => Promise<{ error?: string }>
  toggleStatus: (id: number) => Promise<{ error?: string }>
}

export function useWishlist(): UseWishlistReturn {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = useMemo(() => createClient(), [])

  const fetchWishlist = useCallback(async (spaceId: number) => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('wishlist_items')
      .select('*')
      .eq('space_id', spaceId)
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setItems(data || [])
    }
    setLoading(false)
  }, [supabase])

  const createWishlistItem = useCallback(async (data: {
    space_id: number
    title: string
    description?: string
    location?: string
    notes?: string
  }) => {
    try {
      const { data: item, error: insertError } = await supabase
        .from('wishlist_items')
        .insert({
          space_id: data.space_id,
          title: data.title,
          description: data.description || null,
          location: data.location || null,
          notes: data.notes || null,
          status: 'pending',
        })
        .select()
        .single()

      if (insertError) return { error: insertError.message }

      setItems((prev) => [item, ...prev])
      return { item }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create wishlist item'
      setError(message)
      return { error: message }
    }
  }, [supabase])

  const updateWishlistItem = useCallback(async (id: number, data: {
    title?: string
    description?: string
    location?: string
    notes?: string
  }) => {
    try {
      const updatePayload: Record<string, unknown> = {}
      if (data.title !== undefined) updatePayload.title = data.title
      if (data.description !== undefined) updatePayload.description = data.description
      if (data.location !== undefined) updatePayload.location = data.location
      if (data.notes !== undefined) updatePayload.notes = data.notes

      if (Object.keys(updatePayload).length === 0) return {}

      const { error: updateError } = await supabase
        .from('wishlist_items')
        .update(updatePayload)
        .eq('id', id)

      if (updateError) return { error: updateError.message }

      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, ...data } : item
        )
      )
      return {}
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update wishlist item'
      setError(message)
      return { error: message }
    }
  }, [supabase])

  const deleteWishlistItem = useCallback(async (id: number) => {
    try {
      const { error: deleteError } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('id', id)

      if (deleteError) return { error: deleteError.message }

      setItems((prev) => prev.filter((item) => item.id !== id))
      return {}
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete wishlist item'
      setError(message)
      return { error: message }
    }
  }, [supabase])

  const toggleStatus = useCallback(async (id: number) => {
    try {
      const item = items.find((i) => i.id === id)
      if (!item) return { error: 'Item not found' }

      const newStatus = item.status === 'pending' ? 'done' : 'pending'

      const { error: updateError } = await supabase
        .from('wishlist_items')
        .update({ status: newStatus })
        .eq('id', id)

      if (updateError) return { error: updateError.message }

      setItems((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, status: newStatus as WishlistItem['status'] } : i
        )
      )
      return {}
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to toggle status'
      setError(message)
      return { error: message }
    }
  }, [items, supabase])

  return {
    items,
    loading,
    error,
    fetchWishlist,
    createWishlistItem,
    updateWishlistItem,
    deleteWishlistItem,
    toggleStatus,
  }
}
