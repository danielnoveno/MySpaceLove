<?php

namespace App\Events;

use App\Models\NobarParticipant;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NobarParticipantLeft implements ShouldBroadcast
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public int $participantId;
    public int $spaceId;
    public int $userId;
    public string $reason;

    public function __construct(NobarParticipant $participant, string $reason = 'left')
    {
        $this->participantId = $participant->id;
        $this->spaceId = $participant->space_id;
        $this->userId = $participant->user_id;
        $this->reason = $reason;
    }

    public function broadcastOn(): Channel
    {
        return new PrivateChannel('spaces.' . $this->spaceId . '.nobar');
    }

    public function broadcastWith(): array
    {
        return [
            'participant_id' => $this->participantId,
            'user_id' => $this->userId,
            'reason' => $this->reason,
        ];
    }
}
