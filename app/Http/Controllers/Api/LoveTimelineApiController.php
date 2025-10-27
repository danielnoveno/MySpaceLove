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

        $timelines = $space->timelines()
            ->orderBy('date')
            ->get()
            ->map(function (LoveTimeline $timeline) use ($space) {
                $mediaPaths = $timeline->media_paths ?? [];
                $thumbnail = $timeline->thumbnail_path;

                if ($thumbnail && !in_array($thumbnail, $mediaPaths, true)) {
                    $thumbnail = null;
                }

                $resolvedThumbnail = $thumbnail
                    ? Storage::disk('public')->url($thumbnail)
                    : ($mediaPaths ? Storage::disk('public')->url($mediaPaths[0]) : null);

                return [
                    'id' => $timeline->id,
                    'title' => $timeline->title,
                    'description' => $timeline->description,
                    'date' => $timeline->date?->toDateString(),
                    'media_paths' => $mediaPaths,
                    'thumbnail_path' => $thumbnail,
                    'thumbnail_url' => $resolvedThumbnail,
                    'media_urls' => collect($mediaPaths)->map(fn ($path) => Storage::disk('public')->url($path))->all(),
                ];
            });

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
        $timeline->thumbnail_path = $paths[0] ?? null;
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

        $thumbnailPath = $item->thumbnail_path;
        if ($thumbnailPath && !in_array($thumbnailPath, $paths, true)) {
            $thumbnailPath = $paths[0] ?? null;
        }

        $item->update([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'date' => $data['date'],
            'media_paths' => $paths,
            'thumbnail_path' => $thumbnailPath,
        ]);

        return redirect()->route('timeline.index', ['space' => $space->slug])
            ->with('success', 'Timeline berhasil diperbarui!');
    }

    public function destroy(Space $space, $id)
    {
        $this->authorizeSpace($space);

        $item = LoveTimeline::where('space_id', $space->id)->findOrFail($id);

        $mediaPaths = $item->media_paths ?? [];
        foreach ($mediaPaths as $path) {
            Storage::disk('public')->delete($path);
        }

        if ($item->thumbnail_path && !in_array($item->thumbnail_path, $mediaPaths, true)) {
            Storage::disk('public')->delete($item->thumbnail_path);
        }

        $item->delete();
        return response()->json(['message' => 'deleted']);
    }

    public function setThumbnail(Request $request, Space $space, LoveTimeline $timeline)
    {
        $this->authorizeSpace($space);

        if ($timeline->space_id !== $space->id) {
            abort(404);
        }

        $data = $request->validate([
            'path' => ['nullable', 'string'],
        ]);

        $path = $data['path'] ?? null;
        $media = $timeline->media_paths ?? [];

        if ($path !== null && !in_array($path, $media, true)) {
            return response()->json([
                'message' => 'Thumbnail tidak valid.',
            ], 422);
        }

        $timeline->update([
            'thumbnail_path' => $path,
        ]);

        return response()->json([
            'message' => 'Thumbnail berhasil diperbarui.',
            'thumbnail_path' => $path,
            'thumbnail_url' => $path ? Storage::disk('public')->url($path) : null,
        ]);
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
