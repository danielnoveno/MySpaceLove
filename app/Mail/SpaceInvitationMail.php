<?php

namespace App\Mail;

use App\Models\Space;
use App\Models\SpaceInvitation;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

use Illuminate\Contracts\Queue\ShouldQueue;

class SpaceInvitationMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public Space $space,
        public User $inviter,
        public User $invitee,
        public SpaceInvitation $invitation,
        public ?string $temporaryPassword = null,
        public array $invitationHistory = [],
        public string $currentStatusLabel = 'Menunggu konfirmasi',
    ) {
    }

    public function build(): self
    {
        return $this->subject('Undangan bergabung ke Space "' . $this->space->title . '"')
            ->view('emails.space_invitation')
            ->with([
                'space' => $this->space,
                'inviter' => $this->inviter,
                'invitee' => $this->invitee,
                'invitation' => $this->invitation,
                'temporaryPassword' => $this->temporaryPassword,
                'loginUrl' => url(route('login')),
                'spacesUrl' => url(route('spaces.index')),
                'supportEmail' => config('mail.from.address'),
                'appName' => config('app.name'),
                'invitationHistory' => $this->invitationHistory,
                'currentStatusLabel' => $this->currentStatusLabel,
            ]);
    }
}
