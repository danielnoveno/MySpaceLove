<?php

namespace App\Http\Controllers;

use App\Mail\NobarScheduleReminder;
use App\Models\NobarSchedule;
use App\Models\Space;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class NobarScheduleController extends Controller
{
    public function store(Request $request, Space $space)
    {
        $validated = $request->validate([
            'room_id' => ['required', 'string', 'max:255'],
            'room_name' => ['nullable', 'string', 'max:255'],
            'schedule_start_time' => ['required', 'integer'],
            'schedule_end_time' => ['nullable', 'integer'],
            'host_user_id' => ['nullable', 'string', 'max:255'],
            'timezone' => ['nullable', 'string', 'max:64'],
            'attendees' => ['nullable', 'array'],
            'raw_payload' => ['nullable', 'array'],
        ]);

        $timezone = $validated['timezone'] ?? config('app.timezone');

        $startsAt = Carbon::createFromTimestamp($validated['schedule_start_time'], $timezone);
        $endsAt = null;

        if (!empty($validated['schedule_end_time'])) {
            $endsAt = Carbon::createFromTimestamp($validated['schedule_end_time'], $timezone);
        }

        $schedule = NobarSchedule::firstOrNew([
            'space_id' => $space->id,
            'room_id' => $validated['room_id'],
        ]);

        $schedule->fill([
            'room_name' => $validated['room_name'] ?? $schedule->room_name,
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'host_user_id' => $validated['host_user_id'] ?? $schedule->host_user_id,
            'timezone' => $timezone,
            'attendees' => $validated['attendees'] ?? $schedule->attendees,
            'raw_payload' => $validated['raw_payload'] ?? $schedule->raw_payload,
        ]);

        $shouldNotify = $schedule->isDirty(['starts_at', 'ends_at', 'room_name']);

        $schedule->save();

        if ($schedule->wasRecentlyCreated) {
            $shouldNotify = true;
        }

        if ($shouldNotify) {
            $space->loadMissing(['userOne', 'userTwo']);

            $recipients = Collection::make([
                $space->userOne,
                $space->userTwo,
            ])
                ->filter(function ($user) {
                    return $user && !empty($user->email);
                })
                ->unique('email');

            foreach ($recipients as $recipient) {
                try {
                    Mail::to($recipient->email)->send(
                        new NobarScheduleReminder($space, $schedule, $recipient->name)
                    );
                } catch (\Throwable $exception) {
                    Log::warning('Failed to send nobar schedule reminder email', [
                        'space_id' => $space->id,
                        'schedule_id' => $schedule->id,
                        'email' => $recipient->email,
                        'error' => $exception->getMessage(),
                    ]);
                }
            }
        }

        return response()->json([
            'data' => [
                'id' => $schedule->id,
                'room_id' => $schedule->room_id,
                'room_name' => $schedule->room_name,
                'starts_at' => $schedule->starts_at,
                'ends_at' => $schedule->ends_at,
            ],
            'status' => $schedule->wasRecentlyCreated
                ? 'created'
                : ($shouldNotify ? 'updated' : 'unchanged'),
        ]);
    }
}
