<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword as BaseResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordMail extends BaseResetPassword
{
    /**
     * Build the mail representation.
     *
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Reset Your Password - ' . config('app.name'))
            ->view('emails.password_reset', [
                'email' => $notifiable->email,
                'name' => $notifiable->name ?? __('Partner'),
                'appName' => config('app.name'),
                'supportEmail' => config('mail.from.address'),
                'resetUrl' => $this->resetUrl($notifiable),
            ]);
    }
}
