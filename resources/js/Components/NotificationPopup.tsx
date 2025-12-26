import { Link, router } from '@inertiajs/react';
import { Bell, Check, Inbox, MailOpen, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface NotificationData {
    title?: string;
    event?: string;
    body?: string;
    message?: string;
    action_url?: string;
    [key: string]: any;
}

interface Notification {
    id: string;
    read_at: string | null;
    created_at: string;
    data: NotificationData;
}

interface NotificationPopupProps {
    spaceSlug: string;
    unreadCount?: number;
    translations?: {
        actions?: {
            view_all?: string;
            mark_all_read?: string;
            mark_read?: string;
            delete?: string;
        };
        dropdown?: {
            no_notifications?: string;
            no_notifications_desc?: string;
        };
        [key: string]: any;
    };
}

export default function NotificationPopup({ 
    spaceSlug, 
    unreadCount = 0,
    translations = {} 
}: NotificationPopupProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);

    const t = {
        viewAll: translations?.actions?.view_all ?? 'View All Notifications',
        markAllRead: translations?.actions?.mark_all_read ?? 'Mark all as read',
        markRead: translations?.actions?.mark_read ?? 'Mark as read',
        delete: translations?.actions?.delete ?? 'Delete notification',
        noNotifications: translations?.dropdown?.no_notifications ?? 'No notifications',
        noNotificationsDesc: translations?.dropdown?.no_notifications_desc ?? 'You\'re all caught up!',
    };

    // Fetch recent notifications on mount
    useEffect(() => {
        if (spaceSlug) {
            setLoading(true);
            fetch(route('spaces.notifications.recent', { space: spaceSlug }))
                .then(res => res.json())
                .then((data: { notifications: Notification[] }) => {
                    setNotifications(data.notifications || []);
                })
                .catch(err => {
                    console.error('Failed to fetch notifications:', err);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [spaceSlug]);

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return new Intl.DateTimeFormat('en', { 
            month: 'short', 
            day: 'numeric' 
        }).format(date);
    };

    const getNotificationTitle = (notification: Notification) => {
        const data = notification.data || {};
        return data.title || data.event?.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Notification';
    };

    const getNotificationBody = (notification: Notification) => {
        const data = notification.data || {};
        return data.body || data.message || '';
    };

    const truncateText = (text: string, maxLength = 60) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const handleMarkAsReadAction = (e: React.MouseEvent, notification: Notification) => {
        e.preventDefault();
        e.stopPropagation();

        if (notification.read_at) return;

        // Optimistic update
        setNotifications(prevNotifications => 
            prevNotifications.map(n => 
                n.id === notification.id 
                    ? { ...n, read_at: new Date().toISOString() }
                    : n
            )
        );

        router.post(
            route('spaces.notifications.read', {
                space: spaceSlug,
                notification: notification.id,
            }),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                onError: () => {
                    // Revert on error
                    setNotifications(prevNotifications => 
                        prevNotifications.map(n => 
                            n.id === notification.id 
                                ? { ...n, read_at: null }
                                : n
                        )
                    );
                }
            }
        );
    };

    const handleDeleteAction = (e: React.MouseEvent, notification: Notification) => {
        e.preventDefault();
        e.stopPropagation();

        const previousNotifications = [...notifications];
        setNotifications(prevNotifications => 
            prevNotifications.filter(n => n.id !== notification.id)
        );

        router.delete(
            route('spaces.notifications.destroy', {
                space: spaceSlug,
                notification: notification.id,
            }),
            {
                preserveState: true,
                preserveScroll: true,
                onError: () => {
                   setNotifications(previousNotifications);
                }
            }
        );
    };

    const handleNotificationClick = (notification: Notification, actionUrl?: string) => {
        const isUnread = !notification.read_at;
        
        if (isUnread) {
            setNotifications(prevNotifications => 
                prevNotifications.map(n => 
                    n.id === notification.id 
                        ? { ...n, read_at: new Date().toISOString() }
                        : n
                )
            );

            router.post(
                route('spaces.notifications.read', {
                    space: spaceSlug,
                    notification: notification.id,
                }),
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        if (actionUrl) {
                            router.visit(actionUrl);
                        }
                    },
                    onError: () => {
                        setNotifications(prevNotifications => 
                            prevNotifications.map(n => 
                                n.id === notification.id 
                                    ? { ...n, read_at: null }
                                    : n
                            )
                        );
                    }
                }
            );
        } else {
            if (actionUrl) {
                router.visit(actionUrl);
            }
        }
    };

    return (
        <div className="w-80 sm:w-96 max-h-[calc(100vh-100px)] flex flex-col bg-white rounded-2xl shadow-xl ring-1 ring-black ring-opacity-5 overflow-hidden">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-pink-50 to-purple-50 px-4 py-3 border-b border-pink-100 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <Bell className="h-4 w-4 text-pink-500" />
                        Notifications
                    </h3>
                    {unreadCount > 0 && (
                        <span className="text-xs font-medium text-pink-600 bg-pink-100 px-2 py-1 rounded-full">
                            {unreadCount} new
                        </span>
                    )}
                </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1 overscroll-contain">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <Inbox className="h-12 w-12 text-gray-300 mb-3" />
                        <p className="text-sm font-medium text-gray-700">{t.noNotifications}</p>
                        <p className="text-xs text-gray-500 mt-1">{t.noNotificationsDesc}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {notifications.map((notification) => {
                            const isUnread = !notification.read_at;
                            const title = getNotificationTitle(notification);
                            const body = getNotificationBody(notification);
                            const actionUrl = notification.data?.action_url;

                            return (
                                <div
                                    role="button"
                                    tabIndex={0}
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification, actionUrl)}
                                    className={`group relative px-4 py-3 transition-colors duration-150 cursor-pointer ${
                                        isUnread 
                                            ? 'bg-pink-50/50 hover:bg-pink-100/50' 
                                            : 'bg-white hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`mt-0.5 ${isUnread ? 'text-pink-500' : 'text-gray-300'}`}>
                                            <MailOpen className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0 pr-8">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={`text-sm font-medium ${
                                                    isUnread ? 'text-gray-900' : 'text-gray-600'
                                                }`}>
                                                    {truncateText(title, 35)}
                                                </p>
                                                {isUnread && (
                                                    <span className="flex-shrink-0 w-2 h-2 bg-pink-500 rounded-full mt-1.5"></span>
                                                )}
                                            </div>
                                            {body && (
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                    {truncateText(body, 80)}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-400 mt-1">
                                                {formatDate(notification.created_at)}
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-1 items-end pl-2">
                                            {isUnread && (
                                                <button
                                                    onClick={(e) => handleMarkAsReadAction(e, notification)}
                                                    className="p-1 rounded-full text-gray-400 hover:text-pink-600 hover:bg-pink-100 transition-colors"
                                                    title={t.markRead}
                                                >
                                                    <Check className="h-4 w-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => handleDeleteAction(e, notification)}
                                                className="p-1 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-100 transition-colors"
                                                title={t.delete}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
                <div className="sticky bottom-0 z-10 bg-white border-t border-gray-100 px-4 py-3 flex-shrink-0">
                    <Link
                        href={route('spaces.notifications.index', { space: spaceSlug })}
                        className="block w-full text-center text-sm font-medium text-pink-600 hover:text-pink-700 py-2 rounded-lg hover:bg-pink-50 transition-colors duration-150"
                    >
                        {t.viewAll}
                    </Link>
                </div>
            )}
        </div>
    );
}
