import { useMemo, useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useTranslation } from "@/hooks/useTranslation";
import type { PageProps } from "@/types";
import { Bell, CheckCircle2, Inbox, MailOpen } from "lucide-react";

interface ActivityNotification {
    id: string;
    event?: string;
    title?: string | null;
    body?: string | null;
    data?: Record<string, unknown> | null;
    created_at?: string | null;
    read_at?: string | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface NotificationPageProps extends PageProps {
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

const formatLabel = (label: string): string => {
    return label
        .replace(/&laquo;|&raquo;/g, "")
        .replace(/&lsaquo;|&rsaquo;/g, "")
        .replace(/&nbsp;/g, " ")
        .trim();
};

export default function NotificationsIndex() {
    const { props } = usePage<NotificationPageProps>();
    const { notifications, filters = {}, status: flashStatus } = props;
    const activeFilter = filters.status ?? "all";
    const { translations } = useTranslation("notifications");
    const locale = (props.locale as string | undefined) ?? "en";

    const [processingId, setProcessingId] = useState<string | null>(null);
    const [processingAll, setProcessingAll] = useState(false);

    const unreadOnPage = useMemo(
        () => notifications.data.filter((item) => !item.read_at).length,
        [notifications.data],
    );

    const headerTitle = translations?.header?.title ?? "Activity center";
    const headerSubtitle =
        translations?.header?.subtitle ??
        "All of your shared moments and space updates live here.";
    const markAllLabel =
        translations?.actions?.mark_all_read ?? "Mark all as read";
    const filterAllLabel =
        translations?.actions?.filter_all ?? "All";
    const filterUnreadLabel =
        translations?.actions?.filter_unread ?? "Unread";
    const emptyTitle = translations?.empty?.title ?? "No notifications yet";
    const emptyBody =
        translations?.empty?.body ??
        "We will keep a running history of your activities here.";
    const markReadLabel =
        translations?.actions?.mark_read ?? "Mark as read";
    const openedLabelTemplate =
        translations?.view?.opened_at ?? "Opened :date";

    const dateFormatter = useMemo(
        () =>
            new Intl.DateTimeFormat(locale, {
                dateStyle: "medium",
                timeStyle: "short",
            }),
        [locale],
    );

    const handleFilterChange = (value: string) => {
        router.get(
            route("notifications.index"),
            { status: value },
            { preserveScroll: true, preserveState: true },
        );
    };

    const handleMarkAsRead = (notificationId: string) => {
        router.post(
            route("notifications.read", notificationId),
            {},
            {
                preserveScroll: true,
                onStart: () => setProcessingId(notificationId),
                onFinish: () => setProcessingId(null),
            },
        );
    };

    const handleMarkAll = () => {
        router.post(
            route("notifications.readAll"),
            {},
            {
                preserveScroll: true,
                onStart: () => setProcessingAll(true),
                onFinish: () => setProcessingAll(false),
            },
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
                            <Bell className="h-5 w-5 text-pink-500" aria-hidden="true" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">
                                {translations?.summary?.recent ?? "Recent activity"}
                            </p>
                            <p className="text-xs text-gray-500">
                                {translations?.summary?.unread_count
                                    ? translations.summary.unread_count.replace(
                                          ":count",
                                          String(unreadOnPage),
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
                            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                            {markAllLabel}
                        </button>
                    </div>
                </div>

                {notifications.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-pink-200 bg-white/60 p-12 text-center text-gray-500">
                        <Inbox className="h-12 w-12 text-pink-300" aria-hidden="true" />
                        <h3 className="text-lg font-semibold text-gray-700">
                            {emptyTitle}
                        </h3>
                        <p className="max-w-xl text-sm text-gray-500">{emptyBody}</p>
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
                                          dateFormatter.format(readAt),
                                      )
                                    : null;

                                const isProcessing = processingId === notification.id;

                                return (
                                    <li
                                        key={notification.id}
                                        className={`rounded-2xl border px-5 py-4 shadow-sm transition ${
                                            notification.read_at
                                                ? "border-gray-100 bg-white"
                                                : "border-pink-200 bg-pink-50/60"
                                        }`}
                                    >
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
                                                        {notification.title ?? "Activity update"}
                                                    </h3>
                                                </div>
                                                {notification.body && (
                                                    <p className="text-sm text-gray-600">
                                                        {notification.body}
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
                                                {!notification.read_at && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleMarkAsRead(notification.id)}
                                                        disabled={isProcessing}
                                                        className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white px-4 py-2 text-xs font-semibold text-pink-500 shadow-sm transition hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                                                        {markReadLabel}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        {notification.data && Object.keys(notification.data).length > 0 && (
                                            <div className="mt-3 rounded-xl bg-gray-50 px-4 py-3 text-xs text-gray-500">
                                                <pre className="whitespace-pre-wrap break-words">
                                                    {JSON.stringify(notification.data, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                        {notifications.links.length > 0 && (
                            <nav className="flex flex-wrap items-center justify-center gap-2 pt-2" aria-label="Pagination">
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
