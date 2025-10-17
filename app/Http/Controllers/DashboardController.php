<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\LoveTimeline;
use App\Models\MediaGallery;
use App\Models\Countdown;
use App\Models\DailyMessage;
use App\Models\Space;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index()
    {
        $space = Space::where(function ($query) {
            $query->where('user_one_id', Auth::id())
                ->orWhere('user_two_id', Auth::id());
        })->first();

        if (!$space) {
            $dashboardData = [
                'timelineCount' => 0,
                'galleryCount' => 0,
                'upcomingEvents' => [],
                'recentMessages' => [],
            ];
            return Inertia::render('Dashboard', [
                'dashboardData' => $dashboardData,
            ]);
        }

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
            'spaceId' => $space->id,
        ]);
    }
}
