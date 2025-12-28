import { useMemo, useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useTranslation } from "@/hooks/useTranslation";
import type { PageProps, Space } from "@/types";
import { Bell, CheckCircle2, Inbox, MailOpen, Trash2 } from "lucide-react";

interface NotificationPayload {
    event?: string | null;
    title?: string | null;
    body?: string | null;
    message?: string | null;
    space_id?: string | number | null;
    daily_message_id?: string | number | null;
    data?: Record<string, unknown> | null;
    [key: string]: unknown;
}

interface ActivityNotification {
    id: string;
    type?: string;
    data?: NotificationPayload | null;
    created_at?: string | null;
    read_at?: string | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface NotificationPageProps extends PageProps {
    space: Space;
    notifications: {
        data: ActivityNotification[];
        links: PaginationLink[];
        meta?: {
            total?: number;
        };
    };
    filters?: {
        status?: string;
    };
    status?: string;
}

interface NotificationTranslations {
    header?: {
        title?: string;
        subtitle?: string;
    };
    actions?: {
        mark_all_read?: string;
        filter_all?: string;
        filter_unread?: string;
        mark_read?: string;
    };
    empty?: {
        title?: string;
        body?: string;
    };
    view?: {
        opened_at?: string;
    };
    meta?: {
        title?: string;
    };
    summary?: {
        recent?: string;
        unread_count?: string;
    };
    [key: string]: unknown;
}

const formatLabel = (label: string): string => {
    return label
        .replace(/&laquo;|&raquo;/g, "")
        .replace(/&lsaquo;|&rsaquo;/g, "")
        .replace(/&nbsp;/g, " ")
        .trim();
};

const humanizeKey = (key: string): string => {
    return key
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (match) => match.toUpperCase());
};

const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) {
        return "";
    }

    if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
    ) {
        return String(value);
    }

    return JSON.stringify(value);
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === "object" && value !== null && !Array.isArray(value);
};

