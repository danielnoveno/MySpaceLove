<?php

namespace App\Http\Controllers;

use App\Models\ListeningPlan;
use App\Models\Space;
use App\Models\SpotifyCapsule;
use App\Models\SpotifySurpriseDrop;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SpotifyPageController extends Controller
{
    public function index(Request $request, Space $space): Response
    {
        $this->authorizeSpace($request, $space);

        return Inertia::render('Spotify/LongDistanceSpotifyHub', [
            'space' => $this->space($space),
        ]);
    }

    public function capsules(Request $request, Space $space): Response
    {
        $this->authorizeSpace($request, $space);

        return Inertia::render('Spotify/Capsules/Index', [
            'space' => $this->space($space),
            'capsules' => SpotifyCapsule::with('user:id,name')
                ->where('space_id', $space->id)
                ->orderByDesc('saved_at')
                ->latest()
                ->get()
                ->map(fn (SpotifyCapsule $capsule): array => [
                    'id' => $capsule->id,
                    'track_name' => $capsule->track_name,
                    'artists' => $capsule->artists,
                    'moment' => $capsule->moment,
                    'description' => $capsule->description,
                    'saved_at' => $capsule->saved_at?->toDateString(),
                    'preview_url' => $capsule->preview_url,
                    'user' => $capsule->user?->name,
                ]),
        ]);
    }

    public function createCapsule(Request $request, Space $space): Response
    {
        $this->authorizeSpace($request, $space);

        return Inertia::render('Spotify/Capsules/Create', [
            'space' => $this->space($space),
        ]);
    }

    public function storeCapsule(Request $request, Space $space): RedirectResponse
    {
        $this->authorizeSpace($request, $space);

        $data = $request->validate([
            'spotify_track_id' => ['required', 'string', 'max:255'],
            'track_name' => ['required', 'string', 'max:255'],
            'artists' => ['required', 'string', 'max:255'],
            'moment' => ['nullable', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
            'saved_at' => ['nullable', 'date'],
            'preview_url' => ['nullable', 'url', 'max:2048'],
        ]);

        SpotifyCapsule::create($data + [
            'space_id' => $space->id,
            'user_id' => $request->user()->id,
        ]);

        return redirect()->route('spotify.capsules.index', ['space' => $space->slug])->with('success', 'Memory capsule saved.');
    }

    public function listeningPlans(Request $request, Space $space): Response
    {
        $this->authorizeSpace($request, $space);

        return Inertia::render('Spotify/ListeningPlans/Index', [
            'space' => $this->space($space),
            'plans' => ListeningPlan::with('user:id,name')
                ->where('space_id', $space->id)
                ->orderBy('scheduled_at')
                ->latest()
                ->get()
                ->map(fn (ListeningPlan $plan): array => [
                    'id' => $plan->id,
                    'title' => $plan->title,
                    'description' => $plan->description,
                    'scheduled_at' => $plan->scheduled_at?->toIso8601String(),
                    'spotify_playlist_id' => $plan->spotify_playlist_id,
                    'user' => $plan->user?->name,
                ]),
        ]);
    }

    public function createListeningPlan(Request $request, Space $space): Response
    {
        $this->authorizeSpace($request, $space);

        return Inertia::render('Spotify/ListeningPlans/Create', [
            'space' => $this->space($space),
        ]);
    }

    public function storeListeningPlan(Request $request, Space $space): RedirectResponse
    {
        $this->authorizeSpace($request, $space);

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'scheduled_at' => ['nullable', 'date'],
            'spotify_playlist_id' => ['nullable', 'string', 'max:255'],
        ]);

        ListeningPlan::create($data + [
            'space_id' => $space->id,
            'user_id' => $request->user()->id,
        ]);

        return redirect()->route('spotify.listening-plans.index', ['space' => $space->slug])->with('success', 'Listening plan created.');
    }

    public function surpriseDrops(Request $request, Space $space): Response
    {
        $this->authorizeSpace($request, $space);

        return Inertia::render('Spotify/SurpriseDrops/Index', [
            'space' => $this->space($space),
            'drops' => SpotifySurpriseDrop::with('user:id,name')
                ->where('space_id', $space->id)
                ->orderBy('scheduled_for')
                ->latest()
                ->get()
                ->map(fn (SpotifySurpriseDrop $drop): array => [
                    'id' => $drop->id,
                    'track_name' => $drop->track_name,
                    'artists' => $drop->artists,
                    'scheduled_for' => $drop->scheduled_for?->toIso8601String(),
                    'note' => $drop->note,
                    'curator_name' => $drop->curator_name,
                    'user' => $drop->user?->name,
                ]),
        ]);
    }

    public function createSurpriseDrop(Request $request, Space $space): Response
    {
        $this->authorizeSpace($request, $space);

        return Inertia::render('Spotify/SurpriseDrops/Create', [
            'space' => $this->space($space),
        ]);
    }

    public function storeSurpriseDrop(Request $request, Space $space): RedirectResponse
    {
        $this->authorizeSpace($request, $space);

        $data = $request->validate([
            'spotify_track_id' => ['required', 'string', 'max:255'],
            'track_name' => ['required', 'string', 'max:255'],
            'artists' => ['required', 'string', 'max:255'],
            'scheduled_for' => ['required', 'date'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        SpotifySurpriseDrop::create($data + [
            'space_id' => $space->id,
            'user_id' => $request->user()->id,
            'curator_name' => $request->user()->name,
        ]);

        return redirect()->route('spotify.surprise-drops.index', ['space' => $space->slug])->with('success', 'Surprise drop scheduled.');
    }

    private function authorizeSpace(Request $request, Space $space): void
    {
        abort_unless($request->user() && $space->hasMember($request->user()->id), 403);
    }

    private function space(Space $space): array
    {
        return ['id' => $space->id, 'slug' => $space->slug, 'title' => $space->title];
    }
}
