'use client'

import { useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

// Schema: notifications table
// Columns: id (UUID), user_id, space_id (UUID), type, notifiable_type, notifiable_id, data (JSONB), read_at (TIMESTAMPTZ), created_at, updated_at
// "read" is determined by: read_at !== null

export type Notification = {
  id: string // UUID
  user_id: string
  space_id: string | null
  type: string
  notifiable_type: string
  notifiable_id: number
  data: Record<string, unknown> | null
  read_at: string | null
  created_at: string
  updated_at: string
}

type UseNotificationsReturn = {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  error: string | null
  fetchNotifications: (userId: string, spaceId?: string | null) => Promise<void>
  markAsRead: (id: string) => Promise<{ error?: string }>
  markAllAsRead: (userId: string, spaceId?: string | null) => Promise<{ error?: string }>
  deleteNotification: (id: string) => Promise<{ error?: string }>
  deleteNotifications: (ids: string[]) => Promise<{ error?: string }>
  getUnreadCount: (userId: string, spaceId?: string | null) => Promise<number>
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = useMemo(() => createClient(), [])

  const fetchNotifications = useCallback(async (userId: string, spaceId?: string | null) => {
    setLoading(true)
    setError(null)

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)

    if (spaceId) {
      query = query.eq('space_id', spaceId)
    }

    const { data, error: fetchError } = await query
      .order('created_at', { ascending: false })
      .limit(100)

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setNotifications(data || [])
      setUnreadCount(data?.filter((n) => !n.read_at).length ?? 0)
    }
    setLoading(false)
  }, [supabase])

  const markAsRead = useCallback(async (id: string) => {
    try {
      const now = new Date().toISOString()
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ read_at: now })
        .eq('id', id)

      if (updateError) return { error: updateError.message }

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: now } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
      return {}
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to mark as read'
      setError(message)
      return { error: message }
    }
  }, [supabase])

  const markAllAsRead = useCallback(async (userId: string, spaceId?: string | null) => {
    try {
      const now = new Date().toISOString()
      let query = supabase
        .from('notifications')
        .update({ read_at: now })
        .eq('user_id', userId)
        .is('read_at', null)

      if (spaceId) {
        query = query.eq('space_id', spaceId)
      }

      const { error: updateError } = await query

      if (updateError) return { error: updateError.message }

      setNotifications((prev) =>
        prev.map((n) => {
          if (spaceId && n.space_id !== spaceId) return n
          return { ...n, read_at: now }
        })
      )
      setUnreadCount(0)
      return {}
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to mark all as read'
      setError(message)
      return { error: message }
    }
  }, [supabase])

  const deleteNotification = useCallback(async (id: string) => {
    try {
      const notification = notifications.find((n) => n.id === id)

      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)

      if (deleteError) return { error: deleteError.message }

      setNotifications((prev) => prev.filter((n) => n.id !== id))
      if (notification && !notification.read_at) {
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
      return {}
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete notification'
      setError(message)
      return { error: message }
    }
  }, [notifications, supabase])

  const deleteNotifications = useCallback(async (ids: string[]) => {
    try {
      if (ids.length === 0) return {}

      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .in('id', ids)

      if (deleteError) return { error: deleteError.message }

      const unreadDeleted = notifications.filter(
        (n) => ids.includes(n.id) && !n.read_at
      ).length

      setNotifications((prev) => prev.filter((n) => !ids.includes(n.id)))
      setUnreadCount((prev) => Math.max(0, prev - unreadDeleted))
      return {}
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete notifications'
      setError(message)
      return { error: message }
    }
  }, [notifications, supabase])

  const getUnreadCount = useCallback(async (userId: string, spaceId?: string | null): Promise<number> => {
    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('read_at', null)

    if (spaceId) {
      query = query.eq('space_id', spaceId)
    }

    const { count, error: countError } = await query

    if (countError) {
      setError(countError.message)
      return 0
    }

    return count ?? 0
  }, [supabase])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteNotifications,
    getUnreadCount,
  }
}
