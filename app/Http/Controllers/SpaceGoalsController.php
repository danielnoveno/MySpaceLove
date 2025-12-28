<?php

namespace App\Http\Controllers;

use App\Models\Space;
use App\Models\SpaceGoal;
use Illuminate\Http\Request;

class SpaceGoalsController extends Controller
{
    public function index(Request $request)
    {
        $space = $this->resolveSpace($request);
        $user = $request->user();

        if (!$user || !$space || !$space->hasMember($user->id)) {
            abort(403);
        }

        $goals = SpaceGoal::query()
            ->where('space_id', $space->id)
            ->orderByDesc('is_active')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (SpaceGoal $goal): array => [
                'id' => $goal->id,
                'title' => $goal->title,
                'description' => $goal->description,
                'target_points' => $goal->target_points,
                'current_points' => $goal->current_points,
                'is_active' => $goal->is_active,
                'completed_at' => $goal->completed_at?->toIso8601String(),
                'is_completed' => $goal->isCompleted(),
                'meta' => $goal->meta,
            ]);

        return response()->json([
            'goals' => $goals,
        ]);
    }

    public function store(Request $request)
    {
        $space = $this->resolveSpace($request);
        $user = $request->user();

        if (!$user || !$space || !$space->hasMember($user->id)) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:500'],
            'target_points' => ['required', 'integer', 'min:1', 'max:1000000'],
        ]);

        $goal = SpaceGoal::create([
            'space_id' => $space->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'target_points' => $validated['target_points'],
            'current_points' => 0,
            'is_active' => true,
            'completed_at' => null,
        ]);

        return response()->json([
            'goal' => $goal,
        ], 201);
    }

    public function update(Request $request, SpaceGoal $goal)
    {
        $space = $this->resolveSpace($request);
        $user = $request->user();

        if (!$user || !$space || $goal->space_id !== $space->id || !$space->hasMember($user->id)) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:500'],
            'target_points' => ['required', 'integer', 'min:1', 'max:1000000'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $goal->update([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'target_points' => $validated['target_points'],
            'is_active' => $validated['is_active'] ?? $goal->is_active,
            'completed_at' => ($validated['is_active'] ?? $goal->is_active) ? null : ($goal->completed_at ?? now()),
        ]);

        return response()->json([
            'goal' => $goal,
        ]);
    }

    public function complete(Request $request, SpaceGoal $goal)
    {
        $space = $this->resolveSpace($request);
        $user = $request->user();

        if (!$user || !$space || $goal->space_id !== $space->id || !$space->hasMember($user->id)) {
            abort(403);
        }

        $goal->update([
            'is_active' => false,
            'completed_at' => now(),
        ]);

        return response()->json([
            'goal' => $goal,
        ]);
    }

    private function resolveSpace(Request $request): ?Space
    {
        $user = $request->user();

        if (!$user) {
            return null;
        }

        $currentSpace = $request->attributes->get('currentSpace');

        if ($currentSpace instanceof Space) {
            return $currentSpace;
        }

        $spaceSlug = $request->query('space');

        if ($spaceSlug) {
            $space = Space::where('slug', $spaceSlug)->first();

            if (!$space || !$space->hasMember($user->id)) {
                abort(403);
            }

            return $space;
        }

        return Space::query()
            ->where(function ($query) use ($user): void {
                $query->where('user_one_id', $user->id)
                    ->orWhere('user_two_id', $user->id);
            })
            ->oldest()
            ->first();
    }
}
