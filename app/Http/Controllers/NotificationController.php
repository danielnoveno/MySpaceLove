<?php

namespace App\Http\Controllers;

use App\Models\Space;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request, Space $space): Response
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $perPage = 10;
        $page = LengthAwarePaginator::resolveCurrentPage() ?: 1;

        $notifications = $user->notifications()
            ->latest()
            ->get()
            ->filter(function ($notification) use ($space) {
                return (int) data_get($notification->data, 'space_id') === (int) $space->id;
            })
            ->values();

        $paginated = new LengthAwarePaginator(
            $notifications->slice(($page - 1) * $perPage, $perPage)->values(),
            $notifications->count(),
            $perPage,
            $page,
            [
                'path' => $request->url(),
                'query' => $request->query(),
            ]
        );

        return Inertia::render('Notifications/Index', [
            'notifications' => $paginated,
            'space' => $space,
        ]);
    }

    public function markAsRead(Request $request, Space $space, string $notificationId): RedirectResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $notification = $user->notifications()->find($notificationId);

        if (
            $notification &&
            (int) data_get($notification->data, 'space_id') === (int) $space->id
        ) {
            $notification->markAsRead();
        }

        return back();
    }

    public function markAllAsRead(Request $request, Space $space): RedirectResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $user->unreadNotifications
            ->filter(fn ($notification) => (int) data_get($notification->data, 'space_id') === (int) $space->id)
            ->each->markAsRead();

        return back();
    }

    public function destroy(Request $request, Space $space, string $notificationId): RedirectResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $notification = $user->notifications()->find($notificationId);

        if (
            $notification &&
            (int) data_get($notification->data, 'space_id') === (int) $space->id
        ) {
            $notification->delete();
        }

        return back();
    }
}
