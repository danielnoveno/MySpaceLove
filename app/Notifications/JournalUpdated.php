<?php

namespace App\Notifications;

use App\Models\LoveJournal;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class JournalUpdated extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public LoveJournal $journal;

    public Space $space;

    public string $action;

    public function __construct(LoveJournal $journal, Space $space, string $action)
    {
        $this->journal = $journal;
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
            case 'updated':
                $subject = __('Journal Entry Updated!');
                $greeting = __('Hello!');
                $body = __('The journal entry ":title" in your space ":space_title" has been updated.', [
                    'title' => $this->journal->title,
                    'space_title' => $this->space->title,
                ]);
                $actionText = __('View Journal');
                $actionUrl = route('journal.index', ['space' => $this->space->slug]);
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
            'journal_id' => $this->journal->id,
            'space_id' => $this->space->id,
            'title' => $this->journal->title,
            'content' => $this->journal->content,
            'mood' => $this->journal->mood,
            'action' => $this->action,
            'space_slug' => $this->space->slug,
            'space_title' => $this->space->title,
        ];
    }
}
