<?php

namespace App\Http\Controllers\Api;

use App\Events\MessageCreated;
use App\Events\MessageRead as MessageReadEvent;
use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\MessageRead;
use App\Models\Space;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatMessageController extends Controller
{
    public function index(Request $request, Space $space): JsonResponse
    {
        $this->authorizeSpace($space);

        $messages = Message::query()
            ->with('sender:id,name,profile_image')
            ->where('space_id', $space->id)
            ->orderByDesc('id')
            ->paginate(
                perPage: (int) min(50, max(1, $request->integer('per_page', 25))),
                page: (int) max(1, $request->integer('page', 1))
            );

        return response()->json([
            'data' => $messages->items(),
            'pagination' => [
                'current_page' => $messages->currentPage(),
                'per_page' => $messages->perPage(),
                'next_page' => $messages->hasMorePages() ? $messages->currentPage() + 1 : null,
            ],
        ]);
    }

    public function store(Request $request, Space $space): JsonResponse
    {
        $this->authorizeSpace($space);

        $validated = $request->validate([
            'type' => ['nullable', 'string', 'max:30'],
            'body' => ['nullable', 'string', 'max:5000'],
            'meta' => ['nullable', 'array'],
        ]);

        $type = $validated['type'] ?? 'text';
        $body = $validated['body'] ?? '';

        if ($type === 'text' && trim($body) === '') {
            return response()->json(['error' => 'Message cannot be empty.'], 422);
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();

        $message = Message::create([
            'space_id' => $space->id,
            'sender_user_id' => $user->id,
            'type' => $type,
            'body' => $body,
            'meta_json' => $validated['meta'] ?? null,
        ]);

        broadcast(new MessageCreated($message))->toOthers();

        return response()->json([
            'message' => $message,
        ], 201);
    }

    public function markRead(Request $request, Space $space): JsonResponse
    {
        $this->authorizeSpace($space);

        $validated = $request->validate([
            'message_ids' => ['required', 'array'],
            'message_ids.*' => ['integer', 'min:1'],
        ]);

        $userId = (int) Auth::id();
        $messageIds = $validated['message_ids'];

        $messages = Message::query()
            ->where('space_id', $space->id)
            ->whereIn('id', $messageIds)
            ->get(['id', 'space_id']);

        foreach ($messages as $message) {
            $read = MessageRead::updateOrCreate(
                [
                    'message_id' => $message->id,
                    'user_id' => $userId,
                ],
                [
                    'read_at' => now(),
                ]
            );

            broadcast(new MessageReadEvent($read))->toOthers();
        }

        return response()->json(['status' => 'ok']);
    }

    private function authorizeSpace(Space $space): void
    {
        if (!$space->hasMember(Auth::id())) {
            abort(403);
        }
    }
}
