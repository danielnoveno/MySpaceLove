'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/motion'
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit3,
  ArrowLeft,
  PartyPopper,
  Timer,
} from 'lucide-react'

type Countdown = {
  id: number
  space_id: number
  name: string
  event_date: string
  description: string | null
  activities: string | null
  created_at: string
}

type TimeRemaining = {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function getCountdownTimeRemaining(eventDate: string): TimeRemaining | null {
  const now = new Date().getTime()
  const event = new Date(eventDate).getTime()
  const diff = event - now

  if (diff <= 0) return null

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return { days, hours, minutes, seconds }
}

function CountdownTimer({ eventDate }: { eventDate: string }) {
  const [time, setTime] = useState<TimeRemaining | null>(() => getCountdownTimeRemaining(eventDate))

  const updateTimer = useCallback(() => {
    setTime(getCountdownTimeRemaining(eventDate))
  }, [eventDate])

  useEffect(() => {
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [updateTimer])

  if (!time) return null

  return (
    <div className="mt-2 flex items-center gap-2 text-sm font-mono">
      <Clock className="h-3.5 w-3.5 text-brand-400" />
      <span className="text-brand-600 font-semibold">
        {time.days > 0 && <>{time.days}h </>}
        {time.hours > 0 && <>{time.hours}m </>}
        {time.minutes > 0 && <>{time.minutes}d </>}
        <span className={time.days === 0 && time.hours === 0 ? 'text-coral-500' : ''}>
          {time.seconds}s
        </span>
      </span>
    </div>
  )
}

export default function CountdownsPage() {
  const params = useParams()
  const slug = params.slug as string
  const { user, loading: authLoading } = useAuth()
  const [countdowns, setCountdowns] = useState<Countdown[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchCountdowns = useCallback(async () => {
    const { data: space } = await supabase
      .from('spaces')
      .select('id')
      .eq('slug', slug)
      .single()

    if (!space) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('countdowns')
      .select('*')
      .eq('space_id', space.id)
      .order('event_date', { ascending: true })

    if (data) setCountdowns(data)
    setLoading(false)
  }, [slug, supabase])

  useEffect(() => {
    if (!authLoading && !user) return
    if (user) {
      const timeout = setTimeout(fetchCountdowns, 0)
      return () => clearTimeout(timeout)
    }
  }, [user, authLoading, fetchCountdowns])

  const deleteCountdown = async (id: number) => {
    if (!confirm('Hapus countdown ini?')) return
    await supabase.from('countdowns').delete().eq('id', id)
    setCountdowns((prev) => prev.filter((c) => c.id !== id))
  }

  const getDaysRemaining = (eventDate: string) => {
    const now = new Date()
    const event = new Date(eventDate)
    const diff = event.getTime() - now.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  if (authLoading || loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
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
              <Link
                href={`/spaces/${slug}`}
                className="p-2 rounded-xl hover:bg-warm-50 text-warm-500 hover:text-warm-700 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100">
                <Timer className="h-6 w-6 text-brand-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-warm-900">Countdown</h1>
                <p className="text-warm-500">Tanggal spesial yang dinantikan</p>
              </div>
            </div>
            <Link
              href={`/spaces/${slug}/countdowns/create`}
              className="flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-600 hover:shadow-md hover:shadow-brand-500/25 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              Baru
            </Link>
          </div>
        </FadeIn>
      }
    >
      <div className="max-w-2xl mx-auto">
        {countdowns.length === 0 ? (
          <FadeIn delay={0.1}>
            <div className="text-center py-16">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 text-brand-400 mb-4">
                <Calendar className="h-10 w-10" />
              </div>
              <h2 className="text-xl font-semibold text-warm-900 mb-2">Belum ada countdown</h2>
              <p className="text-warm-500 mb-6">
                Buat countdown pertama Anda ke tanggal spesial!
              </p>
              <Link
                href={`/spaces/${slug}/countdowns/create`}
                className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-500/25 active:scale-[0.98]"
              >
                <Plus className="h-5 w-5" />
                Buat Countdown
              </Link>
            </div>
          </FadeIn>
        ) : (
          <StaggerContainer className="space-y-4">
            {countdowns.map((countdown) => {
              const days = getDaysRemaining(countdown.event_date)
              const isPast = days < 0
              const isToday = days === 0

              return (
                <StaggerItem key={countdown.id}>
                  <div className="rounded-3xl bg-white border border-warm-100 p-6 transition-all hover:shadow-lg hover:shadow-warm-900/5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                            isPast
                              ? 'bg-warm-100 text-warm-400'
                              : isToday
                              ? 'bg-green-100 text-green-600'
                              : 'bg-brand-500 text-white'
                          }`}
                        >
                          {isToday ? (
                            <PartyPopper className="h-7 w-7" />
                          ) : (
                            <Calendar className="h-7 w-7" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-warm-900">
                            {countdown.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-4 w-4 text-warm-400" />
                            <span className="text-sm text-warm-500">
                              {new Date(countdown.event_date).toLocaleDateString('id-ID', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                          {countdown.description && (
                            <p className="text-sm text-warm-500 mt-2">{countdown.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/spaces/${slug}/countdowns/${countdown.id}/edit`}
                          className="p-2 rounded-full text-warm-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => deleteCountdown(countdown.id)}
                          className="p-2 rounded-full text-warm-400 hover:text-coral-600 hover:bg-coral-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Days Remaining Badge */}
                    <div className="mt-4">
                      {isPast ? (
                        <span className="inline-flex items-center rounded-full bg-warm-100 px-3 py-1 text-sm font-medium text-warm-500">
                          Lewat
                        </span>
                      ) : isToday ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                          Hari ini!
                        </span>
                      ) : (
                        <>
                          <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-600">
                            {days} hari lagi
                          </span>
                          {/* Live countdown timer */}
                          <CountdownTimer eventDate={countdown.event_date} />
                        </>
                      )}
                    </div>
                  </div>
                </StaggerItem>
              )
            })}
          </StaggerContainer>
        )}
      </div>
    </AuthenticatedLayout>
  )
}
