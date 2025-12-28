<?php

namespace App\Listeners;

use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Auth\Events\Registered;

class LogUserRegistered
{
    public function __construct(private readonly ActivityLogger $logger)
    {
    }

    public function handle(Registered $event): void
    {
        $user = $event->user;

        if (!$user instanceof User) {
            return;
        }

        $title = __('app.notifications.events.account_registered.title', [
            'name' => $user->name ?? __('app.layout.user.fallback_name'),
        ]);

        $body = __('app.notifications.events.account_registered.body');

        $this->logger->log($user, 'account.registered', $title, $body, [
            'user_id' => $user->getKey(),
        ], sendMail: true);
    }
}
