<?php

namespace App\Mail;

use App\Models\Space;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class SpaceActivityMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public ?Space ,
        public User ,
        public ?User ,
        public string ,
        public array  = []
    ) {
    }

    public function build(): self
    {
         = ->resolvePayload();

        return ->subject(['subject'])
            ->view('emails.space_activity', [
                'title' => ['title'],
                'message' => ['message'],
                'cta' => ['cta'],
                'appName' => config('app.name'),
                'space' => ->space,
                'actor' => ->actor,
                'recipient' => ->recipient,
            ]);
    }

    private function resolvePayload(): array
    {
         = ->space?->title ?? config('app.name');
         = ->space?->slug;
         = ->actor?->name ?? 'Pasanganmu';

        return match (->type) {
            'timeline_created' => [
                'subject' => .' menambahkan momen baru',
                'title' => 'Ada momen baru di Love Timeline',
                'message' => .' baru saja menambahkan "'.(->context['timeline_title'] ?? 'momen spesial').'" pada Timeline '..'. Ajak dia mengenang cerita ini bersama.',
                'cta' =>  ? [
                    'label' => 'Lihat Timeline',
                    'url' => route('timeline.index', ['space' => ]),
                ] : null,
            ],
            'gallery_uploaded' => [
                'subject' => .' menambah foto ke galeri',
                'title' => 'Galeri kalian makin penuh cinta',
                'message' => .' baru saja mengunggah '.(->context['count'] ?? 1).' file ke galeri '..'. Jangan lupa kasih komentar manis ya!',
                'cta' =>  ? [
                    'label' => 'Buka Galeri',
                    'url' => route('gallery.index', ['space' => ]),
                ] : null,
            ],
            'space_created' => [
                'subject' => 'Space kamu berhasil dibuat',
                'title' => 'Space pertamamu siap dipenuhi cerita',
                'message' => 'Selamat! Space "'.(->space?->title ?? 'MySpaceLove').'" sudah siap. Undang pasanganmu dan mulai lengkapi fitur-fiturnya.',
                'cta' =>  ? [
                    'label' => 'Buka Dashboard Space',
                    'url' => route('spaces.dashboard', ['space' => ]),
                ] : null,
            ],
            'space_deleted' => [
                'subject' => 'Space kalian telah dihapus',
                'title' => 'Space '..' dinonaktifkan',
                'message' => .' menghapus Space "'..'". Jika ini di luar kesepakatan, silakan saling menghubungi dan buat Space baru kapan pun siap.',
                'cta' => [
                    'label' => 'Lihat Daftar Space',
                    'url' => route('spaces.index'),
                ],
            ],
            'user_registered' => [
                'subject' => 'Selamat datang di '.config('app.name'),
                'title' => 'Hai '.->recipient->name.'! Yuk mulai buat kenangan',
                'message' => 'Akunmu berhasil dibuat. Kamu bisa membuat Space baru atau bergabung dengan pasanganmu menggunakan kode pasangan.',
                'cta' => [
                    'label' => 'Buka Dashboard MySpaceLove',
                    'url' => route('spaces.index'),
                ],
            ],
            default => [
                'subject' => 'Aktivitas terbaru di '.,
                'title' => 'Ada kabar baru di Space kalian',
                'message' => .' melakukan aktivitas terbaru.',
                'cta' =>  ? [
                    'label' => 'Buka Dashboard Space',
                    'url' => route('spaces.dashboard', ['space' => ]),
                ] : null,
            ],
        };
    }
}
