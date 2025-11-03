<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ActivityLogged extends Notification
{
    use Queueable;

    public function __construct(
        public readonly string $event,
        public readonly string $title,
        public readonly string $body,
        public readonly array $data = [],
        public readonly bool $sendMail = false,
    ) {
    }

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        $channels = ['database'];

        if ($this->sendMail && !empty($notifiable->email)) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    public function toMail(object $notifiable): MailMessage
    {
        $greeting = __('app.notifications.mail.greeting', [
            'name' => $notifiable->name ?? __('app.layout.user.fallback_name'),
        ]);

        $actionLabel = __('app.notifications.mail.action');

        return (new MailMessage())
            ->subject($this->title)
            ->greeting($greeting)
            ->line($this->body)
            ->action($actionLabel, url(route('notifications.index')))
            ->line(__('app.notifications.mail.footer'));
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'event' => $this->event,
            'title' => $this->title,
            'body' => $this->body,
            'data' => $this->data,
        ];
    }
}
