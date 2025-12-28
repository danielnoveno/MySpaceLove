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

        $actionLabel = $this->data['action_label'] ?? __('app.notifications.mail.action');
        $spaceSlug = $this->data['space_slug'] ?? null;
        $actionUrl = $this->data['action_url']
            ?? ($spaceSlug ? route('spaces.notifications.index', ['space' => $spaceSlug]) : route('spaces.index'));

        $mail = (new MailMessage())
            ->subject($this->title)
            ->greeting($greeting)
            ->line($this->body);

        if ($actionUrl) {
            $mail->action($actionLabel, $actionUrl);
        }

        return $mail->line(__('app.notifications.mail.footer'));
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $payload = [
            'event' => $this->event,
            'title' => $this->title,
            'body' => $this->body,
        ];

        if (is_array($this->data)) {
            $payload['meta'] = $this->data;

            foreach ($this->data as $key => $value) {
                if (!array_key_exists($key, $payload) && (is_scalar($value) || $value === null)) {
                    $payload[$key] = $value;
                }
            }
        }

        return $payload;
    }
}
