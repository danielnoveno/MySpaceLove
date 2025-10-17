<?php

namespace App\Http\Controllers;

use App\Models\Space;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class SpaceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $userId = Auth::id();

        $spaces = Space::query()
            ->where(function ($query) use ($userId): void {
                $query->where('user_one_id', $userId)
                    ->orWhere('user_two_id', $userId);
            })
            ->orderByDesc('created_at')
            ->get(['id', 'slug', 'title', 'user_one_id', 'user_two_id'])
            ->map(fn (Space $space): array => [
                'id' => $space->id,
                'slug' => $space->slug,
                'title' => $space->title,
                'has_partner' => $space->user_two_id !== null,
            ])
            ->values();

        return Inertia::render('Spaces/Index', [
            'spaces' => $spaces,
        ]);
    }
}
