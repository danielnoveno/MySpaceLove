<?php

namespace App\Mail;

use App\Models\DailyMessage;
use App\Models\Space;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Carbon;

use Illuminate\Contracts\Queue\ShouldQueue;

class DailyMessageMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public Space $space,
        public DailyMessage $dailyMessage,
        public ?User $sender,
        public User $recipient,
    ) {
    }

    public function build(): self
    {
        $senderName = $this->sender?->name ?? trans('app.emails.daily_message.sender_fallback');
        $partnerName = $this->recipient->name ?? trans('app.emails.daily_message.partner_fallback');
        $formattedDate = $this->formatDate($this->dailyMessage->date);

        return $this->subject(
            trans('app.emails.daily_message.subject', [
                'sender' => $senderName,
                'partner' => $partnerName,
                'date' => $formattedDate,
                'space' => $this->space->title,
            ])
        )->view('emails.daily_message')
            ->with([
                'space' => $this->space,
                'dailyMessage' => $this->dailyMessage,
                'senderName' => $senderName,
                'partnerName' => $partnerName,
                'formattedDate' => $formattedDate,
                'appName' => config('app.name'),
            ]);
    }

    private function formatDate($date): string
    {
        try {
            return Carbon::parse($date)
                ->locale(app()->getLocale())
                ->translatedFormat(trans('app.emails.daily_message.date_format'));
        } catch (\Throwable $exception) {
            return (string) $date;
        }
    }
}
