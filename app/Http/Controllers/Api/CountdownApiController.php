<?php

namespace App\Http\Controllers\Api;


//tes
use App\Http\Controllers\Controller;
use App\Models\Countdown;
use App\Models\Space;
use App\Models\User;
use App\Services\ActivityLogger;
use App\Services\UploadedFileProcessor;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class CountdownApiController extends Controller
{
    public function __construct(
        private readonly ActivityLogger $activityLogger,
        private readonly UploadedFileProcessor $fileProcessor
    )
    {
    }

    public function index(Space $space)
    {
        $this->authorizeSpace($space);

        $countdowns = Countdown::where('space_id', $space->id)->latest()->get();

        return Inertia::render('Countdowns/Index', [
            'items' => $countdowns,
            'space' => $this->spacePayload($space),
        ]);
    }

    public function create(Space $space)
    {
        $this->authorizeSpace($space);

        return Inertia::render('Countdowns/Create', [
            'space' => $this->spacePayload($space),
        ]);
    }

    public function store(Request $r, Space $space)
    {
        $this->authorizeSpace($space);
        $data = $r->validate([
            'event_name' => 'required|string|max:255',
            'event_date' => 'required|date',
            'description' => 'nullable|string',
            'activities' => 'nullable|array',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);
        $data['space_id'] = $space->id;

        if ($r->hasFile('image')) {
            $stored = $this->fileProcessor->store($r->file('image'), 'countdowns');
            $data['image'] = $stored['path'];
        }

        $countdown = Countdown::create($data);

        $this->notifyCountdownCreated($space, $countdown, $r->user());

        return Inertia::location(route('countdown.index', ['space' => $space->slug]));
    }

    public function edit(Space $space, $id)
    {
        $this->authorizeSpace($space);

        $countdown = Countdown::where('space_id', $space->id)->findOrFail($id);

        return Inertia::render('Countdowns/Edit', [
            'countdown' => $countdown,
            'space' => $this->spacePayload($space),
        ]);
    }

    public function update(Request $r, Space $space, $id)
    {
        $this->authorizeSpace($space);
        $count = Countdown::where('space_id', $space->id)->findOrFail($id);
        $data = $r->validate([
            'event_name' => 'required|string|max:255',
            'event_date' => 'required|date',
            'description' => 'nullable|string',
            'activities' => 'nullable|array',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        if ($r->hasFile('image')) {
            $stored = $this->fileProcessor->store($r->file('image'), 'countdowns');
            $data['image'] = $stored['path'];
        }

        $count->update($data);
        return Inertia::location(route('countdown.index', ['space' => $space->slug]));
    }

    private function notifyCountdownCreated(Space $space, Countdown $countdown, ?User $actor): void
    {
        if (!Schema::hasTable('notifications')) {
            return;
        }

        $space->loadMissing(['userOne', 'userTwo']);

        $recipients = collect([$space->userOne, $space->userTwo])
            ->filter()
            ->unique(fn ($user) => $user?->id)
            ->values();

        if ($recipients->isEmpty()) {
            return;
        }

        $actorName = $actor?->name ?? __('app.layout.user.fallback_name');
        $eventDate = $countdown->event_date
            ? Carbon::parse($countdown->event_date)->translatedFormat('d F Y')
            : now()->translatedFormat('d F Y');

        $title = __('app.notifications.events.countdown_created.title', [
            'actor' => $actorName,
        ]);

        $body = __('app.notifications.events.countdown_created.body', [
            'actor' => $actorName,
            'title' => $countdown->event_name,
            'date' => $eventDate,
        ]);

        $data = [
            'space_id' => $space->id,
            'space_slug' => $space->slug,
            'countdown_id' => $countdown->id,
            'countdown_title' => $countdown->event_name,
            'countdown_date' => $countdown->event_date,
            'actor_id' => $actor?->id,
            'actor_name' => $actorName,
            'action_url' => route('countdown.index', ['space' => $space->slug]),
            'action_label' => __('app.notifications.events.countdown_created.action'),
        ];

        $this->activityLogger->log(
            $recipients->all(),
            'countdown.created',
            $title,
            $body,
            $data,
            true
        );
    }

    public function destroy(Request $request, Space $space, $id)
    {
        $this->authorizeSpace($space);
        $count = Countdown::where('space_id', $space->id)->findOrFail($id);
        $count->delete();

        if ($request->wantsJson()) {
            return response()->json(['message' => 'deleted']);
        }

        return redirect()
            ->route('countdown.index', ['space' => $space->slug])
            ->with('success', __('Event countdown berhasil dihapus.'));
    }

    private function authorizeSpace(Space $space)
    {
        if (!$space->hasMember(Auth::id())) abort(403);
    }

    private function spacePayload(Space $space): array
    {
        return [
            'id' => $space->id,
            'slug' => $space->slug,
            'title' => $space->title,
        ];
    }
}
