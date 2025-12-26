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

        $status = $request->input('status', 'all');

        $query = $user->notifications();

        if ($status === 'unread') {
            $query = $user->unreadNotifications();
        }

        $notifications = $query
            ->latest()
            ->get()
            ->filter(function ($notification) use ($space) {
                $data = $notification->data;
                // Check for direct 'space_id' (Gallery/Journal) or nested 'meta.space_id' (Timeline via ActivityLogged)
                $spaceId = (int) ($data['space_id'] ?? data_get($data, 'meta.space_id'));

                return $spaceId === (int) $space->id;
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
            'filters' => [
                'status' => $status,
            ],
        ]);
    }

    public function recent(Request $request, Space $space)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $notifications = $user->notifications()
            ->latest()
            ->take(50) // Take more initially to filter
            ->get()
            ->filter(function ($notification) use ($space) {
                $data = $notification->data;
                $spaceId = (int) ($data['space_id'] ?? data_get($data, 'meta.space_id'));
                return $spaceId === (int) $space->id;
            })
            ->take(5) // Return only 5 most recent for dropdown
            ->values();

        return response()->json([
            'notifications' => $notifications,
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

    public function destroyMultiple(Request $request, Space $space): RedirectResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $notificationIds = $request->input('notifications', []);

        $user->notifications()
            ->whereIn('id', $notificationIds)
            ->get()
            ->filter(fn ($notification) => (int) data_get($notification->data, 'space_id') === (int) $space->id)
            ->each->delete();

        return back();
    }
}
