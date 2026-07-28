'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import AppImage from '@/components/AppImage'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { FadeIn } from '@/components/motion'
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

  const [showMovieModal, setShowMovieModal] = useState(false)
  const [movieUrl, setMovieUrl] = useState('')
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [noteText, setNoteText] = useState('')

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
              name: 'Ruang Kami',
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

  useEffect(() => {
    if (!room) return

    const channel = supabase
      .channel(`room-${room.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${room.id}` },
        (payload) => { setRoom(payload.new as Room) }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'room_messages', filter: `room_id=eq.${room.id}` },
        (payload) => { setMessages((prev) => [...prev, payload.new as RoomMessage]) }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'room_members', filter: `room_id=eq.${room.id}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMembers((prev) => [...prev, payload.new as RoomMember])
          } else if (payload.eventType === 'DELETE') {
            setMembers((prev) => prev.filter((m) => m.id !== (payload.old as RoomMember).id))
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [room, supabase])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (timerRunning) {
      interval = setInterval(() => { setTimer((prev) => prev + 1) }, 1000)
    }
    return () => { if (interval) clearInterval(interval) }
  }, [timerRunning])

  const toggleRoom = useCallback(async () => {
    if (!room) return
    setToggling(true)
    const newActive = !room.is_active
    await supabase.from('rooms').update({ is_active: newActive }).eq('id', room.id)
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

  const handleStartMovie = async () => {
    if (!user || !room || !movieUrl.trim()) return
    const displayName = user.user_metadata?.name || user.email?.split('@')[0]
    await supabase.from('room_messages').insert({
      room_id: room.id,
      user_id: user.id,
      display_name: displayName,
      content: `🎬 ${displayName} memulai film: ${movieUrl.trim()}`,
    })
    setMovieUrl('')
    setShowMovieModal(false)
  }

  const handlePlayMusic = () => { router.push(`/spaces/${slug}/spotify`) }

  const handleSendNote = async () => {
    if (!user || !room || !noteText.trim()) return
    const displayName = user.user_metadata?.name || user.email?.split('@')[0]
    await supabase.from('room_messages').insert({
      room_id: room.id,
      user_id: user.id,
      display_name: displayName,
      content: `📝 ${displayName} mengirim catatan: ${noteText.trim()}`,
    })
    setNoteText('')
    setShowNoteModal(false)
  }

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (authLoading || loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 text-brand-500 animate-spin" />
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <>
      <AuthenticatedLayout
        header={
          <FadeIn>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100">
                  <Users className="h-6 w-6 text-brand-500" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-warm-900">{room?.name || 'Ruang Kami'}</h1>
                  <p className="text-warm-500">Ruang virtual bersama Anda</p>
                </div>
              </div>
              <Link
                href={`/spaces/${slug}/room/settings`}
                className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-200"
              >
                <Settings className="h-4 w-4" />
                Pengaturan
              </Link>
            </div>
          </FadeIn>
        }
      >
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Room Status & Controls */}
            <FadeIn delay={0.1}>
              <div className="rounded-3xl bg-white border border-warm-100 p-6 shadow-xl shadow-warm-900/5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-4 w-4 rounded-full ${room?.is_active ? 'bg-green-500 animate-pulse' : 'bg-warm-300'}`} />
                    <span className="font-semibold text-warm-900">
                      {room?.is_active ? 'Ruang Aktif' : 'Ruang Tidak Aktif'}
                    </span>
                  </div>
                  <button
                    onClick={toggleRoom}
                    disabled={toggling}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${
                      room?.is_active
                        ? 'bg-coral-100 text-coral-700 hover:bg-coral-200'
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
                    {room?.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setShowMovieModal(true)}
                    className="flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-br from-brand-50 to-coral-50 border border-brand-100 p-4 hover:shadow-md transition-all"
                  >
                    <Play className="h-6 w-6 text-brand-500" />
                    <span className="text-xs font-medium text-warm-700">Mulai Film</span>
                  </button>
                  <button
                    onClick={handlePlayMusic}
                    className="flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-br from-brand-50 to-coral-50 border border-brand-100 p-4 hover:shadow-md transition-all"
                  >
                    <Music className="h-6 w-6 text-coral-500" />
                    <span className="text-xs font-medium text-warm-700">Putar Musik</span>
                  </button>
                  <button
                    onClick={() => setShowNoteModal(true)}
                    className="flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-br from-brand-50 to-coral-50 border border-brand-100 p-4 hover:shadow-md transition-all"
                  >
                    <MessageCircle className="h-6 w-6 text-brand-400" />
                    <span className="text-xs font-medium text-warm-700">Kirim Catatan</span>
                  </button>
                </div>
              </div>
            </FadeIn>

            {/* Shared Timer */}
            <FadeIn delay={0.15}>
              <div className="rounded-3xl bg-white border border-warm-100 p-6 shadow-xl shadow-warm-900/5">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-5 w-5 text-brand-500" />
                  <h3 className="font-semibold text-warm-900">Timer Bersama</h3>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-mono font-bold text-warm-900 mb-4">{formatTimer(timer)}</p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => setTimerRunning(!timerRunning)}
                      className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                        timerRunning
                          ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {timerRunning ? 'Jeda' : 'Mulai'}
                    </button>
                    <button
                      onClick={() => { setTimerRunning(false); setTimer(0) }}
                      className="inline-flex items-center gap-2 rounded-xl border border-warm-200 text-warm-600 px-5 py-2.5 text-sm font-semibold hover:bg-warm-50 transition"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Room Messages */}
            <FadeIn delay={0.2}>
              <div className="rounded-3xl bg-white border border-warm-100 overflow-hidden shadow-xl shadow-warm-900/5">
                <div className="px-6 py-4 border-b border-warm-100 flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-brand-500" />
                  <h3 className="font-semibold text-warm-900">Chat Ruangan</h3>
                  <span className="text-sm text-warm-400">({messages.length})</span>
                </div>

                <div className="h-64 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-warm-400">
                      <MessageCircle className="h-8 w-8 mb-2" />
                      <p className="text-sm">Katakan sesuatu kepada pasangan Anda!</p>
                    </div>
                  )}
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-3 ${msg.user_id === user?.id ? 'flex-row-reverse' : ''}`}>
                      <div className="shrink-0 h-8 w-8 rounded-full bg-brand-200 flex items-center justify-center text-xs font-semibold text-brand-700">
                        {(msg.display_name || 'U')[0].toUpperCase()}
                      </div>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        msg.user_id === user?.id
                          ? 'bg-brand-500 text-white'
                          : 'bg-warm-100 text-warm-900'
                      }`}>
                        {msg.user_id !== user?.id && (
                          <p className="text-xs font-semibold text-brand-600 mb-1">{msg.display_name}</p>
                        )}
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${msg.user_id === user?.id ? 'text-brand-200' : 'text-warm-400'}`}>
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={sendMessage} className="p-4 border-t border-warm-100 flex items-center gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Ketik pesan..."
                    className="flex-1 rounded-2xl border border-warm-100 bg-warm-50 px-4 py-2.5 text-sm text-warm-900 placeholder-warm-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sendingMessage}
                    className="p-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </FadeIn>
          </div>

          {/* Sidebar - Members */}
          <div className="space-y-6">
            <FadeIn delay={0.1}>
              <div className="rounded-3xl bg-white border border-warm-100 p-6 shadow-xl shadow-warm-900/5">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-5 w-5 text-brand-500" />
                  <h3 className="font-semibold text-warm-900">Anggota</h3>
                  <span className="text-sm text-warm-400">({members.length})</span>
                </div>
                <div className="space-y-3">
                  {members.map((m) => (
                    <div key={m.id} className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-300 to-coral-300 flex items-center justify-center text-sm font-bold text-white">
                        {m.avatar_url ? (
                          <AppImage src={m.avatar_url} alt={m.display_name || ''} className="h-full w-full rounded-full object-cover" />
                        ) : (
                          (m.display_name || 'U')[0].toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-warm-900 truncate">
                          {m.display_name || 'Anonim'}
                          {m.user_id === user?.id && (
                            <span className="text-brand-500 ml-1">(Anda)</span>
                          )}
                        </p>
                        <p className="text-xs text-warm-400">
                          Bergabung {new Date(m.joined_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {members.length === 0 && (
                    <p className="text-sm text-warm-400 text-center py-4">Belum ada anggota</p>
                  )}
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="rounded-3xl bg-white border border-warm-100 p-6 shadow-xl shadow-warm-900/5">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-5 w-5 text-brand-500" />
                  <h3 className="font-semibold text-warm-900">Info Ruangan</h3>
                </div>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-warm-500">Status</dt>
                    <dd className="font-medium">
                      <span className={`inline-flex items-center gap-1.5 ${room?.is_active ? 'text-green-600' : 'text-warm-400'}`}>
                        <div className={`h-2 w-2 rounded-full ${room?.is_active ? 'bg-green-500' : 'bg-warm-300'}`} />
                        {room?.is_active ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-warm-500">Anggota</dt>
                    <dd className="text-warm-900 font-medium">{members.length}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-warm-500">Pesan</dt>
                    <dd className="text-warm-900 font-medium">{messages.length}</dd>
                  </div>
                </dl>
              </div>
            </FadeIn>
          </div>
        </div>
      </AuthenticatedLayout>

      {/* Movie URL Modal */}
      {showMovieModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl border border-warm-100 p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold text-warm-900">🎬 Mulai Film</h3>
            <p className="text-sm text-warm-500">Tempel tautan film atau watch party.</p>
            <input
              type="url"
              value={movieUrl}
              onChange={(e) => setMovieUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-2xl border border-warm-100 bg-warm-50 px-4 py-3 text-sm text-warm-900 placeholder-warm-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
            />
            <div className="flex gap-3">
              <button
                onClick={handleStartMovie}
                disabled={!movieUrl.trim()}
                className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50 transition-all"
              >
                Bagikan Film
              </button>
              <button
                onClick={() => { setShowMovieModal(false); setMovieUrl('') }}
                className="rounded-full px-5 py-2.5 text-sm font-medium text-warm-600 hover:bg-warm-50 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl border border-warm-100 p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold text-warm-900">📝 Kirim Catatan</h3>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={3}
              placeholder="Tulis sesuatu yang manis..."
              className="w-full rounded-2xl border border-warm-100 bg-warm-50 px-4 py-3 text-sm text-warm-900 placeholder-warm-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={handleSendNote}
                disabled={!noteText.trim()}
                className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50 transition-all"
              >
                Kirim Catatan
              </button>
              <button
                onClick={() => { setShowNoteModal(false); setNoteText('') }}
                className="rounded-full px-5 py-2.5 text-sm font-medium text-warm-600 hover:bg-warm-50 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
