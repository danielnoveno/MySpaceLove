<?php

namespace App\Events;

use App\Models\MessageRead as MessageReadModel;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageRead implements ShouldBroadcast
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public MessageReadModel $read;

    public function __construct(MessageReadModel $read)
    {
        $this->read = $read;
    }

    public function broadcastOn(): Channel
    {
        return new PrivateChannel('spaces.' . $this->read->message->space_id . '.chat');
    }

    public function broadcastWith(): array
    {
        return [
            'message_id' => $this->read->message_id,
            'user_id' => $this->read->user_id,
            'read_at' => optional($this->read->read_at)->toIso8601String(),
        ];
    }
}
