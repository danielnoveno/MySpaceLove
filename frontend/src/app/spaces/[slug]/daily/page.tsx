'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/motion'
import {
  Heart,
  RefreshCw,
  ArrowLeft,
  Sparkles,
  Calendar,
  CalendarHeart,
} from 'lucide-react'

type DailyMessage = {
  id: number
  space_id: number
  message: string
  author_id: string
  created_at: string
}

const LOVE_MESSAGES = [
  "Kamu adalah hal terbaik yang pernah terjadi dalam hidupku.",
  "Setiap momen bersamamu terasa seperti mimpi indah.",
  "Aku jatuh cinta padamu lebih banyak setiap hari.",
  "Senyummu adalah pemandangan favoritku di dunia.",
  "Aku sangat bersyukur memilikimu dalam hidupku.",
  "Kamu membuat hatiku berdebar, setiap waktu.",
  "Hidup lebih indah denganmu di sisiku.",
  "Kamu adalah matahari, bulanku, dan semua bintangku.",
  "Aku mencintaimu lebih dari kata-kata bisa ungkapkan.",
  "Kamu adalah orangku, hari ini dan selamanya.",
  "Bersamamu adalah petualangan favoritku.",
  "Cintamu adalah hadiah terbesar yang pernah kuterima.",
  "Aku menghargai setiap kenangan yang kita ciptakan bersama.",
  "Kamu membuat momen biasa menjadi luar biasa.",
  "Hatiku milikmu, sekarang dan selamanya.",
  "Aku suka cara kamu mencintaiku.",
  "Kamu adalah tempat bahagiaku.",
  "Bersama adalah tempat favoritku.",
  "Kamu adalah alasan aku percaya pada cinta.",
  "Aku akan memilihmu lagi dan lagi.",
]

export default function DailyPage() {
  const params = useParams()
  const slug = params.slug as string
  const { user, loading: authLoading } = useAuth()
  const [todayMessage, setTodayMessage] = useState<DailyMessage | null>(null)
  const [history, setHistory] = useState<DailyMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [spaceId, setSpaceId] = useState<number | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!authLoading && !user) return
    if (user) fetchMessages()
  }, [user, authLoading])

  const fetchMessages = async () => {
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

    // Get today's message
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const { data: todayData } = await supabase
      .from('daily_messages')
      .select('*')
      .eq('space_id', space.id)
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    setTodayMessage(todayData)

    // Get history
    const { data: historyData } = await supabase
      .from('daily_messages')
      .select('*')
      .eq('space_id', space.id)
      .order('created_at', { ascending: false })
      .limit(30)

    if (historyData) setHistory(historyData)
    setLoading(false)
  }

  const generateMessage = async () => {
    if (!spaceId || !user || generating) return

    setGenerating(true)

    const randomMessage = LOVE_MESSAGES[Math.floor(Math.random() * LOVE_MESSAGES.length)]

    const { data, error } = await supabase
      .from('daily_messages')
      .insert({
        space_id: spaceId,
        message: randomMessage,
        author_id: user.id,
      })
      .select()
      .single()

    if (data) {
      setTodayMessage(data)
      setHistory((prev) => [data, ...prev])
    }
    setGenerating(false)
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
          <div className="flex items-center gap-3">
            <Link
              href={`/spaces/${slug}`}
              className="p-2 rounded-xl hover:bg-warm-50 text-warm-500 hover:text-warm-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100">
              <CalendarHeart className="h-6 w-6 text-brand-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-warm-900">Catatan Harian Cinta</h1>
              <p className="text-warm-500">Dosis harian cinta dan apresiasi</p>
            </div>
          </div>
        </FadeIn>
      }
    >
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Today's Message */}
        <FadeIn delay={0.1}>
          <div className="rounded-3xl bg-gradient-to-br from-brand-500 to-coral-500 p-8 text-white shadow-lg shadow-brand-500/25">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-white/70" />
              <span className="text-sm font-medium text-white/80">
                {new Date().toLocaleDateString('id-ID', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>

            {todayMessage ? (
              <div>
                <p className="text-xl font-medium leading-relaxed whitespace-pre-wrap">
                  &ldquo;{todayMessage.message}&rdquo;
                </p>
                <p className="mt-4 text-sm text-white/70">
                  — {todayMessage.author_id === user?.id ? 'Anda' : 'Pasangan Anda'}
                </p>
              </div>
            ) : (
              <div className="text-center py-4">
                <Heart className="h-12 w-12 text-white/50 mx-auto mb-3" />
                <p className="text-lg text-white/90">Belum ada pesan untuk hari ini</p>
                <p className="text-sm text-white/70 mt-1">
                  Buat pesan cinta untuk mencerahkan hari pasangan Anda!
                </p>
              </div>
            )}

            <button
              onClick={generateMessage}
              disabled={generating}
              className="mt-6 flex items-center gap-2 rounded-full bg-white/20 backdrop-blur px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/30 disabled:opacity-50 active:scale-[0.98]"
            >
              <RefreshCw className={`h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
              {generating ? 'Membuat...' : todayMessage ? 'Buat Pesan Baru' : 'Buat Pesan'}
            </button>
          </div>
        </FadeIn>

        {/* History */}
        <FadeIn delay={0.2}>
          <div>
            <h2 className="text-lg font-semibold text-warm-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-brand-500" />
              Pesan Sebelumnya
            </h2>

            {history.length === 0 ? (
              <p className="text-warm-500 text-center py-8">Belum ada pesan</p>
            ) : (
              <StaggerContainer className="space-y-3">
                {history.map((msg) => (
                  <StaggerItem key={msg.id}>
                    <div className="rounded-2xl bg-white border border-warm-100 p-4 shadow-sm">
                      <p className="text-warm-700 whitespace-pre-wrap">{msg.message}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-warm-400">
                          {new Date(msg.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="text-xs text-brand-500">
                          {msg.author_id === user?.id ? 'Dari Anda' : 'Dari Pasangan'}
                        </span>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
          </div>
        </FadeIn>
      </div>
    </AuthenticatedLayout>
  )
}
