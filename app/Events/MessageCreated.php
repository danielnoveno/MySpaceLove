<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageCreated implements ShouldBroadcast
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public Message $message;

    public function __construct(Message $message)
    {
        $this->message = $message->loadMissing('sender:id,name,profile_image');
    }

    public function broadcastOn(): Channel
    {
        return new PrivateChannel('spaces.' . $this->message->space_id . '.chat');
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->message->id,
            'space_id' => $this->message->space_id,
            'sender_user_id' => $this->message->sender_user_id,
            'type' => $this->message->type,
            'body' => $this->message->body,
            'meta_json' => $this->message->meta_json,
            'created_at' => optional($this->message->created_at)->toIso8601String(),
            'sender' => [
                'id' => $this->message->sender?->id,
                'name' => $this->message->sender?->name,
                'profile_photo_url' => $this->message->sender?->profile_photo_url ?? null,
            ],
        ];
    }
}
