<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\LoveTimeline;
use App\Models\MediaGallery;
use App\Models\Countdown;
use App\Models\DailyMessage;
use App\Models\Space;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\RedirectResponse;
use Inertia\Response;

class DashboardController extends Controller
{
    public function redirect(): RedirectResponse
    {
        $userId = Auth::id();
        
        // Cache user's first space for 10 minutes
        $space = Cache::remember("user.{$userId}.first_space", 600, function () use ($userId) {
            return Space::where(function ($query) use ($userId) {
                $query->where('user_one_id', $userId)
                    ->orWhere('user_two_id', $userId);
            })
            ->select(['id', 'slug'])
            ->oldest()
            ->first();
        });

        if (!$space) {
            return redirect()->route('spaces.index');
        }

        return redirect()->route('spaces.dashboard', ['space' => $space->slug]);
    }

    public function show(Space $space): Response
    {
        $this->authorizeSpace($space);

        // Cache dashboard data for 30 minutes
        $cacheKey = "dashboard.space.{$space->id}";
        $dashboardData = Cache::remember($cacheKey, 1800, function () use ($space) {
            return [
                'timelineCount' => LoveTimeline::where('space_id', $space->id)->count(),
                'galleryCount' => MediaGallery::where('space_id', $space->id)->count(),
                'upcomingEvents' => Countdown::where('space_id', $space->id)
                    ->where('event_date', '>=', now())
                    ->orderBy('event_date')
                    ->select(['id', 'title', 'event_date', 'description'])
                    ->get(),
                'recentMessages' => DailyMessage::where('space_id', $space->id)
                    ->orderBy('date', 'desc')
                    ->limit(5)
                    ->select(['id', 'title', 'message', 'date'])
                    ->get(),
            ];
        });

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
