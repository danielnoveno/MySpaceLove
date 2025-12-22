<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NobarRoomMuted implements ShouldBroadcast
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public int $spaceId;
    public bool $muteAll;

    public function __construct(int $spaceId, bool $muteAll = true)
    {
        $this->spaceId = $spaceId;
        $this->muteAll = $muteAll;
    }

    public function broadcastOn(): Channel
    {
        return new PrivateChannel('spaces.' . $this->spaceId . '.nobar');
    }

    public function broadcastWith(): array
    {
        return [
            'mute_all' => $this->muteAll,
        ];
    }
}
