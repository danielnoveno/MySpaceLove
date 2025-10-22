<?php

namespace App\Mail;

use App\Models\Space;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class SeparationCancelledMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Space $space,
        public User $initiator,
        public User $partner,
    ) {
    }

    public function build(): self
    {
        return $this->subject('Permintaan pembubaran Space dibatalkan')
            ->view('emails.separation_cancelled')
            ->with([
                'space' => $this->space,
                'initiator' => $this->initiator,
                'partner' => $this->partner,
                'spacesUrl' => url(route('spaces.index')),
                'appName' => config('app.name'),
            ]);
    }
}
