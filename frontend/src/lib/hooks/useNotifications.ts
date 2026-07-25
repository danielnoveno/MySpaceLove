'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export type Notification = {
  id: number
  user_id: string
  title: string
  message: string
  type: string
  read: boolean
  link: string | null
  created_at: string
}

type UseNotificationsReturn = {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  error: string | null
  fetchNotifications: (userId: string) => Promise<void>
  markAsRead: (id: number) => Promise<{ error?: string }>
  markAllAsRead: (userId: string) => Promise<{ error?: string }>
  deleteNotification: (id: number) => Promise<{ error?: string }>
  getUnreadCount: (userId: string) => Promise<number>
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchNotifications = useCallback(async (userId: string) => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100)

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setNotifications(data || [])
      setUnreadCount(data?.filter((n) => !n.read).length ?? 0)
    }
    setLoading(false)
  }, [supabase])

  const markAsRead = useCallback(async (id: number) => {
    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)

      if (updateError) return { error: updateError.message }

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
      return {}
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to mark as read'
      setError(message)
      return { error: message }
    }
  }, [supabase])

  const markAllAsRead = useCallback(async (userId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false)

      if (updateError) return { error: updateError.message }

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
      return {}
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to mark all as read'
      setError(message)
      return { error: message }
    }
  }, [supabase])

  const deleteNotification = useCallback(async (id: number) => {
    try {
      const notification = notifications.find((n) => n.id === id)

      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)

      if (deleteError) return { error: deleteError.message }

      setNotifications((prev) => prev.filter((n) => n.id !== id))
      if (notification && !notification.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
      return {}
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete notification'
      setError(message)
      return { error: message }
    }
  }, [notifications, supabase])

  const getUnreadCount = useCallback(async (userId: string): Promise<number> => {
    const { count, error: countError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false)

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
    getUnreadCount,
  }
}
