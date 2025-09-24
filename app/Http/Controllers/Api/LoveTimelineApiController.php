<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LoveTimeline;
use App\Models\Space;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class LoveTimelineApiController extends Controller
{
    public function index($spaceId)
    {
        $space = Space::findOrFail($spaceId);
        $this->authorizeSpace($space);

        $timelines = $space->timelines()->orderBy('date')->get();

        return Inertia::render('Timeline/Index', [
            'timelines' => $timelines
        ]);
    }

    public function create()
    {
        $user = Auth::user();
        $spaces = $user->spaces;

        return Inertia::render('Timeline/Create', [
            'spaces' => $spaces
        ]);
    }

    public function store(Request $r, $spaceId)
    {
        $space = Space::findOrFail($spaceId);
        $this->authorizeSpace($space);

        $data = $r->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date'  => 'required|date',
            'media' => 'nullable|file|mimes:jpg,jpeg,png,gif,mp4,mov|max:20480'
        ]);

        $path = null;
        if ($r->hasFile('media')) {
            $path = $r->file('media')->store("spaces/{$space->slug}/timeline", 'public');
        }

        $item = LoveTimeline::create([
            'space_id' => $space->id,
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'date' => $data['date'],
            'media_path' => $path
        ]);

        return response()->json($item, 201);
    }

    public function update(Request $r, $spaceId, $id)
    {
        $space = Space::findOrFail($spaceId);
        $this->authorizeSpace($space);

        $item = LoveTimeline::where('space_id', $space->id)->findOrFail($id);
        $data = $r->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date' => 'required|date',
            'media' => 'nullable|file|mimes:jpg,jpeg,png,gif,mp4,mov|max:20480'
        ]);

        if ($r->hasFile('media')) {
            if ($item->media_path) Storage::disk('public')->delete($item->media_path);
            $item->media_path = $r->file('media')->store("spaces/{$space->slug}/timeline", 'public');
        }

        $item->update($r->only(['title', 'description', 'date']));
        return response()->json($item);
    }

    public function destroy($spaceId, $id)
    {
        $space = Space::findOrFail($spaceId);
        $this->authorizeSpace($space);

        $item = LoveTimeline::where('space_id', $space->id)->findOrFail($id);
        if ($item->media_path) Storage::disk('public')->delete($item->media_path);
        $item->delete();
        return response()->json(['message' => 'deleted']);
    }

    private function authorizeSpace(Space $space)
    {
        if (!$space->hasMember(Auth::id())) abort(403);
    }
}
