<?php

namespace App\Notifications;

use App\Models\LoveJournal;
use App\Models\Space;
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

    public function __construct(
        LoveJournal $journal,
        Space $space,
        string $action,
        public string $senderName,
        public bool $isSenderNotification = false
    ) {
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
                if ($this->isSenderNotification) {
                    $subject = __('Journal Entry Updated!');
                    $greeting = __('Hello!');
                    $body = __('Your journal entry ":title" has been successfully updated.', [
                        'title' => $this->journal->title,
                    ]);
                } else {
                    $subject = __('Journal Entry Updated!');
                    $greeting = __('Hello!');
                    $body = __('The journal entry ":title" in your space ":space_title" has been updated.', [
                        'title' => $this->journal->title,
                        'space_title' => $this->space->title,
                    ]);
                }
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
        $title = $this->isSenderNotification
            ? __('Jurnal berhasil diperbarui!')
            : __('Jurnal ":title" telah diperbarui oleh :user', ['title' => $this->journal->title, 'user' => $this->senderName]);

        $body = $this->isSenderNotification
            ? __('Jurnal Anda ":title" telah berhasil diperbarui.', ['title' => $this->journal->title])
            : __('Jurnal baru berjudul ":title" telah diperbarui di ruang Anda.', ['title' => $this->journal->title]);

        return [
            'journal_id' => $this->journal->id,
            'space_id' => $this->space->id,
            'title' => $title,
            'body' => $body,
            'mood' => $this->journal->mood,
            'action' => $this->action,
            'space_slug' => $this->space->slug,
            'space_title' => $this->space->title,
            'url' => route('journal.index', ['space' => $this->space->slug]),
        ];
    }
}
