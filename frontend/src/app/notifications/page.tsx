'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  MessageCircle,
  UserPlus,
  Clock,
  Trash2,
  ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'

type Notification = {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  read: boolean
  data?: Record<string, unknown>
  created_at: string
}

const NOTIFICATION_ICONS: Record<string, typeof Bell> = {
  invitation: UserPlus,
  message: MessageCircle,
  reminder: Clock,
  default: Bell,
}

const NOTIFICATION_COLORS: Record<string, string> = {
  invitation: 'bg-purple-100 text-purple-600',
  message: 'bg-blue-100 text-blue-600',
  reminder: 'bg-yellow-100 text-yellow-600',
  default: 'bg-pink-100 text-pink-600',
}

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }
    if (user) fetchNotifications()
  }, [user, authLoading])

  const fetchNotifications = async () => {
    if (!user) return

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) setNotifications(data)
    setLoading(false)
  }

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllAsRead = async () => {
    if (!user) return
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false)

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

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
              href="/dashboard"
              className="p-2 rounded-full hover:bg-pink-50 text-gray-600 hover:text-pink-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 rounded-full bg-pink-50 px-4 py-2 text-sm font-medium text-pink-600 hover:bg-pink-100 transition-colors"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </button>
          )}
        </div>
      }
    >
      <div className="max-w-2xl mx-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-pink-100 text-pink-400 mb-4">
              <BellOff className="h-10 w-10" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No notifications</h2>
            <p className="text-gray-500">You&apos;re all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const Icon = NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.default
              const colorClass =
                NOTIFICATION_COLORS[notification.type] || NOTIFICATION_COLORS.default

              return (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 rounded-2xl p-4 transition-all ${
                    notification.read
                      ? 'bg-white/50 border border-white/70'
                      : 'bg-white/80 backdrop-blur border border-pink-100 shadow-sm'
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${colorClass}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            notification.read ? 'text-gray-600' : 'text-gray-900'
                          }`}
                        >
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">{notification.message}</p>
                      </div>
                      {!notification.read && (
                        <div className="h-2 w-2 shrink-0 rounded-full bg-pink-500 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(notification.created_at).toLocaleDateString()} at{' '}
                      {new Date(notification.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 rounded-full text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
