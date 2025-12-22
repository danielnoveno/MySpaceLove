<?php

namespace App\Http\Controllers;

use App\Mail\NobarScheduleReminderMail;
use App\Models\NobarSchedule;
use App\Models\Space;
use App\Models\User;
use App\Notifications\NobarScheduleNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class NobarController extends Controller
{
    public function show(Request $request, Space $space): Response
    {
        $this->authorizeSpace($space);
        $request->attributes->set('currentSpace', $space);

        $currentSpacePayload = [
            'id' => $space->id,
            'slug' => $space->slug,
            'title' => $space->title,
            'has_partner' => !empty($space->user_one_id) && !empty($space->user_two_id),
        ];

        if (config('features.nobar_enabled', false)) {
            $space->loadMissing([
                'nobarSchedules' => function ($query): void {
                    $query->orderBy('scheduled_for');
                },
                'userOne',
                'userTwo',
            ]);

            $schedules = $space->nobarSchedules
                ->map(function (NobarSchedule $schedule): array {
                    return [
                        'id' => $schedule->id,
                        'title' => $schedule->title,
                        'description' => $schedule->description,
                        'scheduled_for' => $schedule->scheduled_for?->toIso8601String(),
                        'created_at' => $schedule->created_at?->toIso8601String(),
                    ];
                })
                ->values();

            return Inertia::render('Room/Show', [
                'spaceId' => $space->id,
                'space' => $currentSpacePayload,
                'currentSpace' => $currentSpacePayload,
                'schedules' => $schedules,
            ]);
        }

        return Inertia::render('Nobar/ComingSoon', [
            'space' => $currentSpacePayload,
            'currentSpace' => $currentSpacePayload,
        ]);
    }

    public function storeSchedule(Request $request, Space $space): RedirectResponse
    {
        $this->authorizeSpace($space);

        if (config('features.nobar_enabled', false)) {
            $data = $request->validate([
                'title' => ['required', 'string', 'max:160'],
                'scheduled_for' => ['required', 'date_format:Y-m-d\TH:i'],
                'description' => ['nullable', 'string', 'max:2000'],
                'timezone' => ['nullable', 'timezone'],
            ]);

            $timezone = $data['timezone'] ?? $request->user()?->timezone ?? config('app.timezone');

            try {
                $scheduledFor = Carbon::createFromFormat('Y-m-d\TH:i', $data['scheduled_for'], $timezone);
            } catch (Throwable $exception) {
                return back()->withErrors([
                    'scheduled_for' => __('The schedule time could not be parsed.'),
                ]);
            }

            if ($scheduledFor === false) {
                return back()->withErrors([
                    'scheduled_for' => __('The schedule time could not be parsed.'),
                ]);
            }

            $scheduledForUtc = $scheduledFor->copy()->timezone('UTC');

            if ($scheduledForUtc->lessThan(now()->subMinutes(1))) {
                return back()->withErrors([
                    'scheduled_for' => __('The schedule must be set in the future.'),
                ]);
            }

            $schedule = NobarSchedule::create([
                'space_id' => $space->id,
                'created_by' => Auth::id(),
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'scheduled_for' => $scheduledForUtc,
            ]);

            $this->sendScheduleEmails($space, $schedule, $request->user());

            return redirect()->route('space.nobar', ['space' => $space->slug]);
        }

        return redirect()->route('space.nobar', ['space' => $space->slug]);
    }

    public function updateSchedule(Request $request, Space $space, NobarSchedule $schedule): RedirectResponse
    {
        $this->authorizeSpace($space);

        if (config('features.nobar_enabled', false)) {
            $data = $request->validate([
                'title' => ['required', 'string', 'max:160'],
                'scheduled_for' => ['required', 'date_format:Y-m-d\TH:i'],
                'description' => ['nullable', 'string', 'max:2000'],
                'timezone' => ['nullable', 'timezone'],
            ]);

            $timezone = $data['timezone'] ?? $request->user()?->timezone ?? config('app.timezone');

            try {
                $scheduledFor = Carbon::createFromFormat('Y-m-d\TH:i', $data['scheduled_for'], $timezone);
            } catch (Throwable $exception) {
                return back()->withErrors([
                    'scheduled_for' => __('The schedule time could not be parsed.'),
                ]);
            }

            if ($scheduledFor === false) {
                return back()->withErrors([
                    'scheduled_for' => __('The schedule time could not be parsed.'),
                ]);
            }

            $scheduledForUtc = $scheduledFor->copy()->timezone('UTC');

            if ($scheduledForUtc->lessThan(now()->subMinutes(1))) {
                return back()->withErrors([
                    'scheduled_for' => __('The schedule must be set in the future.'),
                ]);
            }

            $schedule->update([
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'scheduled_for' => $scheduledForUtc,
            ]);

            $this->sendScheduleEmails($space, $schedule, $request->user(), 'updated');

            return redirect()->route('space.nobar', ['space' => $space->slug]);
        }

        return redirect()->route('space.nobar', ['space' => $space->slug]);
    }

    public function destroySchedule(Space $space, NobarSchedule $schedule): RedirectResponse
    {
        $this->authorizeSpace($space);

        if (config('features.nobar_enabled', false)) {
            $schedule->delete();
            $this->sendScheduleEmails($space, $schedule, Auth::user(), 'deleted');
        }

        return redirect()->route('space.nobar', ['space' => $space->slug]);
    }

    private function sendScheduleEmails(Space $space, NobarSchedule $schedule, ?User $creator, string $action = 'created'): void
    {
        $space->loadMissing(['userOne', 'userTwo']);

        $recipients = Collection::make([$space->userOne, $space->userTwo])
            ->filter(fn (?User $user): bool => $user !== null && filled($user->email))
            ->unique(fn (User $user): string => strtolower($user->email));

        foreach ($recipients as $recipient) {
            try {
                $recipient->notify(new NobarScheduleNotification($schedule, $space, $action));
            } catch (Throwable $exception) {
                Log::error('Failed to send nobar schedule notification.', [
                    'space_id' => $space->id,
                    'schedule_id' => $schedule->id,
                    'recipient_id' => $recipient->id,
                    'error' => $exception->getMessage(),
                ]);
            }
        }
    }

    private function authorizeSpace(Space $space): void
    {
        if (!$space->hasMember(Auth::id())) {
            abort(403);
        }
    }
}
