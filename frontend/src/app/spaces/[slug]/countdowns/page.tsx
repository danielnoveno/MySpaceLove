'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit3,
  ArrowLeft,
  PartyPopper,
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

export default function CountdownsPage() {
  const params = useParams()
  const slug = params.slug as string
  const { user, loading: authLoading } = useAuth()
  const [countdowns, setCountdowns] = useState<Countdown[]>([])
  const [loading, setLoading] = useState(true)
  const [spaceId, setSpaceId] = useState<number | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!authLoading && !user) return
    if (user) fetchCountdowns()
  }, [user, authLoading])

  const fetchCountdowns = async () => {
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

    const { data } = await supabase
      .from('countdowns')
      .select('*')
      .eq('space_id', space.id)
      .order('event_date', { ascending: true })

    if (data) setCountdowns(data)
    setLoading(false)
  }

  const deleteCountdown = async (id: number) => {
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/spaces/${slug}`}
              className="p-2 rounded-full hover:bg-pink-50 text-gray-600 hover:text-pink-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Countdowns</h1>
              <p className="text-gray-600">Special dates you look forward to</p>
            </div>
          </div>
          <Link
            href={`/spaces/${slug}/countdowns/create`}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            New
          </Link>
        </div>
      }
    >
      <div className="max-w-2xl mx-auto">
        {countdowns.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-pink-100 text-pink-400 mb-4">
              <Calendar className="h-10 w-10" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No countdowns yet</h2>
            <p className="text-gray-500 mb-6">
              Create your first countdown to a special date!
            </p>
            <Link
              href={`/spaces/${slug}/countdowns/create`}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
            >
              <Plus className="h-5 w-5" />
              Create Countdown
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {countdowns.map((countdown) => {
              const days = getDaysRemaining(countdown.event_date)
              const isPast = days < 0
              const isToday = days === 0

              return (
                <div
                  key={countdown.id}
                  className="rounded-3xl bg-white/80 backdrop-blur p-6 shadow-sm border border-white/70 transition-all hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                          isPast
                            ? 'bg-gray-100 text-gray-400'
                            : isToday
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gradient-to-br from-pink-400 to-purple-500 text-white'
                        }`}
                      >
                        {isToday ? (
                          <PartyPopper className="h-7 w-7" />
                        ) : (
                          <Calendar className="h-7 w-7" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {countdown.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {new Date(countdown.event_date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        {countdown.description && (
                          <p className="text-sm text-gray-600 mt-2">{countdown.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => deleteCountdown(countdown.id)}
                        className="p-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Days Remaining Badge */}
                  <div className="mt-4">
                    {isPast ? (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-500">
                        Passed
                      </span>
                    ) : isToday ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                        🎉 Today!
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-pink-100 px-3 py-1 text-sm font-medium text-pink-700">
                        {days} day{days !== 1 ? 's' : ''} remaining
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  )
}
