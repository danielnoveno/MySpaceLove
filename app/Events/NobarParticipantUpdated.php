<?php

namespace App\Events;

use App\Models\NobarParticipant;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NobarParticipantUpdated implements ShouldBroadcast
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public NobarParticipant $participant;

    public function __construct(NobarParticipant $participant)
    {
        $this->participant = $participant->loadMissing('user:id,name,profile_image');
    }

    public function broadcastOn(): Channel
    {
        return new PrivateChannel('spaces.' . $this->participant->space_id . '.nobar');
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->participant->id,
            'space_id' => $this->participant->space_id,
            'user_id' => $this->participant->user_id,
            'display_name' => $this->participant->display_name,
            'is_host' => $this->participant->is_host,
            'audio_enabled' => $this->participant->audio_enabled,
            'video_enabled' => $this->participant->video_enabled,
            'screen_sharing' => $this->participant->screen_sharing,
            'status' => $this->participant->status,
            'last_seen_at' => optional($this->participant->last_seen_at)->toIso8601String(),
            'user' => [
                'id' => $this->participant->user?->id,
                'name' => $this->participant->user?->name,
                'profile_photo_url' => $this->participant->user?->profile_photo_url ?? null,
            ],
        ];
    }
}
