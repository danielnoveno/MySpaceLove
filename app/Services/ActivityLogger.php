<?php

namespace App\Services;

use App\Models\User;
use App\Notifications\ActivityLogged;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Notification;

class ActivityLogger
{
    /**
     * @param  \App\Models\User|array<int, \App\Models\User>|\Illuminate\Support\Collection<int, \App\Models\User>  $recipients
     */
    public function log($recipients, string $event, string $title, string $body, array $data = [], bool $sendMail = true): void
    {
        $users = Collection::make(Arr::wrap($recipients))
            ->filter(fn ($user): bool => $user instanceof User);

        if ($users->isEmpty()) {
            return;
        }

        Notification::send($users, new ActivityLogged($event, $title, $body, $data, $sendMail));
    }
}
