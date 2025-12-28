<?php

namespace App\Mail;

use App\Models\Space;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

use Illuminate\Contracts\Queue\ShouldQueue;

class SpaceActivityMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public ?Space $space,
        public User $actor,
        public ?User $recipient,
        public string $type,
        public array $context = []
    ) {
    }

    public function build(): self
    {
        $payload = $this->resolvePayload();

        return $this->subject($payload['subject'])
            ->view('emails.space_activity', [
                'title' => $payload['title'],
                'message' => $payload['message'],
                'cta' => $payload['cta'],
                'appName' => config('app.name'),
                'space' => $this->space,
                'actor' => $this->actor,
                'recipient' => $this->recipient,
            ]);
    }

    private function resolvePayload(): array
    {
        $spaceTitle = $this->space?->title ?? config('app.name');
        $spaceSlug = $this->space?->slug;
        $actorName = $this->actor?->name ?? 'Pasanganmu';

        return match ($this->type) {
            'timeline_created' => [
                'subject' => $actorName . ' menambahkan momen baru',
                'title' => 'Ada momen baru di Love Timeline',
                'message' => $actorName . ' baru saja menambahkan "' . ($this->context['timeline_title'] ?? 'momen spesial') . '" pada Timeline ' . $spaceTitle . '. Ajak dia mengenang cerita ini bersama.',
                'cta' => $spaceSlug ? [
                    'label' => 'Lihat Timeline',
                    'url' => route('timeline.index', ['space' => $spaceSlug]),
                ] : null,
            ],
            'gallery_uploaded' => [
                'subject' => $actorName . ' menambah foto ke galeri',
                'title' => 'Galeri kalian makin penuh cinta',
                'message' => $actorName . ' baru saja mengunggah ' . ($this->context['count'] ?? 1) . ' file ke galeri ' . $spaceTitle . '. Jangan lupa kasih komentar manis ya!',
                'cta' => $spaceSlug ? [
                    'label' => 'Buka Galeri',
                    'url' => route('gallery.index', ['space' => $spaceSlug]),
                ] : null,
            ],
            'space_created' => [
                'subject' => 'Space kamu berhasil dibuat',
                'title' => 'Space pertamamu siap dipenuhi cerita',
                'message' => 'Selamat! Space "' . ($this->space?->title ?? 'MySpaceLove') . '" sudah siap. Undang pasanganmu dan mulai lengkapi fitur-fiturnya.',
                'cta' => $spaceSlug ? [
                    'label' => 'Buka Dashboard Space',
                    'url' => route('spaces.dashboard', ['space' => $spaceSlug]),
                ] : null,
            ],
            'space_deleted' => [
                'subject' => 'Space kalian telah dihapus',
                'title' => 'Space ' . $spaceTitle . ' dinonaktifkan',
                'message' => $actorName . ' menghapus Space "' . $spaceTitle . '". Jika ini di luar kesepakatan, silakan saling menghubungi dan buat Space baru kapan pun siap.',
                'cta' => [
                    'label' => 'Lihat Daftar Space',
                    'url' => route('spaces.index'),
                ],
            ],
            'user_registered' => [
                'subject' => 'Selamat datang di ' . config('app.name'),
                'title' => 'Hai ' . $this->recipient->name . '! Yuk mulai buat kenangan',
                'message' => 'Akunmu berhasil dibuat. Kamu bisa membuat Space baru atau bergabung dengan pasanganmu menggunakan kode pasangan.',
                'cta' => [
                    'label' => 'Buka Dashboard MySpaceLove',
                    'url' => route('spaces.index'),
                ],
            ],
            default => [
                'subject' => 'Aktivitas terbaru di ' . $spaceTitle,
                'title' => 'Ada kabar baru di Space kalian',
                'message' => $actorName . ' melakukan aktivitas terbaru.',
                'cta' => $spaceSlug ? [
                    'label' => 'Buka Dashboard Space',
                    'url' => route('spaces.dashboard', ['space' => $spaceSlug]),
                ] : null,
            ],
        };
    }
}
