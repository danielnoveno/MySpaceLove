<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

use Illuminate\Contracts\Queue\ShouldQueue;

class LocationShared extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $sender,
        public User $recipient,
        public string $shareUrl,
        public float $latitude,
        public float $longitude,
    ) {
    }

    public function build(): self
    {
        return $this->subject('Lokasi Terbaru dari ' . $this->sender->name)
            ->view('emails.location_shared')
            ->with([
                'sender' => $this->sender,
                'recipient' => $this->recipient,
                'shareUrl' => $this->shareUrl,
                'latitude' => $this->latitude,
                'longitude' => $this->longitude,
            ]);
    }
}
