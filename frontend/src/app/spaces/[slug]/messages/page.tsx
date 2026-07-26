'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { FadeIn } from '@/components/motion'
import { Send, ArrowLeft, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import LoadingSpinner from '@/components/LoadingSpinner'

type Message = {
  id: number
  content: string
  sender_id: string
  created_at: string
  sender?: {
    email: string
    user_metadata?: { name?: string }
  }
}

type SpaceInfo = {
  id: number
  user_one_id: string
  user_two_id: string
}

export default function MessagesPage() {
  const params = useParams()
  const slug = params.slug as string
  const { user, loading: authLoading } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [spaceInfo, setSpaceInfo] = useState<SpaceInfo | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (!authLoading && !user) return
    if (user) {
      fetchSpaceInfo()
    }
  }, [user, authLoading])

  useEffect(() => {
    if (!spaceInfo) return

    fetchMessages()

    const channel = supabase
      .channel(`space-${spaceInfo.id}-messages`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `space_id=eq.${spaceInfo.id}`,
        },
        (payload: any) => {
          const newMsg = payload.new as Message
          setMessages((prev) => [...prev, newMsg])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [spaceInfo])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchSpaceInfo = async () => {
    const { data } = await supabase
      .from('spaces')
      .select('id, user_one_id, user_two_id')
      .eq('slug', slug)
      .single()

    if (data) {
      setSpaceInfo(data)
    } else {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    if (!spaceInfo) return

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('space_id', spaceInfo.id)
      .order('created_at', { ascending: true })

    if (data) {
      // Fetch sender info for each unique sender
      const senderIds = [...new Set(data.map((m: any) => m.sender_id as string))]
      const sendersMap: Record<string, { email: string; user_metadata?: { name?: string } }> = {}

      for (const senderId of senderIds) {
        const { data: userData } = await supabase.auth.admin.getUserById(senderId as string)
        if (userData?.user) {
          sendersMap[senderId as string] = {
            email: userData.user.email || 'Unknown',
            user_metadata: userData.user.user_metadata,
          }
        }
      }

      const enrichedMessages = data.map((msg: any) => ({
        ...msg,
        sender: sendersMap[msg.sender_id] || { email: 'Unknown' },
      }))

      setMessages(enrichedMessages)
    }
    setLoading(false)
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !spaceInfo || !user || sending) return

    setSending(true)
    const content = newMessage.trim()
    setNewMessage('')

    const { error } = await supabase.from('messages').insert({
      space_id: spaceInfo.id,
      sender_id: user.id,
      content,
    })

    if (error) {
      setNewMessage(content)
    }
    setSending(false)
  }

  const getSenderName = (msg: Message) => {
    if (msg.sender?.user_metadata?.name) return msg.sender.user_metadata.name
    if (msg.sender?.email) return msg.sender.email.split('@')[0]
    return 'Unknown'
  }

  if (authLoading || loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Memuat pesan..." />
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout
      header={
        <FadeIn>
          <div className="flex items-center gap-3">
            <Link
              href={`/spaces/${slug}`}
              className="p-2 rounded-xl hover:bg-warm-50 text-warm-500 hover:text-warm-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100">
              <MessageCircle className="h-6 w-6 text-brand-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-warm-900">Pesan</h1>
              <p className="text-warm-500">Chat dengan pasangan</p>
            </div>
          </div>
        </FadeIn>
      }
    >
      <div className="flex flex-col min-h-[300px] h-[calc(100dvh-16rem)]">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto space-y-4 pb-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-400 mb-4">
                <MessageCircle className="h-8 w-8" />
              </div>
              <p className="text-warm-500 font-medium">Belum ada pesan. Mulai percakapan!</p>
            </div>
          )}
          {messages.map((msg) => {
            const isMine = msg.sender_id === user?.id
            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    isMine
                      ? 'bg-brand-500 text-white'
                      : 'bg-white border border-warm-100 text-warm-900 shadow-sm'
                  }`}
                >
                  {!isMine && (
                    <p className="text-xs font-medium text-brand-500 mb-1">
                      {getSenderName(msg)}
                    </p>
                  )}
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  <p
                    className={`text-[10px] mt-1 ${
                      isMine ? 'text-brand-100' : 'text-warm-400'
                    }`}
                  >
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t border-warm-100 bg-white p-4">
          <form onSubmit={handleSend} className="flex items-center gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Ketik pesan..."
              className="flex-1 rounded-full bg-warm-50 border border-warm-200 px-4 py-3 text-sm text-warm-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-transparent transition-colors"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="flex items-center justify-center h-12 w-12 rounded-full bg-brand-500 text-white shadow-sm transition-all hover:bg-brand-600 hover:shadow-md hover:shadow-brand-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.95]"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
