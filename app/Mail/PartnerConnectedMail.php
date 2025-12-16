<?php

namespace App\Mail;

use App\Models\Space;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PartnerConnectedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Space $space,
        public User $partner,
    ) {
    }

    public function build(): self
    {
        return $this->subject($this->partner->name . ' telah bergabung di Space kamu')
            ->view('emails.partner_connected')
            ->with([
                'space' => $this->space,
                'partner' => $this->partner,
                'spacesUrl' => url(route('spaces.index')),
                'appName' => config('app.name'),
            ]);
    }
}
