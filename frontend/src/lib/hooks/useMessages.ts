'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

// Schema: messages table
// Columns: id, space_id, sender_user_id (NOT sender_id), type, body (NOT content), meta_json, created_at, updated_at, deleted_at

export type Message = {
  id: number
  space_id: number
  sender_user_id: string
  type: string
  body: string | null
  meta_json: Record<string, unknown> | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

type UseMessagesReturn = {
  messages: Message[]
  loading: boolean
  error: string | null
  fetchMessages: (spaceId: number) => Promise<void>
  sendMessage: (spaceId: number, body: string) => Promise<{ error?: string; message?: Message }>
  subscribeToMessages: (spaceId: number, callback?: (message: Message) => void) => void
  unsubscribeFromMessages: () => void
}

export function useMessages(): UseMessagesReturn {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [supabase])

  const fetchMessages = useCallback(async (spaceId: number) => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('messages')
      .select('*')
      .eq('space_id', spaceId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })
      .limit(200)

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setMessages(data || [])
    }
    setLoading(false)
  }, [supabase])

  const sendMessage = useCallback(async (spaceId: number, body: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { error: 'Not authenticated' }

      const { data: message, error: insertError } = await supabase
        .from('messages')
        .insert({
          space_id: spaceId,
          sender_user_id: user.id,
          type: 'text',
          body,
        })
        .select()
        .single()

      if (insertError) return { error: insertError.message }

      return { message }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send message'
      setError(message)
      return { error: message }
    }
  }, [supabase])

  const subscribeToMessages = useCallback((spaceId: number, callback?: (message: Message) => void) => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
    }

    channelRef.current = supabase
      .channel(`space-messages-${spaceId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `space_id=eq.${spaceId}`,
        },
        (payload: any) => {
          const newMessage = payload.new as Message
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMessage.id)) return prev
            return [...prev, newMessage]
          })
          callback?.(newMessage)
        }
      )
      .subscribe()
  }, [supabase])

  const unsubscribeFromMessages = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }
  }, [supabase])

  return {
    messages,
    loading,
    error,
    fetchMessages,
    sendMessage,
    subscribeToMessages,
    unsubscribeFromMessages,
  }
}
