<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use App\Models\MediaGallery;
use App\Models\User;
use Illuminate\Notifications\Notification;

class MediaGalleryCreated extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public MediaGallery $mediaGallery,
        public User $sender,
        public int $count,
        public bool $isSenderNotification = false
    ) {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        if ($this->isSenderNotification) {
            $title = $this->count > 1
                ? "Berhasil menambahkan {$this->count} media ke galeri!"
                : "Berhasil menambahkan media ke galeri!";
        } else {
            $title = $this->count > 1
                ? "{$this->sender->name} menambahkan {$this->count} media baru ke galeri!"
                : "{$this->sender->name} menambahkan media baru ke galeri!";
        }

        $body = $this->isSenderNotification
            ? 'Media Anda telah berhasil diunggah.'
            : ($this->mediaGallery->title ?? 'Lihat media baru yang ditambahkan.');

        return [
            'media_gallery_id' => $this->mediaGallery->id,
            'space_id' => $this->mediaGallery->space_id,
            'sender_name' => $this->sender->name,
            'title' => $title,
            'body' => $body,
            'url' => route('gallery.index', ['space' => $this->mediaGallery->space->slug]),
        ];
    }
}
