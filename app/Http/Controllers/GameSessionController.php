<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\GameSession;
use App\Models\Space;
use Illuminate\Http\Request;

class GameSessionController extends Controller
{
    public function show(Request $request, string $slug, string $sessionId)
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

        $session = GameSession::query()
            ->where('game_id', $game->id)
            ->where('space_id', $space->id)
            ->where('session_id', $sessionId)
            ->first();

        if (!$session) {
            $session = GameSession::create([
                'game_id' => $game->id,
                'space_id' => $space->id,
                'session_id' => $sessionId,
                'created_by_user_id' => $user->id,
                'current_turn_user_id' => $user->id,
                'status' => 'active',
                'state' => $this->defaultState($game->slug, $space, $user->id),
            ]);
        }

        return response()->json([
            'session' => $this->serializeSession($session),
        ]);
    }

    public function move(Request $request, string $slug, string $sessionId)
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

        $session = GameSession::query()
            ->where('game_id', $game->id)
            ->where('space_id', $space->id)
            ->where('session_id', $sessionId)
            ->firstOrFail();

        if ($session->status !== 'active') {
            return response()->json([
                'session' => $this->serializeSession($session),
            ]);
        }

        $payload = $request->validate([
            'action' => ['required', 'string'],
            'column' => ['nullable', 'integer', 'min:0', 'max:6'],
            'prompt' => ['nullable', 'string', 'max:140'],
            'answer' => ['nullable', 'string', 'max:140'],
            'guess' => ['nullable', 'string', 'max:140'],
        ]);

        $state = $session->state ?? [];

        if ($game->slug === 'connect-four') {
            $state = $this->handleConnectFourMove($session, $user->id, $payload, $state);
        }

        if ($game->slug === 'couple-quiz') {
            $state = $this->handleCoupleQuizMove($session, $user->id, $payload, $state);
        }

        $session->state = $state;
        $session->save();

        return response()->json([
            'session' => $this->serializeSession($session),
        ]);
    }

    private function handleConnectFourMove(GameSession $session, int $userId, array $payload, array $state): array
    {
        if (($payload['action'] ?? '') !== 'drop') {
            return $state;
        }

        if (($state['current_turn_user_id'] ?? null) !== $userId) {
            return $state;
        }

        $column = $payload['column'] ?? null;
        if ($column === null) {
            return $state;
        }

        $board = $state['board'] ?? [];
        $players = $state['players'] ?? [];
        $playerIndex = array_search($userId, $players, true);

        if ($playerIndex === false) {
            return $state;
        }

        for ($row = count($board) - 1; $row >= 0; $row -= 1) {
            if (($board[$row][$column] ?? 0) === 0) {
                $board[$row][$column] = $playerIndex + 1;
                $state['board'] = $board;
                $state['last_move'] = ['row' => $row, 'column' => $column, 'user_id' => $userId];
                $state['moves'] = ($state['moves'] ?? 0) + 1;
                $state['current_turn_user_id'] = $this->nextPlayerId($players, $userId);
                $winner = $this->detectConnectFourWinner($board);
                if ($winner !== null) {
                    $state['winner'] = $players[$winner - 1] ?? null;
                    $session->status = 'completed';
                    $session->current_turn_user_id = null;
                } else {
                    $session->current_turn_user_id = $state['current_turn_user_id'];
                }
                return $state;
            }
        }

        return $state;
    }

    private function handleCoupleQuizMove(GameSession $session, int $userId, array $payload, array $state): array
    {
        $action = $payload['action'] ?? '';

        if (!isset($state['players'])) {
            return $state;
        }

        if ($action === 'ask' && ($state['phase'] ?? 'ask') === 'ask') {
            $state['prompt'] = $payload['prompt'] ?? '';
            $state['answer'] = $payload['answer'] ?? '';
            $state['asked_by'] = $userId;
            $state['phase'] = 'guess';
            $state['current_turn_user_id'] = $this->nextPlayerId($state['players'], $userId);
            $session->current_turn_user_id = $state['current_turn_user_id'];
        }

        if ($action === 'guess' && ($state['phase'] ?? '') === 'guess') {
            $state['guess'] = $payload['guess'] ?? '';
            $state['guessed_by'] = $userId;
            $state['phase'] = 'result';
            $state['is_match'] = $state['guess'] !== '' && strcasecmp($state['guess'], $state['answer'] ?? '') === 0;
            $state['rounds'] = ($state['rounds'] ?? 0) + 1;
            $state['current_turn_user_id'] = $this->nextPlayerId($state['players'], $userId);
            $session->current_turn_user_id = $state['current_turn_user_id'];
        }

        if ($action === 'reset') {
            $state['phase'] = 'ask';
            $state['prompt'] = '';
            $state['answer'] = '';
            $state['guess'] = '';
            $state['is_match'] = null;
            $state['asked_by'] = null;
            $state['guessed_by'] = null;
        }

        return $state;
    }

    private function detectConnectFourWinner(array $board): ?int
    {
        $rows = count($board);
        $cols = $rows > 0 ? count($board[0]) : 0;

        for ($row = 0; $row < $rows; $row += 1) {
            for ($col = 0; $col < $cols; $col += 1) {
                $player = $board[$row][$col] ?? 0;
                if ($player === 0) {
                    continue;
                }

                if ($col + 3 < $cols
                    && $player === ($board[$row][$col + 1] ?? 0)
                    && $player === ($board[$row][$col + 2] ?? 0)
                    && $player === ($board[$row][$col + 3] ?? 0)) {
                    return $player;
                }

                if ($row + 3 < $rows
                    && $player === ($board[$row + 1][$col] ?? 0)
                    && $player === ($board[$row + 2][$col] ?? 0)
                    && $player === ($board[$row + 3][$col] ?? 0)) {
                    return $player;
                }

                if ($row + 3 < $rows && $col + 3 < $cols
                    && $player === ($board[$row + 1][$col + 1] ?? 0)
                    && $player === ($board[$row + 2][$col + 2] ?? 0)
                    && $player === ($board[$row + 3][$col + 3] ?? 0)) {
                    return $player;
                }

                if ($row - 3 >= 0 && $col + 3 < $cols
                    && $player === ($board[$row - 1][$col + 1] ?? 0)
                    && $player === ($board[$row - 2][$col + 2] ?? 0)
                    && $player === ($board[$row - 3][$col + 3] ?? 0)) {
                    return $player;
                }
            }
        }

        return null;
    }

    private function defaultState(string $slug, Space $space, int $userId): array
    {
        $players = array_values(array_filter([$space->user_one_id, $space->user_two_id]));

        if ($slug === 'connect-four') {
            $board = array_fill(0, 6, array_fill(0, 7, 0));

            return [
                'board' => $board,
                'players' => $players,
                'current_turn_user_id' => $userId,
                'moves' => 0,
                'winner' => null,
                'last_move' => null,
            ];
        }

        if ($slug === 'couple-quiz') {
            return [
                'players' => $players,
                'phase' => 'ask',
                'prompt' => '',
                'answer' => '',
                'guess' => '',
                'is_match' => null,
                'rounds' => 0,
                'current_turn_user_id' => $userId,
            ];
        }

        return [
            'players' => $players,
            'current_turn_user_id' => $userId,
        ];
    }

    private function nextPlayerId(array $players, int $currentId): ?int
    {
        if (count($players) < 2) {
            return $currentId;
        }

        return $players[0] === $currentId ? $players[1] : $players[0];
    }

    private function serializeSession(GameSession $session): array
    {
        return [
            'id' => $session->id,
            'session_id' => $session->session_id,
            'status' => $session->status,
            'state' => $session->state,
            'current_turn_user_id' => $session->current_turn_user_id,
            'updated_at' => $session->updated_at?->toIso8601String(),
        ];
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
