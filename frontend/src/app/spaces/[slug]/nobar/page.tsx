'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import {
  Plus,
  Film,
  Loader2,
  Users,
  Calendar,
  Tv,
  LogIn,
  LogOut,
  Clock,
  Play,
} from 'lucide-react'

type NobarSession = {
  id: string
  space_id: string
  title: string
  scheduled_at: string
  platform: string
  description: string | null
  created_by: string
  created_at: string
}

type Participant = {
  id: string
  session_id: string
  user_id: string
  display_name: string | null
  avatar_url: string | null
  joined_at: string
}

export default function NobarPage() {
  const params = useParams()
  const slug = params.slug as string
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [sessions, setSessions] = useState<NobarSession[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState<string | null>(null)
  const [leaving, setLeaving] = useState<string | null>(null)
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

        const { data: sessionsData } = await supabase
          .from('nobar_sessions')
          .select('*')
          .eq('space_id', space.id)
          .order('scheduled_at', { ascending: false })

        setSessions(sessionsData || [])

        if (sessionsData && sessionsData.length > 0) {
          const sessionIds = sessionsData.map((s: any) => s.id)
          const { data: participantsData } = await supabase
            .from('nobar_participants')
            .select('*')
            .in('session_id', sessionIds)

          setParticipants(participantsData || [])
        }

        setLoading(false)
      })()
    }
  }, [user, authLoading, router, slug, supabase])

  useEffect(() => {
    if (!spaceId) return

    const channel = supabase
      .channel('nobar-participants')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'nobar_participants' },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            setParticipants((prev) => [...prev, payload.new as Participant])
          } else if (payload.eventType === 'DELETE') {
            setParticipants((prev) =>
              prev.filter((p) => p.id !== (payload.old as Participant).id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [spaceId, supabase])

  const getSessionParticipants = useCallback(
    (sessionId: string) => {
      return participants.filter((p) => p.session_id === sessionId)
    },
    [participants]
  )

  const isJoined = useCallback(
    (sessionId: string) => {
      if (!user) return false
      return participants.some(
        (p) => p.session_id === sessionId && p.user_id === user.id
      )
    },
    [participants, user]
  )

  const joinSession = useCallback(
    async (sessionId: string) => {
      if (!user) return
      setJoining(sessionId)

      const { error } = await supabase.from('nobar_participants').insert({
        session_id: sessionId,
        user_id: user.id,
        display_name: user.user_metadata?.name || user.email?.split('@')[0],
        avatar_url: user.user_metadata?.avatar_url || null,
      })

      if (!error) {
        setParticipants((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            session_id: sessionId,
            user_id: user.id,
            display_name:
              user.user_metadata?.name || user.email?.split('@')[0],
            avatar_url: user.user_metadata?.avatar_url || null,
            joined_at: new Date().toISOString(),
          },
        ])
      }
      setJoining(null)
    },
    [user, supabase]
  )

  const leaveSession = useCallback(
    async (sessionId: string) => {
      if (!user) return
      setLeaving(sessionId)

      await supabase
        .from('nobar_participants')
        .delete()
        .eq('session_id', sessionId)
        .eq('user_id', user.id)

      setParticipants((prev) =>
        prev.filter(
          (p) => !(p.session_id === sessionId && p.user_id === user.id)
        )
      )
      setLeaving(null)
    },
    [user, supabase]
  )

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const upcomingSessions = sessions.filter(
    (s) => new Date(s.scheduled_at) >= new Date()
  )
  const pastSessions = sessions.filter(
    (s) => new Date(s.scheduled_at) < new Date()
  )

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
            <h1 className="text-2xl font-bold text-gray-900">Nobar</h1>
            <p className="text-gray-600">
              Nonton Bareng &mdash; watch together sessions
            </p>
          </div>
          <Link
            href={`/spaces/${slug}/nobar/create`}
            className="inline-flex items-center gap-2 rounded-full bg-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-600"
          >
            <Plus className="h-4 w-4" />
            New Session
          </Link>
        </div>
      }
    >
      {sessions.length === 0 ? (
        <div className="text-center py-20">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-pink-100 text-pink-500 mb-6">
            <Film className="h-12 w-12" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            No watch sessions yet
          </h2>
          <p className="text-gray-600 mb-6">
            Schedule a watch session and invite your partner!
          </p>
          <Link
            href={`/spaces/${slug}/nobar/create`}
            className="inline-flex items-center gap-2 rounded-full bg-pink-500 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-pink-600"
          >
            <Plus className="h-5 w-5" />
            Create First Session
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Upcoming Sessions */}
          {upcomingSessions.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Upcoming ({upcomingSessions.length})
              </h2>
              <div className="space-y-3">
                {upcomingSessions.map((session) => {
                  const sessionParticipants = getSessionParticipants(session.id)
                  const joined = isJoined(session.id)
                  return (
                    <div
                      key={session.id}
                      className="group rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/70 p-5 transition-all hover:shadow-md"
                    >
                      <div className="flex items-start gap-4">
                        <div className="shrink-0 h-12 w-12 rounded-xl bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center text-white">
                          <Film className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900">
                            {session.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDate(session.scheduled_at)}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Tv className="h-3.5 w-3.5" />
                              {session.platform}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              {sessionParticipants.length} joined
                            </span>
                          </div>
                          {session.description && (
                            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                              {session.description}
                            </p>
                          )}
                          {/* Participants avatars */}
                          {sessionParticipants.length > 0 && (
                            <div className="flex items-center gap-1 mt-3">
                              {sessionParticipants
                                .slice(0, 5)
                                .map((p) => (
                                  <div
                                    key={p.id}
                                    className="h-7 w-7 rounded-full bg-pink-200 flex items-center justify-center text-xs font-semibold text-pink-700 border-2 border-white"
                                    title={p.display_name || 'Participant'}
                                  >
                                    {(p.display_name || 'U')[0].toUpperCase()}
                                  </div>
                                ))}
                              {sessionParticipants.length > 5 && (
                                <span className="text-xs text-gray-500 ml-1">
                                  +{sessionParticipants.length - 5}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {joined ? (
                            <Link
                              href={`/spaces/${slug}/nobar/${session.id}`}
                              className="inline-flex items-center gap-2 rounded-xl bg-green-100 text-green-700 px-4 py-2 text-sm font-semibold transition hover:bg-green-200"
                            >
                              <Play className="h-4 w-4" />
                              Open
                            </Link>
                          ) : (
                            <>
                              <button
                                onClick={() => joinSession(session.id)}
                                disabled={joining === session.id}
                                className="inline-flex items-center gap-2 rounded-xl bg-pink-500 text-white px-4 py-2 text-sm font-semibold transition hover:bg-pink-600 disabled:opacity-50"
                              >
                                {joining === session.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <LogIn className="h-4 w-4" />
                                )}
                                Join
                              </button>
                              <Link
                                href={`/spaces/${slug}/nobar/${session.id}`}
                                className="p-2 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-colors"
                              >
                                <Clock className="h-4 w-4" />
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Past Sessions */}
          {pastSessions.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Past ({pastSessions.length})
              </h2>
              <div className="space-y-3">
                {pastSessions.map((session) => {
                  const sessionParticipants = getSessionParticipants(session.id)
                  return (
                    <div
                      key={session.id}
                      className="group rounded-3xl bg-white/50 backdrop-blur shadow-sm border border-white/50 p-5 transition-all hover:shadow-md opacity-70"
                    >
                      <div className="flex items-start gap-4">
                        <div className="shrink-0 h-12 w-12 rounded-xl bg-gray-200 flex items-center justify-center text-gray-500">
                          <Film className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 line-through decoration-gray-400">
                            {session.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDate(session.scheduled_at)}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Tv className="h-3.5 w-3.5" />
                              {session.platform}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              {sessionParticipants.length} attended
                            </span>
                          </div>
                        </div>
                        <Link
                          href={`/spaces/${slug}/nobar/${session.id}`}
                          className="p-2 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Clock className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </AuthenticatedLayout>
  )
}
