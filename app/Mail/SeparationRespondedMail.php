<?php

namespace App\Mail;

use App\Models\Space;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class SeparationRespondedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Space $space,
        public User $responder,
        public User $initiator,
        public string $decision,
        public ?string $reason = null,
    ) {
    }

    public function build(): self
    {
        $isApproved = $this->decision === 'approved';

        return $this->subject('Pasanganmu ' . ($isApproved ? 'menyetujui' : 'menolak') . ' pembubaran Space')
            ->view('emails.separation_responded')
            ->with([
                'space' => $this->space,
                'responder' => $this->responder,
                'initiator' => $this->initiator,
                'decision' => $this->decision,
                'reason' => $this->reason,
                'spacesUrl' => url(route('spaces.index')),
                'appName' => config('app.name'),
            ]);
    }
}
