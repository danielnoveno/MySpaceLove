<?php

namespace App\Mail;

use App\Models\Space;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class JoinRequestRejectedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Space $space,
        public ?User $owner,
        public User $requester,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Permintaan Bergabung Ditolak',
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: $this->buildHtml(),
        );
    }

    private function buildHtml(): string
    {
        $spaceTitle = e($this->space->title);
        $ownerName = e($this->owner?->name ?? 'Pemilik Space');

        return <<<HTML
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #6b7280, #9ca3af); border-radius: 16px; padding: 32px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 24px;">Permintaan Bergabung Ditolak</h1>
            </div>
            <div style="padding: 32px; background: #f9fafb; border-radius: 0 0 16px 16px;">
                <p>Halo <strong>{$this->requester->name}</strong>,</p>
                <p>Permintaan bergabung ke Space <strong>"{$spaceTitle}"</strong> telah ditolak oleh <strong>{$ownerName}</strong>.</p>
                <p>Jangan berkecil hati! Kamu bisa membuat Space sendiri atau mencoba bergabung ke Space lain.</p>
                <div style="text-align: center; margin: 32px 0;">
                    <a href="{$this->getApplicationUrl()}/spaces" 
                       style="background: linear-gradient(135deg, #ec4899, #f43f5e); color: white; padding: 14px 32px; border-radius: 999px; text-decoration: none; font-weight: 600; display: inline-block;">
                        Lihat Space Lain
                    </a>
                </div>
                <p style="color: #9ca3af; font-size: 12px; margin-top: 32px;">Email ini dikirim otomatis oleh SpaceLove.</p>
            </div>
        </body>
        </html>
        HTML;
    }

    private function getApplicationUrl(): string
    {
        return config('app.frontend_url', config('app.url', 'https://spacelovee.vercel.app'));
    }
}
