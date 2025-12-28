<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\GameScore;
use App\Models\Space;
use App\Models\SpaceGoal;
use Illuminate\Http\Request;

class GameScoreController extends Controller
{
    public function store(Request $request, string $slug)
    {
        $user = $request->user();
        $space = $this->resolveSpace($request);

        if (!$user || !$space || !$space->hasMember($user->id)) {
            abort(403);
        }

        $game = Game::query()
            ->where('slug', $slug)
            ->where('is_enabled', true)
            ->firstOrFail();

        $validated = $request->validate([
            'score' => ['required', 'integer', 'min:0', 'max:1000000'],
            'meta' => ['nullable', 'array'],
        ]);

        $score = GameScore::create([
            'game_id' => $game->id,
            'user_id' => $user->id,
            'space_id' => $space->id,
            'score' => $validated['score'],
            'meta' => $validated['meta'] ?? null,
        ]);

        $activeGoals = SpaceGoal::query()
            ->where('space_id', $space->id)
            ->where('is_active', true)
            ->get();

        foreach ($activeGoals as $goal) {
            $newPoints = $goal->current_points + $validated['score'];
            $updates = ['current_points' => $newPoints];

            if ($newPoints >= $goal->target_points) {
                $updates['is_active'] = false;
                $updates['completed_at'] = now();
                // Clamp to target for cleaner UI
                $updates['current_points'] = $goal->target_points;
            }

            $goal->update($updates);
        }

        return response()->json([
            'id' => $score->id,
        ], 201);
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
