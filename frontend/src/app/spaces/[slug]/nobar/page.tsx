'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/motion'
import {
  Plus,
  Film,
  Loader2,
  Users,
  Calendar,
  Tv,
  LogIn,
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
          const sessionIds = sessionsData.map((session) => session.id)
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
        (payload) => {
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('id-ID', {
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
          <Loader2 className="h-12 w-12 text-brand-500 animate-spin" />
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout
      header={
        <FadeIn>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100">
                <Film className="h-6 w-6 text-brand-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-warm-900">Nobar</h1>
                <p className="text-warm-500">Nonton Bareng &mdash; sesi nonton bersama</p>
              </div>
            </div>
            <Link
              href={`/spaces/${slug}/nobar/create`}
              className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-600 hover:shadow-md hover:shadow-brand-500/25 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              Sesi Baru
            </Link>
          </div>
        </FadeIn>
      }
    >
      {sessions.length === 0 ? (
        <FadeIn delay={0.1}>
          <div className="text-center py-20">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-brand-50 text-brand-400 mb-6">
              <Film className="h-12 w-12" />
            </div>
            <h2 className="text-2xl font-semibold text-warm-900 mb-2">
              Belum ada sesi nonton
            </h2>
            <p className="text-warm-500 mb-6">
              Jadwalkan sesi nonton dan undang pasangan Anda!
            </p>
            <Link
              href={`/spaces/${slug}/nobar/create`}
              className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 font-semibold text-white shadow-sm transition-all hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-500/25 active:scale-[0.98]"
            >
              <Plus className="h-5 w-5" />
              Buat Sesi Pertama
            </Link>
          </div>
        </FadeIn>
      ) : (
        <div className="space-y-8">
          {/* Upcoming Sessions */}
          {upcomingSessions.length > 0 && (
            <FadeIn delay={0.1}>
              <div>
                <h2 className="text-sm font-semibold text-warm-400 uppercase tracking-wide mb-3">
                  Mendatang ({upcomingSessions.length})
                </h2>
                <StaggerContainer className="space-y-3">
                  {upcomingSessions.map((session) => {
                    const sessionParticipants = getSessionParticipants(session.id)
                    const joined = isJoined(session.id)
                    return (
                      <StaggerItem key={session.id}>
                        <div className="group rounded-3xl bg-white border border-warm-100 p-5 transition-all hover:shadow-xl hover:shadow-warm-900/5">
                          <div className="flex items-start gap-4">
                            <div className="shrink-0 h-12 w-12 rounded-2xl bg-gradient-to-br from-brand-400 to-coral-400 flex items-center justify-center text-white">
                              <Film className="h-6 w-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-warm-900">
                                {session.title}
                              </h3>
                              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-warm-500">
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
                                  {sessionParticipants.length} bergabung
                                </span>
                              </div>
                              {session.description && (
                                <p className="mt-2 text-sm text-warm-500 line-clamp-2">
                                  {session.description}
                                </p>
                              )}
                              {sessionParticipants.length > 0 && (
                                <div className="flex items-center gap-1 mt-3">
                                  {sessionParticipants.slice(0, 5).map((p) => (
                                    <div
                                      key={p.id}
                                      className="h-7 w-7 rounded-full bg-brand-200 flex items-center justify-center text-xs font-semibold text-brand-700 border-2 border-white"
                                      title={p.display_name || 'Peserta'}
                                    >
                                      {(p.display_name || 'U')[0].toUpperCase()}
                                    </div>
                                  ))}
                                  {sessionParticipants.length > 5 && (
                                    <span className="text-xs text-warm-500 ml-1">
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
                                  Buka
                                </Link>
                              ) : (
                                <button
                                  onClick={() => joinSession(session.id)}
                                  disabled={joining === session.id}
                                  className="inline-flex items-center gap-2 rounded-xl bg-brand-500 text-white px-4 py-2 text-sm font-semibold transition hover:bg-brand-600 disabled:opacity-50"
                                >
                                  {joining === session.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <LogIn className="h-4 w-4" />
                                  )}
                                  Gabung
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </StaggerItem>
                    )
                  })}
                </StaggerContainer>
              </div>
            </FadeIn>
          )}

          {/* Past Sessions */}
          {pastSessions.length > 0 && (
            <FadeIn delay={0.2}>
              <div>
                <h2 className="text-sm font-semibold text-warm-400 uppercase tracking-wide mb-3">
                  Selesai ({pastSessions.length})
                </h2>
                <StaggerContainer className="space-y-3">
                  {pastSessions.map((session) => {
                    const sessionParticipants = getSessionParticipants(session.id)
                    return (
                      <StaggerItem key={session.id}>
                        <div className="group rounded-3xl bg-warm-50 border border-warm-100 p-5 transition-all hover:shadow-md opacity-70">
                          <div className="flex items-start gap-4">
                            <div className="shrink-0 h-12 w-12 rounded-2xl bg-warm-200 flex items-center justify-center text-warm-500">
                              <Film className="h-6 w-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-warm-900 line-through decoration-warm-400">
                                {session.title}
                              </h3>
                              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-warm-500">
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
                                  {sessionParticipants.length} hadir
                                </span>
                              </div>
                            </div>
                            <Link
                              href={`/spaces/${slug}/nobar/${session.id}`}
                              className="p-2 text-warm-400 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Clock className="h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      </StaggerItem>
                    )
                  })}
                </StaggerContainer>
              </div>
            </FadeIn>
          )}
        </div>
      )}
    </AuthenticatedLayout>
  )
}
