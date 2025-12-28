<?php

namespace App\Notifications;

use App\Models\NobarSchedule;
use App\Models\Space;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NobarScheduleNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public NobarSchedule $schedule;

    public Space $space;

    public string $action;

    /**
     * Create a new notification instance.
     */
    public function __construct(NobarSchedule $schedule, Space $space, string $action)
    {
        $this->schedule = $schedule;
        $this->space = $space;
        $this->action = $action;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $subject = '';
        $greeting = '';
        $body = '';
        $actionText = '';
        $actionUrl = '';

        switch ($this->action) {
            case 'created':
                $subject = __('New Nobar Schedule Created!');
                $greeting = __('Hello!');
                $body = __('A new Nobar schedule ":title" has been created in your space ":space_title" for :scheduled_for.', [
                    'title' => $this->schedule->title,
                    'space_title' => $this->space->title,
                    'scheduled_for' => $this->schedule->scheduled_for->format('M d, Y H:i'),
                ]);
                $actionText = __('View Schedule');
                $actionUrl = route('space.nobar', ['space' => $this->space->slug]);
                break;
            case 'updated':
                $subject = __('Nobar Schedule Updated!');
                $greeting = __('Hello!');
                $body = __('The Nobar schedule ":title" in your space ":space_title" has been updated. The new time is :scheduled_for.', [
                    'title' => $this->schedule->title,
                    'space_title' => $this->space->title,
                    'scheduled_for' => $this->schedule->scheduled_for->format('M d, Y H:i'),
                ]);
                $actionText = __('View Schedule');
                $actionUrl = route('space.nobar', ['space' => $this->space->slug]);
                break;
            case 'deleted':
                $subject = __('Nobar Schedule Deleted!');
                $greeting = __('Hello!');
                $body = __('The Nobar schedule ":title" in your space ":space_title" has been deleted.', [
                    'title' => $this->schedule->title,
                    'space_title' => $this->space->title,
                ]);
                break;
        }

        $mailMessage = (new MailMessage)
            ->subject($subject)
            ->greeting($greeting)
            ->line($body);

        if ($actionUrl) {
            $mailMessage->action($actionText, $actionUrl);
        }

        return $mailMessage;
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'schedule_id' => $this->schedule->id,
            'space_id' => $this->space->id,
            'title' => $this->schedule->title,
            'description' => $this->schedule->description,
            'scheduled_for' => $this->schedule->scheduled_for->toIso8601String(),
            'action' => $this->action,
            'space_slug' => $this->space->slug,
            'space_title' => $this->space->title,
        ];
    }
}
