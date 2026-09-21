<?php

namespace App\Http\Controllers;

use App\Models\SharedLocation;
use App\Models\Space;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SharedLocationController extends Controller
{
    public function index(Request $request, Space $space): Response
    {
        $this->authorizeSpace($request, $space);

        $locations = SharedLocation::query()
            ->with('user:id,name,profile_image')
            ->where('space_id', $space->id)
            ->latest()
            ->get()
            ->map(fn (SharedLocation $location): array => $this->serializeLocation($location));

        return Inertia::render('Location/Index', [
            'space' => $this->serializeSpace($space),
            'locations' => $locations,
            'categories' => SharedLocation::CATEGORIES,
        ]);
    }

    public function create(Request $request, Space $space): Response
    {
        $this->authorizeSpace($request, $space);

        return Inertia::render('Location/Create', [
            'space' => $this->serializeSpace($space),
            'categories' => SharedLocation::CATEGORIES,
        ]);
    }

    public function store(Request $request, Space $space): RedirectResponse
    {
        $this->authorizeSpace($request, $space);

        SharedLocation::create($this->validated($request) + [
            'space_id' => $space->id,
            'user_id' => $request->user()->id,
        ]);

        return redirect()
            ->route('locations.index', ['space' => $space->slug])
            ->with('success', 'Location saved.');
    }

    public function edit(Request $request, Space $space, SharedLocation $location): Response
    {
        $this->authorizeSpace($request, $space);
        $this->authorizeLocation($request, $space, $location);

        return Inertia::render('Location/Edit', [
            'space' => $this->serializeSpace($space),
            'location' => $this->serializeLocation($location),
            'categories' => SharedLocation::CATEGORIES,
        ]);
    }

    public function update(Request $request, Space $space, SharedLocation $location): RedirectResponse
    {
        $this->authorizeSpace($request, $space);
        $this->authorizeLocation($request, $space, $location);

        $location->update($this->validated($request));

        return redirect()
            ->route('locations.index', ['space' => $space->slug])
            ->with('success', 'Location updated.');
    }

    public function destroy(Request $request, Space $space, SharedLocation $location): RedirectResponse
    {
        $this->authorizeSpace($request, $space);
        $this->authorizeLocation($request, $space, $location);

        $location->delete();

        return back()->with('success', 'Location deleted.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:2000'],
            'city' => ['nullable', 'string', 'max:255'],
            'category' => ['required', Rule::in(SharedLocation::CATEGORIES)],
            'notes' => ['nullable', 'string', 'max:5000'],
            'rating' => ['nullable', 'integer', 'min:1', 'max:5'],
            'saved_at' => ['nullable', 'date'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
        ]);
    }

    private function authorizeSpace(Request $request, Space $space): void
    {
        abort_unless($request->user() && $space->hasMember($request->user()->id), 403);
    }

    private function authorizeLocation(Request $request, Space $space, SharedLocation $location): void
    {
        abort_unless($location->space_id === $space->id, 404);
        abort_unless($location->user_id === $request->user()?->id || $space->user_one_id === $request->user()?->id, 403);
    }

    private function serializeSpace(Space $space): array
    {
        return [
            'id' => $space->id,
            'slug' => $space->slug,
            'title' => $space->title,
        ];
    }

    private function serializeLocation(SharedLocation $location): array
    {
        return [
            'id' => $location->id,
            'space_id' => $location->space_id,
            'user_id' => $location->user_id,
            'name' => $location->name,
            'address' => $location->address,
            'city' => $location->city,
            'category' => $location->category,
            'notes' => $location->notes,
            'rating' => $location->rating,
            'saved_at' => $location->saved_at?->toDateString(),
            'latitude' => $location->latitude,
            'longitude' => $location->longitude,
            'created_at' => $location->created_at?->toIso8601String(),
            'user' => $location->relationLoaded('user') && $location->user ? [
                'id' => $location->user->id,
                'name' => $location->user->name,
                'profile_photo_url' => $location->user->profile_photo_url,
            ] : null,
        ];
    }
}
