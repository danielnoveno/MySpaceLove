<?php

namespace App\Mail;

use App\Models\Space;
use App\Models\SpaceInvitation;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class JoinRequestReceivedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Space $space,
        public User $requester,
        public SpaceInvitation $invitation,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Permintaan Bergabung ke Space \"{$this->space->title}\"",
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
        $requesterName = e($this->requester->name);
        $slug = e($this->space->slug);

        return <<<HTML
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #ec4899, #f43f5e); border-radius: 16px; padding: 32px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 24px;">💌 Permintaan Bergabung</h1>
            </div>
            <div style="padding: 32px; background: #fef2f2; border-radius: 0 0 16px 16px;">
                <p>Halo <strong>{$this->space->userOne?->name ?? 'Pemilik Space'}</strong>,</p>
                <p><strong>{$requesterName}</strong> ingin bergabung ke Space <strong>"{$spaceTitle}"</strong>.</p>
                <p>Silakan buka aplikasi untuk menyetujui atau menolak permintaan ini.</p>
                <div style="text-align: center; margin: 32px 0;">
                    <a href="{$this->getApplicationUrl()}/spaces/{$slug}" 
                       style="background: linear-gradient(135deg, #ec4899, #f43f5e); color: white; padding: 14px 32px; border-radius: 999px; text-decoration: none; font-weight: 600; display: inline-block;">
                        Buka Space
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
