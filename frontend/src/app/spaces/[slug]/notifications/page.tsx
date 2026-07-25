'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useSpaces } from '@/lib/hooks/useSpaces'
import { useNotifications, Notification } from '@/lib/hooks/useNotifications'
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

type DisplayNotification = {
  id: string
  user_id: string
  space_id: string | null
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

function toDisplay(n: Notification): DisplayNotification {
  const d = n.data as Record<string, unknown> | null
  return {
    id: n.id,
    user_id: n.user_id,
    space_id: n.space_id,
    type: n.type,
    title: (d?.title as string) || n.type,
    message: (d?.message as string) || '',
    read: !!n.read_at,
    data: n.data ?? undefined,
    created_at: n.created_at,
  }
}

export default function SpaceNotificationsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string

  const { spaces, loading: spacesLoading } = useSpaces()

  const {
    notifications: rawNotifications,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteNotifications,
  } = useNotifications()

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isSelecting, setIsSelecting] = useState(false)

  const notifications = rawNotifications.map(toDisplay)
  const unreadCount = notifications.filter((n) => !n.read).length

  const space = spaces.find((s) => s.slug === slug)
  const spaceId = space?.id?.toString() ?? null

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }
    if (!spacesLoading && slug && spaces.length > 0 && !space) {
      router.push('/spaces')
      return
    }
    if (user && spaceId) {
      fetchNotifications(user.id, spaceId)
    }
  }, [user, authLoading, spacesLoading, slug, spaces, space, spaceId, fetchNotifications, router])

  const handleMarkAllRead = useCallback(async () => {
    if (!user || !spaceId) return
    await markAllAsRead(user.id, spaceId)
    await fetchNotifications(user.id, spaceId)
  }, [user, spaceId, markAllAsRead, fetchNotifications])

  const handleMarkAsRead = useCallback(async (id: string) => {
    await markAsRead(id)
  }, [markAsRead])

  const handleDelete = useCallback(async (id: string) => {
    await deleteNotification(id)
  }, [deleteNotification])

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(notifications.map((n) => n.id)))
  }, [notifications])

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const deleteSelected = useCallback(async () => {
    if (selectedIds.size === 0) return
    await deleteNotifications(Array.from(selectedIds))
    setSelectedIds(new Set())
    setIsSelecting(false)
  }, [selectedIds, deleteNotifications])

  if (authLoading || loading || spacesLoading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
        </div>
      </AuthenticatedLayout>
    )
  }

  if (!space) return null

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
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600">
                {space.title} — {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isSelecting && selectedIds.size > 0 && (
              <button
                onClick={deleteSelected}
                className="flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete ({selectedIds.size})
              </button>
            )}
            {isSelecting ? (
              <button
                onClick={() => {
                  setIsSelecting(false)
                  deselectAll()
                }}
                className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            ) : (
              <button
                onClick={() => setIsSelecting(true)}
                className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Select
              </button>
            )}
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-2 rounded-full bg-pink-50 px-4 py-2 text-sm font-medium text-pink-600 hover:bg-pink-100 transition-colors"
              >
                <CheckCheck className="h-4 w-4" />
                Mark all read
              </button>
            )}
          </div>
        </div>
      }
    >
      <div className="max-w-2xl mx-auto">
        {error && (
          <div className="mb-4 rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {isSelecting && notifications.length > 0 && (
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={selectAll}
              className="text-sm text-pink-600 hover:text-pink-700 font-medium"
            >
              Select all
            </button>
            <button
              onClick={deselectAll}
              className="text-sm text-gray-500 hover:text-gray-700 font-medium"
            >
              Deselect all
            </button>
          </div>
        )}

        {notifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-pink-100 text-pink-400 mb-4">
              <BellOff className="h-10 w-10" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No notifications</h2>
            <p className="text-gray-500">No notifications for this space yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const Icon = NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.default
              const colorClass =
                NOTIFICATION_COLORS[notification.type] || NOTIFICATION_COLORS.default
              const isSelected = selectedIds.has(notification.id)

              return (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 rounded-2xl p-4 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-pink-50 border-2 border-pink-300'
                      : notification.read
                        ? 'bg-white/50 border border-white/70'
                        : 'bg-white/80 backdrop-blur border border-pink-100 shadow-sm'
                  }`}
                  onClick={() => isSelecting && toggleSelect(notification.id)}
                >
                  {isSelecting && (
                    <div className="mt-1 shrink-0">
                      <div
                        className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-pink-500 border-pink-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                    </div>
                  )}

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

                  {!isSelecting && (
                    <div className="flex items-center gap-1 shrink-0">
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMarkAsRead(notification.id)
                          }}
                          className="p-2 rounded-full text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(notification.id)
                        }}
                        className="p-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  )
}
