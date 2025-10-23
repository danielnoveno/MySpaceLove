<?php

namespace App\Mail;

use App\Models\NobarSchedule;
use App\Models\Space;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Carbon;

class NobarScheduleReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Space $space,
        public NobarSchedule $schedule,
        public ?User $creator,
        public User $recipient,
    ) {
    }

    public function build(): self
    {
        $creatorName = $this->creator?->name ?? trans('app.emails.nobar_schedule.creator_fallback');
        $recipientName = $this->recipient->name ?? trans('app.emails.nobar_schedule.recipient_fallback');
        $formattedDate = $this->formatSchedule($this->schedule->scheduled_for);

        return $this->subject(
            trans('app.emails.nobar_schedule.subject', [
                'title' => $this->schedule->title,
            ])
        )
            ->view('emails.nobar_schedule_reminder')
            ->with([
                'space' => $this->space,
                'schedule' => $this->schedule,
                'creatorName' => $creatorName,
                'recipientName' => $recipientName,
                'formattedDate' => $formattedDate,
                'appName' => config('app.name'),
            ]);
    }

    private function formatSchedule($date): string
    {
        try {
            return Carbon::parse($date)
                ->timezone(config('app.display_timezone', config('app.timezone')))
                ->locale(app()->getLocale())
                ->translatedFormat(trans('app.emails.nobar_schedule.time_format'));
        } catch (\Throwable $exception) {
            return (string) $date;
        }
    }
}
