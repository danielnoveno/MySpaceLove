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
            'timelines' => $timelines,
            'spaceId' => $spaceId,
        ]);
    }

    public function create($spaceId)
    {
        $space = Space::findOrFail($spaceId);
        $this->authorizeSpace($space);

        return Inertia::render('Timeline/Create', [
            'spaceId' => $space->id,
            'space'   => $space,
        ]);
    }

    public function store(Request $request, $spaceId)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date' => 'required|date',
            'media' => 'nullable|array|max:5', // ⬅️ batas maksimal 5 file
            'media.*' => 'nullable|file|mimes:jpg,jpeg,png|max:10240', // max 10MB per file
        ]);

        $timeline = new LoveTimeline();
        $timeline->space_id = $spaceId;
        $timeline->title = $request->title;
        $timeline->description = $request->description;
        $timeline->date = $request->date;

        $paths = [];
        if ($request->hasFile('media')) {
            foreach ($request->file('media') as $file) {
                $paths[] = $file->store("spaces/{$spaceId}/timeline", 'public');
            }
        }

        $timeline->media_paths = $paths;
        $timeline->save();

        return redirect()
            ->route('timeline.index', $spaceId)
            ->with('success', 'Timeline berhasil ditambahkan!');
    }

    public function edit($spaceId, $id)
    {
        $item = LoveTimeline::where('space_id', $spaceId)->findOrFail($id);

        return Inertia::render('Timeline/Edit', [
            'item' => $item,
            'spaceId' => $spaceId,
        ]);
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
            'media.*' => 'nullable|file|mimes:jpg,jpeg,png,gif,mp4,mov|max:20480'
        ]);

        $paths = $item->media_paths ?? [];

        if ($r->hasFile('media')) {
            // kalau mau replace semua, bisa hapus dulu file lama
            foreach ($paths as $oldPath) {
                Storage::disk('public')->delete($oldPath);
            }
            $paths = [];
            foreach ($r->file('media') as $file) {
                $paths[] = $file->store("spaces/{$spaceId}/timeline", 'public');
            }
        }

        $item->update([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'date' => $data['date'],
            'media_paths' => $paths,
        ]);

        return redirect()->route('timeline.index', $spaceId)
            ->with('success', 'Timeline berhasil diperbarui!');
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
