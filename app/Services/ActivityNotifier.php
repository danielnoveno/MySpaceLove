<?php

namespace App\Services;

use App\Mail\SpaceActivityMail;
use App\Models\Space;
use App\Models\User;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ActivityNotifier
{
    /**
     * Send an activity email to other members of the space.
     */
    public static function notifySpace(Space $space, ?User $actor, string $type, array $context = []): void
    {
        $space->loadMissing(['userOne', 'userTwo']);

        if (! str_contains($type, 'create')) {
            return;
        }

        $recipients = collect([
            $space->userOne,
            $space->userTwo,
        ])->filter(function (?User $user) use ($actor) {
            if (! $user) {
                return false;
            }

            if (! filter_var($user->email, FILTER_VALIDATE_EMAIL)) {
                return false;
            }

            if ($actor && $actor->id === $user->id) {
                return false;
            }

            return true;
        });

        if ($recipients->isEmpty()) {
            return;
        }

        foreach ($recipients as $recipient) {
            try {
                Mail::to($recipient->email)->send(
                    new SpaceActivityMail($space, $recipient, $actor, $type, $context)
                );
            } catch (\Throwable $exception) {
                Log::warning('Failed sending activity email', [
                    'space_id' => $space->id,
                    'recipient_id' => $recipient->id,
                    'type' => $type,
                    'context' => Arr::except($context, ['__raw']),
                    'error' => $exception->getMessage(),
                ]);
            }
        }
    }

    /**
     * Send an activity email directly to a user (used for onboarding events).
     */
    public static function notifyUser(User $user, string $type, array $context = [], ?Space $space = null): void
    {
        if (! str_contains($type, 'create')) {
            return;
        }
        if (! filter_var($user->email, FILTER_VALIDATE_EMAIL)) {
            return;
        }

        try {
            Mail::to($user->email)->send(new SpaceActivityMail($space, $user, $user, $type, $context));
        } catch (\Throwable $exception) {
            Log::warning('Failed sending user activity email', [
                'user_id' => $user->id,
                'type' => $type,
                'context' => Arr::except($context, ['__raw']),
                'error' => $exception->getMessage(),
            ]);
        }
    }
}

