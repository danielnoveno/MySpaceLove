<?php

namespace App\Mail;

use App\Models\NobarSchedule;
use App\Models\Space;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NobarScheduleReminder extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Space $space,
        public NobarSchedule $schedule,
        public ?string $recipientName = null
    ) {
    }

    public function build(): self
    {
        $timezone = $this->schedule->timezone ?? config('app.timezone');

        $startsAt = $this->schedule->starts_at?->copy()->setTimezone($timezone);
        $endsAt = $this->schedule->ends_at?->copy()->setTimezone($timezone);

        $formattedStart = $startsAt?->translatedFormat('l, d F Y H:i');
        $formattedEnd = $endsAt?->translatedFormat('l, d F Y H:i');

        $joinUrl = url("/spaces/{$this->space->slug}/nobar");

        return $this->subject(__('Pengingat Nobar: :title', ['title' => $this->space->title ?? 'MySpaceLove']))
            ->view('emails.nobar_schedule')
            ->with([
                'space' => $this->space,
                'schedule' => $this->schedule,
                'recipientName' => $this->recipientName,
                'formattedStart' => $formattedStart,
                'formattedEnd' => $formattedEnd,
                'timezone' => $timezone,
                'joinUrl' => $joinUrl,
            ]);
    }
}
