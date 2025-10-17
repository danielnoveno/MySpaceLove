<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class LocationShareMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public User $sender, public string $shareUrl)
    {
    }

    public function build(): self
    {
        return $this
            ->subject('Lokasi Terbaru dari ' . ($this->sender->name ?? 'Pasanganmu'))
            ->view('emails.location-share')
            ->with([
                'sender' => $this->sender,
                'shareUrl' => $this->shareUrl,
            ]);
    }
}
