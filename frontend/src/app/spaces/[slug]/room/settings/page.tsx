'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft,
  Loader2,
  Check,
  Palette,
  UserPlus,
  Bell,
  Save,
} from 'lucide-react'

const THEMES = [
  { id: 'default', name: 'Default', color: 'from-pink-400 to-purple-400' },
  { id: 'ocean', name: 'Ocean', color: 'from-blue-400 to-cyan-400' },
  { id: 'sunset', name: 'Sunset', color: 'from-orange-400 to-pink-400' },
  { id: 'forest', name: 'Forest', color: 'from-green-400 to-emerald-400' },
  { id: 'night', name: 'Night', color: 'from-indigo-400 to-purple-500' },
  { id: 'cherry', name: 'Cherry', color: 'from-red-400 to-pink-500' },
]

export default function RoomSettingsPage() {
  const params = useParams()
  const slug = params.slug as string
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [roomName, setRoomName] = useState('')
  const [theme, setTheme] = useState('default')
  const [autoInvite, setAutoInvite] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [roomId, setRoomId] = useState<string | null>(null)

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
          router.push('/dashboard')
          return
        }

        const { data: roomData } = await supabase
          .from('rooms')
          .select('*')
          .eq('space_id', space.id)
          .single()

        if (roomData) {
          setRoomId(roomData.id)
          setRoomName(roomData.name || '')
          setTheme(roomData.theme || 'default')
          setAutoInvite(roomData.auto_invite || false)
          setNotifications(roomData.notifications !== false)
        }

        setLoading(false)
      })()
    }
  }, [user, authLoading, router, slug, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!roomId) return
    if (!roomName.trim()) {
      setError('Please enter a room name.')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    const { error: updateError } = await supabase
      .from('rooms')
      .update({
        name: roomName.trim(),
        theme,
        auto_invite: autoInvite,
        notifications,
      })
      .eq('id', roomId)

    if (updateError) {
      setError('Failed to save settings. Please try again.')
      setSaving(false)
      return
    }

    setSuccess('Settings saved successfully!')
    setSaving(false)
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
        <div className="flex items-center gap-4">
          <Link
            href={`/spaces/${slug}/room`}
            className="p-2 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Room Settings</h1>
            <p className="text-gray-600">Configure your shared room</p>
          </div>
        </div>
      }
    >
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-2xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          {/* Room Name */}
          <div className="rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/70 p-6">
            <label
              htmlFor="roomName"
              className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
            >
              <Save className="h-4 w-4 text-pink-500" />
              Room Name
            </label>
            <input
              id="roomName"
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="e.g. Our Room, Date Night, etc."
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
            />
          </div>

          {/* Theme / Background */}
          <div className="rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/70 p-6">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-4">
              <Palette className="h-4 w-4 text-pink-500" />
              Theme
            </label>
            <div className="grid grid-cols-3 gap-3">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id)}
                  className={`flex flex-col items-center gap-2 rounded-2xl p-4 transition-all ${
                    theme === t.id
                      ? 'ring-2 ring-pink-500 bg-pink-50'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div
                    className={`h-10 w-10 rounded-full bg-gradient-to-br ${t.color}`}
                  />
                  <span className="text-xs font-medium text-gray-700">
                    {t.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Auto-Invite Partner */}
          <div className="rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/70 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserPlus className="h-5 w-5 text-pink-500" />
                <div>
                  <p className="font-medium text-gray-900">
                    Auto-Invite Partner
                  </p>
                  <p className="text-sm text-gray-500">
                    Automatically add your partner when the room is activated
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAutoInvite(!autoInvite)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoInvite ? 'bg-pink-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoInvite ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="rounded-3xl bg-white/80 backdrop-blur shadow-sm border border-white/70 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-pink-500" />
                <div>
                  <p className="font-medium text-gray-900">
                    Notifications
                  </p>
                  <p className="text-sm text-gray-500">
                    Get notified about room activity
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNotifications(!notifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications ? 'bg-pink-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3">
            <Link
              href={`/spaces/${slug}/room`}
              className="rounded-xl px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AuthenticatedLayout>
  )
}
