<?php

namespace App\Http\Controllers\Api;

use App\Events\NobarParticipantLeft;
use App\Events\NobarParticipantUpdated;
use App\Events\NobarRoomMuted;
use App\Http\Controllers\Controller;
use App\Models\NobarParticipant;
use App\Models\Space;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NobarSignalingController extends Controller
{
    public function index(Space $space): JsonResponse
    {
        $this->authorizeSpace($space);

        $participants = NobarParticipant::query()
            ->with('user:id,name,profile_photo_path')
            ->where('space_id', $space->id)
            ->orderByDesc('is_host')
            ->orderBy('id')
            ->get()
            ->map(fn (NobarParticipant $p): array => $this->serialize($p))
            ->values();

        return response()->json(['participants' => $participants]);
    }

    public function join(Request $request, Space $space): JsonResponse
    {
        $this->authorizeSpace($space);

        $validated = $request->validate([
            'audio_enabled' => ['nullable', 'boolean'],
            'video_enabled' => ['nullable', 'boolean'],
            'screen_sharing' => ['nullable', 'boolean'],
            'display_name' => ['nullable', 'string', 'max:120'],
            'status' => ['nullable', 'string', 'max:40'],
        ]);

        $userId = (int) Auth::id();
        $isFirst = NobarParticipant::where('space_id', $space->id)->count() === 0;

        $participant = NobarParticipant::updateOrCreate(
            [
                'space_id' => $space->id,
                'user_id' => $userId,
            ],
            [
                'display_name' => $validated['display_name'] ?? $request->user()?->name,
                'is_host' => $isFirst,
                'audio_enabled' => (bool) ($validated['audio_enabled'] ?? false),
                'video_enabled' => (bool) ($validated['video_enabled'] ?? false),
                'screen_sharing' => (bool) ($validated['screen_sharing'] ?? false),
                'status' => $validated['status'] ?? 'online',
                'last_seen_at' => now(),
            ]
        );

        broadcast(new NobarParticipantUpdated($participant))->toOthers();

        return response()->json(['participant' => $this->serialize($participant)]);
    }

    public function update(Request $request, Space $space): JsonResponse
    {
        $this->authorizeSpace($space);

        $validated = $request->validate([
            'audio_enabled' => ['nullable', 'boolean'],
            'video_enabled' => ['nullable', 'boolean'],
            'screen_sharing' => ['nullable', 'boolean'],
            'status' => ['nullable', 'string', 'max:40'],
        ]);

        $participant = NobarParticipant::where('space_id', $space->id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $participant->fill([
            'audio_enabled' => $validated['audio_enabled'] ?? $participant->audio_enabled,
            'video_enabled' => $validated['video_enabled'] ?? $participant->video_enabled,
            'screen_sharing' => $validated['screen_sharing'] ?? $participant->screen_sharing,
            'status' => $validated['status'] ?? $participant->status,
            'last_seen_at' => now(),
        ])->save();

        broadcast(new NobarParticipantUpdated($participant))->toOthers();

        return response()->json(['participant' => $this->serialize($participant)]);
    }

    public function leave(Space $space): JsonResponse
    {
        $this->authorizeSpace($space);

        $participant = NobarParticipant::where('space_id', $space->id)
            ->where('user_id', Auth::id())
            ->first();

        if ($participant) {
            $reason = 'left';
            $participant->delete();
            broadcast(new NobarParticipantLeft($participant, $reason))->toOthers();
        }

        return response()->json(['status' => 'ok']);
    }

    public function kick(Request $request, Space $space, NobarParticipant $participant): JsonResponse
    {
        $this->authorizeSpace($space);
        $this->ensureHost($space);

        if ($participant->space_id !== $space->id) {
            abort(403);
        }

        $participant->delete();
        broadcast(new NobarParticipantLeft($participant, 'kicked'))->toOthers();

        return response()->json(['status' => 'ok']);
    }

    public function muteAll(Space $space): JsonResponse
    {
        $this->authorizeSpace($space);
        $this->ensureHost($space);

        broadcast(new NobarRoomMuted($space->id, true))->toOthers();

        return response()->json(['status' => 'ok']);
    }

    private function authorizeSpace(Space $space): void
    {
        if (!$space->hasMember(Auth::id())) {
            abort(403);
        }
    }

    private function ensureHost(Space $space): void
    {
        $participant = NobarParticipant::where('space_id', $space->id)
            ->where('user_id', Auth::id())
            ->first();

        if (!$participant || !$participant->is_host) {
            abort(403, 'Host privileges required.');
        }
    }

    private function serialize(NobarParticipant $participant): array
    {
        return [
            'id' => $participant->id,
            'space_id' => $participant->space_id,
            'user_id' => $participant->user_id,
            'display_name' => $participant->display_name,
            'is_host' => $participant->is_host,
            'audio_enabled' => $participant->audio_enabled,
            'video_enabled' => $participant->video_enabled,
            'screen_sharing' => $participant->screen_sharing,
            'status' => $participant->status,
            'last_seen_at' => optional($participant->last_seen_at)->toIso8601String(),
            'user' => [
                'id' => $participant->user?->id,
                'name' => $participant->user?->name,
                'profile_photo_url' => $participant->user?->profile_photo_url ?? null,
            ],
        ];
    }
}
