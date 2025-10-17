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
    public function index(Space $space)
    {
        $this->authorizeSpace($space);

        $timelines = $space->timelines()->orderBy('date')->get();

        return Inertia::render('Timeline/Index', [
            'timelines' => $timelines,
            'space' => $this->spacePayload($space),
        ]);
    }

    public function create(Space $space)
    {
        $this->authorizeSpace($space);

        return Inertia::render('Timeline/Create', [
            'space' => $this->spacePayload($space),
        ]);
    }

    public function store(Request $request, Space $space)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date' => 'required|date',
            'media' => 'nullable|array|max:5', // ⬅️ batas maksimal 5 file
            'media.*' => 'nullable|file|mimes:jpg,jpeg,png|max:10240', // max 10MB per file
        ]);

        $timeline = new LoveTimeline();
        $timeline->space_id = $space->id;
        $timeline->title = $request->title;
        $timeline->description = $request->description;
        $timeline->date = $request->date;

        $paths = [];
        if ($request->hasFile('media')) {
            foreach ($request->file('media') as $file) {
                $paths[] = $file->store("spaces/{$space->id}/timeline", 'public');
            }
        }

        $timeline->media_paths = $paths;
        $timeline->save();

        return redirect()
            ->route('timeline.index', ['space' => $space->slug])
            ->with('success', 'Timeline berhasil ditambahkan!');
    }

    public function edit(Space $space, $id)
    {
        $this->authorizeSpace($space);

        $item = LoveTimeline::where('space_id', $space->id)->findOrFail($id);

        return Inertia::render('Timeline/Edit', [
            'item' => $item,
            'space' => $this->spacePayload($space),
        ]);
    }

    public function update(Request $r, Space $space, $id)
    {
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
                $paths[] = $file->store("spaces/{$space->id}/timeline", 'public');
            }
        }

        $item->update([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'date' => $data['date'],
            'media_paths' => $paths,
        ]);

        return redirect()->route('timeline.index', ['space' => $space->slug])
            ->with('success', 'Timeline berhasil diperbarui!');
    }

    public function destroy(Space $space, $id)
    {
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

    private function spacePayload(Space $space): array
    {
        return [
            'id' => $space->id,
            'slug' => $space->slug,
            'title' => $space->title,
        ];
    }
}
