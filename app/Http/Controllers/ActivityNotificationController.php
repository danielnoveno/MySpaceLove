<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class ActivityNotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        abort_unless($user, 403);

        if (!Schema::hasTable('notifications')) {
            return Inertia::render('Notifications/Index', [
                'notifications' => [
                    'data' => [],
                    'links' => [],
                    'meta' => [
                        'total' => 0,
                    ],
                ],
                'filters' => [
                    'status' => 'all',
                ],
            ]);
        }

        $status = $request->query('status', 'all');
        $builder = $user->notifications()->latest();

        if ($status === 'unread') {
            $builder->whereNull('read_at');
        }

        $notifications = $builder
            ->paginate(10)
            ->withQueryString()
            ->through(function (DatabaseNotification $notification): array {
                return [
                    'id' => $notification->id,
                    'event' => data_get($notification->data, 'event'),
                    'title' => data_get($notification->data, 'title'),
                    'body' => data_get($notification->data, 'body'),
                    'data' => data_get($notification->data, 'data', []),
                    'read_at' => optional($notification->read_at)->toIso8601String(),
                    'created_at' => optional($notification->created_at)->toIso8601String(),
                ];
            });

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
            'filters' => [
                'status' => $status,
            ],
        ]);
    }

    public function markAsRead(Request $request, DatabaseNotification $notification): RedirectResponse
    {
        $user = $request->user();

        abort_unless($user, 403);

        if ($notification->notifiable_id !== $user->getKey() || $notification->notifiable_type !== $user::class) {
            abort(403);
        }

        if ($notification->read_at === null) {
            $notification->markAsRead();
        }

        return back()->with('status', __('app.notifications.flash.marked'));
    }

    public function markAllAsRead(Request $request): RedirectResponse
    {
        $user = $request->user();

        abort_unless($user, 403);

        if (!Schema::hasTable('notifications')) {
            return back();
        }

        $user->unreadNotifications->markAsRead();

        return back()->with('status', __('app.notifications.flash.marked_all'));
    }
}
