'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Loader2, Film, Users, Calendar, Tv, Play, LogIn, LogOut, Send, MessageCircle, Clock } from 'lucide-react'

type NobarSession = { id: string; space_id: string; title: string; scheduled_at: string; platform: string; description: string | null; created_by: string; created_at: string }
type Participant = { id: string; session_id: string; user_id: string; display_name: string | null; avatar_url: string | null; joined_at: string }
type Message = { id: string; session_id: string; user_id: string; display_name: string | null; avatar_url: string | null; content: string; created_at: string }

export default function NobarSessionDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const sessionId = params.id as string
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [session, setSession] = useState<NobarSession | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [joining, setJoining] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [watching, setWatching] = useState(false)
  const [startingWatch, setStartingWatch] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) { router.push('/auth/login'); return }
    if (user && slug && sessionId) {
      ;(async () => {
        setLoading(true)
        const { data: sessionData } = await supabase.from('nobar_sessions').select('*').eq('id', sessionId).single()
        if (!sessionData) { router.push(`/spaces/${slug}/nobar`); return }
        setSession(sessionData)
        const { data: participantsData } = await supabase.from('nobar_participants').select('*').eq('session_id', sessionId).order('joined_at', { ascending: true })
        setParticipants(participantsData || [])
        const { data: messagesData } = await supabase.from('nobar_messages').select('*').eq('session_id', sessionId).order('created_at', { ascending: true })
        setMessages(messagesData || []); setLoading(false)
      })()
    }
  }, [user, authLoading, router, slug, sessionId, supabase])

  useEffect(() => {
    const channel = supabase.channel(`nobar-participants-${sessionId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'nobar_participants', filter: `session_id=eq.${sessionId}` }, (payload: any) => {
      if (payload.eventType === 'INSERT') setParticipants((prev) => [...prev, payload.new as Participant])
      else if (payload.eventType === 'DELETE') setParticipants((prev) => prev.filter((p) => p.id !== (payload.old as Participant).id))
    }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [sessionId, supabase])

  useEffect(() => {
    const channel = supabase.channel(`nobar-messages-${sessionId}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'nobar_messages', filter: `session_id=eq.${sessionId}` }, (payload: any) => {
      setMessages((prev) => [...prev, payload.new as Message])
    }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [sessionId, supabase])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const isJoined = participants.some((p) => user && p.user_id === user.id)

  const joinSession = useCallback(async () => {
    if (!user) return; setJoining(true)
    await supabase.from('nobar_participants').insert({ session_id: sessionId, user_id: user.id, display_name: user.user_metadata?.name || user.email?.split('@')[0], avatar_url: user.user_metadata?.avatar_url || null })
    setJoining(false)
  }, [user, sessionId, supabase])

  const leaveSession = useCallback(async () => {
    if (!user) return; setLeaving(true)
    await supabase.from('nobar_participants').delete().eq('session_id', sessionId).eq('user_id', user.id)
    setParticipants((prev) => prev.filter((p) => p.user_id !== user.id)); setLeaving(false)
  }, [user, sessionId, supabase])

  const startWatching = useCallback(async () => {
    if (!user) return; setStartingWatch(true)
    const { error } = await supabase.from('nobar_sessions').update({ status: 'watching' }).eq('id', sessionId)
    if (!error) { setWatching(true); await supabase.from('nobar_messages').insert({ session_id: sessionId, user_id: user.id, display_name: user.user_metadata?.name || user.email?.split('@')[0], avatar_url: user.user_metadata?.avatar_url || null, content: `🎬 ${user.user_metadata?.name || user.email?.split('@')[0]} started watching!` }) }
    setStartingWatch(false)
  }, [user, sessionId, supabase])

  const sendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault(); if (!user || !newMessage.trim()) return; setSendingMessage(true)
    await supabase.from('nobar_messages').insert({ session_id: sessionId, user_id: user.id, display_name: user.user_metadata?.name || user.email?.split('@')[0], avatar_url: user.user_metadata?.avatar_url || null, content: newMessage.trim() })
    setNewMessage(''); setSendingMessage(false)
  }, [user, newMessage, sessionId, supabase])

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  if (authLoading || loading) {
    return <AuthenticatedLayout><div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 text-brand-500 animate-spin" /></div></AuthenticatedLayout>
  }
  if (!session) return null

  return (
    <AuthenticatedLayout header={
      <div className="flex items-center gap-4">
        <Link href={`/spaces/${slug}/nobar`} className="p-2 text-warm-400 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors"><ArrowLeft className="h-5 w-5" /></Link>
        <div><h1 className="text-2xl font-bold text-warm-900">{session.title}</h1><p className="text-warm-600">{session.platform}</p></div>
      </div>
    }>
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl bg-white border border-warm-100 p-6 shadow-xl shadow-warm-900/5">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-400 to-purple-400 flex items-center justify-center text-white"><Film className="h-8 w-8" /></div>
              <div>
                <h2 className="text-xl font-bold text-warm-900">{session.title}</h2>
                <div className="flex items-center gap-3 mt-1 text-sm text-warm-500">
                  <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate(session.scheduled_at)}</span>
                  <span className="inline-flex items-center gap-1"><Tv className="h-3.5 w-3.5" />{session.platform}</span>
                </div>
              </div>
            </div>
            {session.description && <p className="text-warm-600">{session.description}</p>}
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-warm-100">
              {isJoined ? (<>
                {watching ? (
                  <span className="inline-flex items-center gap-2 rounded-xl bg-green-100 text-green-700 px-5 py-2.5 text-sm font-semibold"><span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />Watching...</span>
                ) : (
                  <button onClick={startWatching} disabled={startingWatch} className="inline-flex items-center gap-2 rounded-xl bg-green-500 text-white px-5 py-2.5 text-sm font-semibold transition hover:bg-green-600 disabled:opacity-50">
                    {startingWatch ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}Start Watching
                  </button>
                )}
                <button onClick={leaveSession} disabled={leaving} className="inline-flex items-center gap-2 rounded-xl border border-coral-200 text-coral-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-coral-50 disabled:opacity-50">
                  {leaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}Leave Session
                </button>
              </>) : (
                <button onClick={joinSession} disabled={joining} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-purple-500 text-white px-5 py-2.5 text-sm font-semibold transition hover:shadow-md disabled:opacity-50">
                  {joining ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}Join Session
                </button>
              )}
            </div>
          </div>
          <div className="rounded-3xl bg-white border border-warm-100 overflow-hidden shadow-xl shadow-warm-900/5">
            <div className="px-6 py-4 border-b border-warm-100 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-brand-500" /><h3 className="font-semibold text-warm-900">Chat</h3><span className="text-sm text-warm-400">({messages.length})</span>
            </div>
            <div className="h-80 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (<div className="flex flex-col items-center justify-center h-full text-warm-400"><MessageCircle className="h-10 w-10 mb-2" /><p className="text-sm">No messages yet. Start chatting!</p></div>)}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.user_id === user?.id ? 'flex-row-reverse' : ''}`}>
                  <div className="shrink-0 h-8 w-8 rounded-full bg-brand-200 flex items-center justify-center text-xs font-semibold text-brand-700">{(msg.display_name || 'U')[0].toUpperCase()}</div>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${msg.user_id === user?.id ? 'bg-brand-500 text-white' : 'bg-warm-100 text-warm-900'}`}>
                    {msg.user_id !== user?.id && <p className="text-xs font-semibold text-brand-600 mb-1">{msg.display_name}</p>}
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.user_id === user?.id ? 'text-brand-200' : 'text-warm-400'}`}>{formatTime(msg.created_at)}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            {isJoined && (
              <form onSubmit={sendMessage} className="p-4 border-t border-warm-100 flex items-center gap-3">
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..."
                  className="flex-1 rounded-2xl border border-warm-100 bg-warm-50 px-4 py-2.5 text-sm text-warm-900 placeholder-warm-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all" />
                <button type="submit" disabled={!newMessage.trim() || sendingMessage}
                  className="p-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition disabled:opacity-50 disabled:cursor-not-allowed"><Send className="h-4 w-4" /></button>
              </form>
            )}
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-3xl bg-white border border-warm-100 p-6 shadow-xl shadow-warm-900/5">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-brand-500" /><h3 className="font-semibold text-warm-900">Participants</h3><span className="text-sm text-warm-400">({participants.length})</span>
            </div>
            <div className="space-y-3">
              {participants.map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-300 to-purple-300 flex items-center justify-center text-sm font-bold text-white">
                    {p.avatar_url ? <img src={p.avatar_url} alt={p.display_name || ''} className="h-full w-full rounded-full object-cover" /> : (p.display_name || 'U')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-warm-900 truncate">{p.display_name || 'Anonymous'}{p.user_id === user?.id && <span className="text-brand-500 ml-1">(you)</span>}</p>
                    <p className="text-xs text-warm-400">Joined {new Date(p.joined_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}
              {participants.length === 0 && <p className="text-sm text-warm-400 text-center py-4">No participants yet</p>}
            </div>
          </div>
          <div className="rounded-3xl bg-white border border-warm-100 p-6 shadow-xl shadow-warm-900/5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-brand-500" /><h3 className="font-semibold text-warm-900">Session Info</h3>
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-warm-500">Scheduled</dt><dd className="text-warm-900 font-medium">{formatDate(session.scheduled_at)}</dd></div>
              <div className="flex justify-between"><dt className="text-warm-500">Platform</dt><dd className="text-warm-900 font-medium">{session.platform}</dd></div>
              <div className="flex justify-between"><dt className="text-warm-500">Participants</dt><dd className="text-warm-900 font-medium">{participants.length}</dd></div>
              <div className="flex justify-between"><dt className="text-warm-500">Messages</dt><dd className="text-warm-900 font-medium">{messages.length}</dd></div>
            </dl>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
