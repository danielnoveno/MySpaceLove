<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChatSent implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    public $user;
    public $message;
    public $roomId;

    public function __construct($roomId, $user, $message)
    {
        $this->roomId = $roomId;
        $this->user = $user;
        $this->message = $message;
    }

    public function broadcastOn()
    {
        return new Channel('room.' . $this->roomId);
    }
}
