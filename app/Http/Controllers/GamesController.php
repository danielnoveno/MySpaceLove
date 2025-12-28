<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\GameScore;
use App\Models\Space;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GamesController extends Controller
{
    public function index(Request $request): Response
    {
        $space = $this->resolveSpace($request);

        if ($space) {
            $request->attributes->set('currentSpace', $space);
        }

        $games = Game::query()
            ->where('is_enabled', true)
            ->get(['id', 'slug', 'name', 'description', 'supports_multiplayer']);

        $priority = [
            'pong-duet',
            'connect-four',
            'memory-match',
            'maze-escape',
            'couple-quiz',
            'tetris',
            'slither',
        ];

        $games = $games->sortBy(function (Game $game) use ($priority) {
            $index = array_search($game->slug, $priority, true);
            return $index === false ? 999 : $index;
        })->values();

        return Inertia::render('Games/Index', [
            'games' => $games->map(fn (Game $game): array => [
                'id' => $game->id,
                'slug' => $game->slug,
                'name' => $game->name,
                'description' => $game->description,
                'supports_multiplayer' => $game->supports_multiplayer,
            ])->values()->all(),
            'spaceSlug' => $space?->slug,
            'spaceGoalsRoute' => route('space.goals.index') . ($space?->slug ? '?space=' . $space->slug : ''),
            'spaceGoalsStoreRoute' => route('space.goals.store') . ($space?->slug ? '?space=' . $space->slug : ''),
        ]);
    }

    public function show(Request $request, string $slug)
    {
        $game = Game::query()
            ->where('slug', $slug)
            ->where('is_enabled', true)
            ->firstOrFail();

        $space = $this->resolveSpace($request);

        if (!$space) {
            return redirect()->route('spaces.index');
        }

        $request->attributes->set('currentSpace', $space);

        $spaceSlug = $space->slug;

        return Inertia::render('Games/Show', [
            'game' => [
                'id' => $game->id,
                'slug' => $game->slug,
                'name' => $game->name,
                'description' => $game->description,
                'supports_multiplayer' => $game->supports_multiplayer,
            ],
            'scoreRoute' => route('games.score', ['slug' => $game->slug]) . '?space=' . $spaceSlug,
            'leaderboardRoute' => route('games.leaderboard', ['slug' => $game->slug]) . '?space=' . $spaceSlug,
            'sessionRoute' => route('games.sessions.show', ['slug' => $game->slug, 'sessionId' => 'SESSION']) . '?space=' . $spaceSlug,
            'sessionMoveRoute' => route('games.sessions.move', ['slug' => $game->slug, 'sessionId' => 'SESSION']) . '?space=' . $spaceSlug,
        ]);
    }

    public function leaderboard(Request $request, string $slug)
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

        $baseQuery = GameScore::query()
            ->where('game_id', $game->id)
            ->where('space_id', $space->id);

        $leaderboard = (clone $baseQuery)
            ->with('user:id,name')
            ->orderByDesc('score')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn (GameScore $score): array => [
                'id' => $score->id,
                'user_id' => $score->user_id,
                'user_name' => $score->user?->name ?? 'Player',
                'score' => $score->score,
                'meta' => $score->meta,
                'created_at' => $score->created_at?->toIso8601String(),
            ])
            ->values();

        $personalBest = (clone $baseQuery)
            ->where('user_id', $user->id)
            ->max('score');

        $space->loadMissing(['userOne:id,name', 'userTwo:id,name']);
        $partnerId = $space->user_one_id === $user->id ? $space->user_two_id : $space->user_one_id;
        $partnerUser = $partnerId === $space->user_one_id ? $space->userOne : $space->userTwo;

        $partnerBest = null;

        if ($partnerId) {
            $partnerBest = (clone $baseQuery)
                ->where('user_id', $partnerId)
                ->max('score');
        }

        return response()->json([
            'scores' => $leaderboard,
            'personal_best' => $personalBest,
            'partner_best' => $partnerId ? [
                'user_id' => $partnerId,
                'user_name' => $partnerUser?->name ?? 'Partner',
                'score' => $partnerBest,
            ] : null,
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
