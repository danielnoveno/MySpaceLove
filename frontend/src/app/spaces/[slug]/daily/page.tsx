'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import {
  Heart,
  RefreshCw,
  ArrowLeft,
  Sparkles,
  Calendar,
} from 'lucide-react'

type DailyMessage = {
  id: number
  space_id: number
  message: string
  author_id: string
  created_at: string
}

const LOVE_MESSAGES = [
  "You are the best thing that's ever happened to me.",
  "Every moment with you feels like a beautiful dream.",
  "I fall in love with you more every single day.",
  "Your smile is my favorite sight in the world.",
  "I'm so grateful to have you in my life.",
  "You make my heart skip a beat, every time.",
  "Life is better with you by my side.",
  "You are my sun, my moon, and all my stars.",
  "I love you more than words can express.",
  "You are my person, today and always.",
  "Being with you is my favorite adventure.",
  "Your love is the greatest gift I've ever received.",
  "I cherish every memory we create together.",
  "You make ordinary moments extraordinary.",
  "My heart is yours, now and forever.",
  "I love the way you love me.",
  "You are my happy place.",
  "Together is my favorite place to be.",
  "You are the reason I believe in love.",
  "I would choose you again and again.",
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center gap-3">
          <Link
            href={`/spaces/${slug}`}
            className="p-2 rounded-full hover:bg-pink-50 text-gray-600 hover:text-pink-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Daily Love Messages</h1>
            <p className="text-gray-600">A daily dose of love and appreciation</p>
          </div>
        </div>
      }
    >
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Today's Message */}
        <div className="rounded-3xl bg-gradient-to-br from-pink-500 to-purple-600 p-8 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-pink-200" />
            <span className="text-sm font-medium text-pink-200">
              {new Date().toLocaleDateString('en-US', {
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
              <p className="mt-4 text-sm text-pink-200">
                — {todayMessage.author_id === user?.id ? 'You' : 'Your partner'}
              </p>
            </div>
          ) : (
            <div className="text-center py-4">
              <Heart className="h-12 w-12 text-pink-200 mx-auto mb-3" />
              <p className="text-lg text-pink-100">No message for today yet</p>
              <p className="text-sm text-pink-200 mt-1">
                Generate a love message to brighten your partner&apos;s day!
              </p>
            </div>
          )}

          <button
            onClick={generateMessage}
            disabled={generating}
            className="mt-6 flex items-center gap-2 rounded-full bg-white/20 backdrop-blur px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/30 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Generating...' : todayMessage ? 'Generate New Message' : 'Generate Message'}
          </button>
        </div>

        {/* History */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-pink-500" />
            Past Messages
          </h2>

          {history.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No messages yet</p>
          ) : (
            <div className="space-y-3">
              {history.map((msg) => (
                <div
                  key={msg.id}
                  className="rounded-2xl bg-white/80 backdrop-blur p-4 shadow-sm border border-white/70"
                >
                  <p className="text-gray-700 whitespace-pre-wrap">{msg.message}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-400">
                      {new Date(msg.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="text-xs text-pink-500">
                      {msg.author_id === user?.id ? 'From you' : 'From partner'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
