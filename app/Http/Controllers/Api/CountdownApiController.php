<?php

namespace App\Http\Controllers\Api;


//tes
use App\Http\Controllers\Controller;
use App\Models\Countdown;
use App\Models\Space;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CountdownApiController extends Controller
{
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
            $path = $r->file('image')->store('countdowns', 'public');
            $data['image'] = $path;
        }

        Countdown::create($data);

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
            $path = $r->file('image')->store('countdowns', 'public');
            $data['image'] = $path;
        }

        $count->update($data);
        return Inertia::location(route('countdown.index', ['space' => $space->slug]));
    }

    public function destroy(Space $space, $id)
    {
        $this->authorizeSpace($space);
        $count = Countdown::where('space_id', $space->id)->findOrFail($id);
        $count->delete();
        return response()->json(['message' => 'deleted']);
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
