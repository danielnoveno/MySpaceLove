<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\LoveTimeline;
use App\Models\MediaGallery;
use App\Models\Countdown;
use App\Models\DailyMessage;
use App\Models\Space;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\RedirectResponse;
use Inertia\Response;

class DashboardController extends Controller
{
    public function redirect(): RedirectResponse
    {
        $space = Space::where(function ($query) {
            $query->where('user_one_id', Auth::id())
                ->orWhere('user_two_id', Auth::id());
        })->oldest()->first();

        if (!$space) {
            return redirect()->route('spaces.index');
        }

        return redirect()->route('spaces.dashboard', ['space' => $space->slug]);
    }

    public function show(Space $space): Response
    {
        $this->authorizeSpace($space);

        $timelineCount = LoveTimeline::where('space_id', $space->id)->count();
        $galleryCount = MediaGallery::where('space_id', $space->id)->count();

        $upcomingEvents = Countdown::where('space_id', $space->id)
            ->where('event_date', '>=', now())
            ->orderBy('event_date')
            ->get();

        // $upcomingEvents = $upcomingEvents->map(function ($event) {
        //     $event->days_left = now()->diffInDays($event->event_date);
        //     return $event;
        // })->where('days_left', '>=', 0);

        // if ($upcomingEvents->isEmpty()) {
        //     $upcomingEvents = collect([]);
        // }

        $recentMessages = DailyMessage::where('space_id', $space->id)
            ->orderBy('date', 'desc')
            ->limit(5)
            ->get();

        $dashboardData = [
            'timelineCount' => $timelineCount,
            'galleryCount' => $galleryCount,
            'upcomingEvents' => $upcomingEvents,
            'recentMessages' => $recentMessages,
        ];

        return Inertia::render('Dashboard', [
            'dashboardData' => $dashboardData,
            'spaceContext' => [
                'id' => $space->id,
                'slug' => $space->slug,
                'title' => $space->title,
                'has_partner' => $space->user_two_id !== null,
                'is_owner' => $space->user_one_id === Auth::id(),
            ],
        ]);
    }

    private function authorizeSpace(Space $space): void
    {
        if (!$space->hasMember(Auth::id())) {
            abort(403);
        }
    }
}
