'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import {
  Loader2,
  Play,
  Music,
  MessageCircle,
  Settings,
  Users,
  Clock,
  Power,
  PowerOff,
  Send,
} from 'lucide-react'

type Room = {
  id: string
  space_id: string
  name: string
  is_active: boolean
  theme: string | null
  created_at: string
}

type RoomMember = {
  id: string
  room_id: string
  user_id: string
  display_name: string | null
  avatar_url: string | null
  joined_at: string
}

type RoomMessage = {
  id: string
  room_id: string
  user_id: string
  display_name: string | null
  content: string
  created_at: string
}

export default function RoomPage() {
  const params = useParams()
  const slug = params.slug as string
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [room, setRoom] = useState<Room | null>(null)
  const [members, setMembers] = useState<RoomMember[]>([])
  const [messages, setMessages] = useState<RoomMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [timer, setTimer] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [spaceId, setSpaceId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }
    if (user && slug) {
      ;(async () => {
        setLoading(true)

        const { data: space } = await supabase
          .from('spaces')
          .select('id')
          .eq('slug', slug)
          .single()

        if (!space) {
          setLoading(false)
          return
        }

        setSpaceId(space.id)

        let { data: roomData } = await supabase
          .from('rooms')
          .select('*')
          .eq('space_id', space.id)
          .single()

        if (!roomData) {
          const { data: newRoom } = await supabase
            .from('rooms')
            .insert({
              space_id: space.id,
              name: 'Our Room',
              is_active: false,
            })
            .select()
            .single()

          roomData = newRoom
        }

        if (roomData) {
          setRoom(roomData)

          const { data: membersData } = await supabase
            .from('room_members')
            .select('*')
            .eq('room_id', roomData.id)
            .order('joined_at', { ascending: true })

          setMembers(membersData || [])

          const { data: messagesData } = await supabase
            .from('room_messages')
            .select('*')
            .eq('room_id', roomData.id)
            .order('created_at', { ascending: false })
            .limit(50)

          setMessages((messagesData || []).reverse())
        }

        setLoading(false)
      })()
    }
  }, [user, authLoading, router, slug, supabase])

  // Real-time room updates
  useEffect(() => {
    if (!room) return

    const channel = supabase
      .channel(`room-${room.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${room.id}`,
        },
        (payload) => {
          setRoom(payload.new as Room)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'room_messages',
          filter: `room_id=eq.${room.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as RoomMessage])
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_members',
          filter: `room_id=eq.${room.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMembers((prev) => [...prev, payload.new as RoomMember])
          } else if (payload.eventType === 'DELETE') {
            setMembers((prev) =>
              prev.filter((m) => m.id !== (payload.old as RoomMember).id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [room, supabase])

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (timerRunning) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timerRunning])

  const toggleRoom = useCallback(async () => {
    if (!room) return
    setToggling(true)

    const newActive = !room.is_active
    await supabase
      .from('rooms')
      .update({ is_active: newActive })
      .eq('id', room.id)

    setRoom((prev) => (prev ? { ...prev, is_active: newActive } : prev))
    setToggling(false)
  }, [room, supabase])

  const sendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!user || !room || !newMessage.trim()) return
      setSendingMessage(true)

      await supabase.from('room_messages').insert({
        room_id: room.id,
        user_id: user.id,
        display_name: user.user_metadata?.name || user.email?.split('@')[0],
        content: newMessage.trim(),
      })

      setNewMessage('')
      setSendingMessage(false)
    },
    [user, room, newMessage, supabase]
  )

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (authLoading || loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 text-pink-500 animate-spin" />
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {room?.name || 'Our Room'}
            </h1>
            <p className="text-gray-600">
              Your shared virtual space
            </p>
          </div>
          <Link
            href={`/spaces/${slug}/room/settings`}
            className="inline-flex items-center gap-2 rounded-full bg-pink-100 px-4 py-2 text-sm font-semibold text-pink-700 transition hover:bg-pink-200"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Room Status & Controls */}
          <div className="rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/70 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`h-4 w-4 rounded-full ${
                    room?.is_active ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
                  }`}
                />
                <span className="font-semibold text-gray-900">
                  {room?.is_active ? 'Room is Active' : 'Room is Inactive'}
                </span>
              </div>
              <button
                onClick={toggleRoom}
                disabled={toggling}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${
                  room?.is_active
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {toggling ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : room?.is_active ? (
                  <PowerOff className="h-4 w-4" />
                ) : (
                  <Power className="h-4 w-4" />
                )}
                {room?.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-3">
              <button className="flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-100 p-4 hover:shadow-md transition-all">
                <Play className="h-6 w-6 text-pink-500" />
                <span className="text-xs font-medium text-gray-700">
                  Start Movie
                </span>
              </button>
              <button className="flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-100 p-4 hover:shadow-md transition-all">
                <Music className="h-6 w-6 text-purple-500" />
                <span className="text-xs font-medium text-gray-700">
                  Play Music
                </span>
              </button>
              <button className="flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-100 p-4 hover:shadow-md transition-all">
                <MessageCircle className="h-6 w-6 text-pink-400" />
                <span className="text-xs font-medium text-gray-700">
                  Send Note
                </span>
              </button>
            </div>
          </div>

          {/* Shared Timer */}
          <div className="rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/70 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-pink-500" />
              <h3 className="font-semibold text-gray-900">Shared Timer</h3>
            </div>
            <div className="text-center">
              <p className="text-4xl font-mono font-bold text-gray-900 mb-4">
                {formatTimer(timer)}
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setTimerRunning(!timerRunning)}
                  className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                    timerRunning
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {timerRunning ? 'Pause' : 'Start'}
                </button>
                <button
                  onClick={() => {
                    setTimerRunning(false)
                    setTimer(0)
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 text-gray-600 px-5 py-2.5 text-sm font-semibold hover:bg-gray-50 transition"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Room Messages */}
          <div className="rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/70 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-pink-500" />
              <h3 className="font-semibold text-gray-900">Room Chat</h3>
              <span className="text-sm text-gray-400">
                ({messages.length})
              </span>
            </div>

            <div className="h-64 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <MessageCircle className="h-8 w-8 mb-2" />
                  <p className="text-sm">Say something to your partner!</p>
                </div>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${
                    msg.user_id === user?.id ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div className="shrink-0 h-8 w-8 rounded-full bg-pink-200 flex items-center justify-center text-xs font-semibold text-pink-700">
                    {(msg.display_name || 'U')[0].toUpperCase()}
                  </div>
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      msg.user_id === user?.id
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {msg.user_id !== user?.id && (
                      <p className="text-xs font-semibold text-pink-600 mb-1">
                        {msg.display_name}
                      </p>
                    )}
                    <p className="text-sm">{msg.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.user_id === user?.id
                          ? 'text-pink-200'
                          : 'text-gray-400'
                      }`}
                    >
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={sendMessage}
              className="p-4 border-t border-gray-100 flex items-center gap-3"
            >
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sendingMessage}
                className="p-2.5 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar - Members */}
        <div className="space-y-6">
          <div className="rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/70 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-pink-500" />
              <h3 className="font-semibold text-gray-900">Members</h3>
              <span className="text-sm text-gray-400">
                ({members.length})
              </span>
            </div>
            <div className="space-y-3">
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-300 to-purple-300 flex items-center justify-center text-sm font-bold text-white">
                    {m.avatar_url ? (
                      <img
                        src={m.avatar_url}
                        alt={m.display_name || ''}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      (m.display_name || 'U')[0].toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {m.display_name || 'Anonymous'}
                      {m.user_id === user?.id && (
                        <span className="text-pink-500 ml-1">(you)</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400">
                      Joined{' '}
                      {new Date(m.joined_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {members.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">
                  No members yet
                </p>
              )}
            </div>
          </div>

          {/* Room Info */}
          <div className="rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/70 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-pink-500" />
              <h3 className="font-semibold text-gray-900">Room Info</h3>
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Status</dt>
                <dd className="font-medium">
                  <span
                    className={`inline-flex items-center gap-1.5 ${
                      room?.is_active ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    <div
                      className={`h-2 w-2 rounded-full ${
                        room?.is_active ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                    {room?.is_active ? 'Active' : 'Inactive'}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Members</dt>
                <dd className="text-gray-900 font-medium">{members.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Messages</dt>
                <dd className="text-gray-900 font-medium">
                  {messages.length}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