export default function NotificationsIndex() {
    const { props } = usePage<NotificationPageProps>();
    const { notifications, filters = {}, status: flashStatus } = props;
    const activeFilter = filters.status ?? "all";
    const { translations } =
        useTranslation<NotificationTranslations>("notifications");
    const locale = (props.locale as string | undefined) ?? "en";
    const spaceSlug = props.space.slug;

    const [processingId, setProcessingId] = useState<string | null>(null);
    const [processingAll, setProcessingAll] = useState(false);
    const [selectedNotifications, setSelectedNotifications] = useState<string[]>(
        []
    );

    const unreadOnPage = useMemo(
        () => notifications.data.filter((item) => !item.read_at).length,
        [notifications.data]
    );

    const allNotificationsOnPage = useMemo(
        () => notifications.data.map((item) => item.id),
        [notifications.data]
    );

    const isAllSelected = useMemo(() => {
        if (notifications.data.length === 0) {
            return false;
        }
        return allNotificationsOnPage.every((id) =>
            selectedNotifications.includes(id)
        );
    }, [allNotificationsOnPage, selectedNotifications, notifications.data.length]);

    const headerTitle = translations?.header?.title ?? "Activity center";
    const headerSubtitle =
        translations?.header?.subtitle ??
        "All of your shared moments and space updates live here.";
    const markAllLabel =
        translations?.actions?.mark_all_read ?? "Mark all as read";
    const filterAllLabel = translations?.actions?.filter_all ?? "All";
    const filterUnreadLabel = translations?.actions?.filter_unread ?? "Unread";
    const emptyTitle = translations?.empty?.title ?? "No notifications yet";
    const emptyBody =
        translations?.empty?.body ??
        "We will keep a running history of your activities here.";
    const markReadLabel = translations?.actions?.mark_read ?? "Mark as read";
    const openedLabelTemplate = translations?.view?.opened_at ?? "Opened :date";

    const dateFormatter = useMemo(
        () =>
            new Intl.DateTimeFormat(locale, {
                dateStyle: "medium",
                timeStyle: "short",
            }),
        [locale]
    );

    const handleFilterChange = (value: string) => {
        router.get(
            route("spaces.notifications.index", { space: spaceSlug }),
            { status: value },
            { preserveScroll: true, preserveState: true }
        );
    };

    const handleMarkAsRead = (notificationId: string) => {
        router.post(
            route("spaces.notifications.read", {
                space: spaceSlug,
                notification: notificationId,
            }),
            {},
            {
                preserveScroll: true,
                onStart: () => setProcessingId(notificationId),
                onFinish: () => setProcessingId(null),
            }
        );
    };

    const handleMarkAll = () => {
        router.post(
            route("spaces.notifications.readAll", { space: spaceSlug }),
            {},
            {
                preserveScroll: true,
                onStart: () => setProcessingAll(true),
                onFinish: () => setProcessingAll(false),
            }
        );
    };

    const handleDelete = (notificationId: string) => {
        router.delete(
            route("spaces.notifications.destroy", {
                space: spaceSlug,
                notification: notificationId,
            }),
            {
                preserveScroll: true,
                onStart: () => setProcessingId(notificationId),
                onFinish: () => setProcessingId(null),
            }
        );
    };

    const handleToggleSelect = (notificationId: string) => {
        setSelectedNotifications((prevSelected) =>
            prevSelected.includes(notificationId)
                ? prevSelected.filter((id) => id !== notificationId)
                : [...prevSelected, notificationId]
        );
    };

    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelectedNotifications([]);
        } else {
            setSelectedNotifications(allNotificationsOnPage);
        }
    };

    const handleDeleteSelected = () => {
        if (selectedNotifications.length === 0) {
            return;
        }

        router.post(
            route("spaces.notifications.destroyMultiple", { space: spaceSlug }),
            { notifications: selectedNotifications },
            {
                preserveScroll: true,
                onStart: () => setProcessingAll(true),
                onFinish: () => {
                    setProcessingAll(false);
                    setSelectedNotifications([]);
                },
            }
        );
    };

    const pageTitle = translations?.meta?.title ?? "Activity notifications";

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-semibold text-gray-900">
                        {headerTitle}
                    </h2>
                    <p className="text-sm text-gray-500">{headerSubtitle}</p>
                </div>
            }
        >
            <Head title={pageTitle} />

            <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
                {flashStatus && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-sm">
                        {flashStatus}
                    </div>
                )}

                <div className="flex flex-col gap-3 rounded-2xl border border-pink-100 bg-white/90 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-pink-100">
                            <Bell
                                className="h-5 w-5 text-pink-500"
                                aria-hidden="true"
                            />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">
                                {translations?.summary?.recent ??
                                    "Recent activity"}
                            </p>
                            <p className="text-xs text-gray-500">
                                {translations?.summary?.unread_count
                                    ? translations.summary.unread_count.replace(
                                          ":count",
                                          String(unreadOnPage)
                                      )
                                    : `${unreadOnPage} unread`}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => handleFilterChange("all")}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                                activeFilter === "all"
                                    ? "bg-pink-500 text-white shadow"
                                    : "bg-white text-gray-600 hover:bg-pink-50"
                            }`}
                        >
                            {filterAllLabel}
                        </button>
                        <button
                            type="button"
                            onClick={() => handleFilterChange("unread")}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                                activeFilter === "unread"
                                    ? "bg-pink-500 text-white shadow"
                                    : "bg-white text-gray-600 hover:bg-pink-50"
                            }`}
                        >
                            {filterUnreadLabel}
                        </button>
                        <button
                            type="button"
                            onClick={handleMarkAll}
                            disabled={processingAll || unreadOnPage === 0}
                            className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white px-4 py-2 text-sm font-medium text-pink-500 shadow-sm transition hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <CheckCircle2
                                className="h-4 w-4"
                                aria-hidden="true"
                            />
                            {markAllLabel}
                        </button>
                        <button
                            type="button"
                            onClick={handleSelectAll}
                            disabled={notifications.data.length === 0}
                            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-500 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <input
                                type="checkbox"
                                checked={isAllSelected}
                                onChange={() => {}} // Handled by onClick
                                className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                            />
                            Select All
                        </button>
                        <button
                            type="button"
                            onClick={handleDeleteSelected}
                            disabled={
                                processingAll || selectedNotifications.length === 0
                            }
                            className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-500 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            Delete Selected ({selectedNotifications.length})
                        </button>
                    </div>
                </div>

                {notifications.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-pink-200 bg-white/60 p-12 text-center text-gray-500">
                        <Inbox
                            className="h-12 w-12 text-pink-300"
                            aria-hidden="true"
                        />
                        <h3 className="text-lg font-semibold text-gray-700">
                            {emptyTitle}
                        </h3>
                        <p className="max-w-xl text-sm text-gray-500">
                            {emptyBody}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <ul className="flex flex-col gap-4">
                            {notifications.data.map((notification) => {
                                const createdAt = notification.created_at
                                    ? new Date(notification.created_at)
                                    : null;
                                const readAt = notification.read_at
                                    ? new Date(notification.read_at)
                                    : null;

                                const formattedCreated = createdAt
                                    ? dateFormatter.format(createdAt)
                                    : "";
                                const formattedRead = readAt
                                    ? openedLabelTemplate.replace(
                                          ":date",
                                          dateFormatter.format(readAt)
                                      )
                                    : null;

                                const isProcessing =
                                    processingId === notification.id;
                                const payload = (notification.data ??
                                    {}) as NotificationPayload;
                                const nestedData =
                                    payload.data && isRecord(payload.data)
                                        ? payload.data
                                        : undefined;

                                const derivedTitle =
                                    (typeof payload.title === "string" &&
                                    payload.title.trim().length > 0
                                        ? payload.title.trim()
                                        : null) ??
                                    (typeof payload.event === "string" &&
                                    payload.event.trim().length > 0
                                        ? humanizeKey(payload.event)
                                        : null) ??
                                    "Activity update";

                                const derivedBody =
                                    (typeof payload.body === "string" &&
                                    payload.body.trim().length > 0
                                        ? payload.body.trim()
                                        : null) ??
                                    (typeof payload.message === "string" &&
                                    payload.message.trim().length > 0
                                        ? payload.message.trim()
                                        : null) ??
                                    null;

                                const actionButton =
                                    typeof payload.action_url === "string" &&
                                        payload.action_url.trim().length >
                                            0 && (
                                            <Link
                                                href={payload.action_url}
                                                className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white px-4 py-2 text-xs font-semibold text-pink-500 shadow-sm transition hover:bg-pink-50"
                                            >
                                                {typeof payload.action_label ===
                                                    "string" &&
                                                payload.action_label.trim()
                                                    .length > 0
                                                    ? payload.action_label
                                                    : "View Details"}
                                            </Link>
                                        );

                                const detailItems: {
                                    label: string;
                                    value: string;
                                }[] = [];

                                if (payload.event !== "Countdown.Created") {
                                    // Only process detailItems for non-Countdown.Created events
                                    if (
                                        payload.event === "timeline.created" ||
                                        payload.event === "timeline.updated"
                                    ) {
                                        if (
                                            typeof payload.timeline_title ===
                                                "string" &&
                                            payload.timeline_title.trim()
                                                .length > 0
                                        ) {
                                            detailItems.push({
                                                label: "Judul Momen",
                                                value: payload.timeline_title,
                                            });
                                        }
                                        if (
                                            typeof payload.timeline_date ===
                                                "string" &&
                                            payload.timeline_date.trim()
                                                .length > 0
                                        ) {
                                            try {
                                                const date = new Date(
                                                    payload.timeline_date
                                                );
                                                detailItems.push({
                                                    label: "Tanggal Momen",
                                                    value: dateFormatter.format(
                                                        date
                                                    ),
                                                });
                                            } catch (e) {
                                                // Fallback to raw value if date parsing fails
                                                detailItems.push({
                                                    label: "Tanggal Momen",
                                                    value: payload.timeline_date,
                                                });
                                            }
                                        }
                                    }

                                    if (
                                        typeof payload.event === "string" &&
                                        payload.event.trim().length > 0
                                    ) {
                                        detailItems.push({
                                            label: "Event",
                                            value: humanizeKey(payload.event),
                                        });
                                    }

                                    Object.entries(payload).forEach(
                                        ([key, value]) => {
                                            if (
                                                [
                                                    "title",
                                                    "body",
                                                    "message",
                                                    "event",
                                                    "space_id",
                                                    "daily_message_id",
                                                    "data",
                                                    "countdown_id",
                                                    "countdown_title",
                                                    "countdown_date",
                                                    "actor_id",
                                                    "actor_name",
                                                    "action_url",
                                                    "action_label",
                                                    "space_slug",
                                                    "status_message", // Added to exclude from generic details
                                                    "timeline_title", // Added to exclude from generic details
                                                    "timeline_date", // Added to exclude from generic details
                                                ].includes(key) ||
                                                value === null ||
                                                value === "" ||
                                                value === undefined
                                            ) {
                                                return;
                                            }

                                            const displayValue =
                                                formatValue(value);
                                            if (!displayValue) {
                                                return;
                                            }

                                            detailItems.push({
                                                label: humanizeKey(key),
                                                value: displayValue,
                                            });
                                        }
                                    );

                                    if (nestedData) {
                                        Object.entries(nestedData).forEach(
                                            ([key, value]) => {
                                                if (
                                                    value === null ||
                                                    value === "" ||
                                                    value === undefined
                                                ) {
                                                    return;
                                                }

                                                const displayValue =
                                                    formatValue(value);
                                                if (!displayValue) {
                                                    return;
                                                }

                                                detailItems.push({
                                                    label: humanizeKey(key),
                                                    value: displayValue,
                                                });
                                            }
                                        );
                                    }
                                }

                                return (
                                    <li
                                        key={notification.id}
                                        className={`rounded-2xl border px-5 py-4 shadow-sm transition ${
                                            notification.read_at
                                                ? "border-gray-100 bg-white"
                                                : "border-pink-200 bg-pink-50/60"
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedNotifications.includes(
                                                    notification.id
                                                )}
                                                onChange={() =>
                                                    handleToggleSelect(
                                                        notification.id
                                                    )
                                                }
                                                className="mt-1 h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                                            />
                                            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                <div className="flex flex-1 flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <MailOpen
                                                            className={`h-4 w-4 ${
                                                                notification.read_at
                                                                    ? "text-gray-300"
                                                                    : "text-pink-500"
                                                            }`}
                                                            aria-hidden="true"
                                                        />
                                                        <h3 className="text-base font-semibold text-gray-900">
                                                            {derivedTitle}
                                                        </h3>
                                                    </div>
                                                    {derivedBody && (
                                                        <p className="text-sm text-gray-600 whitespace-pre-line">
                                                            {derivedBody}
                                                        </p>
                                                    )}
                                                    {formattedRead && (
                                                        <p className="text-xs text-gray-400">
                                                            {formattedRead}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    {formattedCreated && (
                                                        <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                            {formattedCreated}
                                                        </span>
                                                    )}
                                                    <div className="flex items-center gap-2">
                                                        {actionButton}
                                                        {!notification.read_at && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleMarkAsRead(
                                                                        notification.id
                                                                    )
                                                                }
                                                                disabled={
                                                                    isProcessing
                                                                }
                                                                className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white px-4 py-2 text-xs font-semibold text-pink-500 shadow-sm transition hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-60"
                                                            >
                                                                <CheckCircle2
                                                                    className="h-4 w-4"
                                                                    aria-hidden="true"
                                                                />
                                                                {markReadLabel}
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    notification.id
                                                                )
                                                            }
                                                            disabled={
                                                                isProcessing
                                                            }
                                                            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-500 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                                                        >
                                                            <Trash2
                                                                className="h-4 w-4"
                                                                aria-hidden="true"
                                                            />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                        {notifications.links.length > 0 && (
                            <nav
                                className="flex flex-wrap items-center justify-center gap-2 pt-2"
                                aria-label="Pagination"
                            >
                                {notifications.links.map((link, index) => (
                                    <span key={`${link.label}-${index}`}>
                                        {link.url ? (
                                            <Link
                                                href={link.url}
                                                preserveScroll
                                                preserveState
                                                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                                                    link.active
                                                        ? "bg-pink-500 text-white shadow"
                                                        : "bg-white text-gray-600 hover:bg-pink-50"
                                                }`}
                                            >
                                                {formatLabel(link.label)}
                                            </Link>
                                        ) : (
                                            <span className="rounded-full px-4 py-2 text-sm text-gray-400">
                                                {formatLabel(link.label)}
                                            </span>
                                        )}
                                    </span>
                                ))}
                            </nav>
                        )}
                    </div>
                )}
            </section>
        </AuthenticatedLayout>
    );
}
