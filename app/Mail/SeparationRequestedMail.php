<?php

namespace App\Mail;

use App\Models\Space;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

use Illuminate\Contracts\Queue\ShouldQueue;

class SeparationRequestedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public Space $space,
        public User $initiator,
        public User $partner,
        public ?string $reason = null,
    ) {
    }

    public function build(): self
    {
        return $this->subject('Permintaan pembubaran Space "' . $this->space->title . '"')
            ->view('emails.separation_requested')
            ->with([
                'space' => $this->space,
                'initiator' => $this->initiator,
                'partner' => $this->partner,
                'reason' => $this->reason,
                'spacesUrl' => url(route('spaces.index')),
                'appName' => config('app.name'),
            ]);
    }
}
