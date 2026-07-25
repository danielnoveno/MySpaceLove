'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

export type Message = {
  id: number
  space_id: number
  sender_id: string
  content: string
  created_at: string
}

type UseMessagesReturn = {
  messages: Message[]
  loading: boolean
  error: string | null
  fetchMessages: (spaceId: number) => Promise<void>
  sendMessage: (spaceId: number, content: string) => Promise<{ error?: string; message?: Message }>
  subscribeToMessages: (spaceId: number, callback?: (message: Message) => void) => void
  unsubscribeFromMessages: () => void
}

export function useMessages(): UseMessagesReturn {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabase = createClient()

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
      .from('space_messages')
      .select('*')
      .eq('space_id', spaceId)
      .order('created_at', { ascending: true })
      .limit(200)

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setMessages(data || [])
    }
    setLoading(false)
  }, [supabase])

  const sendMessage = useCallback(async (spaceId: number, content: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { error: 'Not authenticated' }

      const { data: message, error: insertError } = await supabase
        .from('space_messages')
        .insert({
          space_id: spaceId,
          sender_id: user.id,
          content,
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
          table: 'space_messages',
          filter: `space_id=eq.${spaceId}`,
        },
        (payload) => {
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
