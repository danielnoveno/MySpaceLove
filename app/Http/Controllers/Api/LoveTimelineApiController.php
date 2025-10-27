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
            'media' => 'nullable|array|max:5',
            'media.*' => 'nullable|file|mimes:jpg,jpeg,png,gif,mp4,mov|max:20480',
            'media_keys' => 'nullable|array',
            'media_keys.*' => 'string',
            'removed' => 'nullable|array',
            'removed.*' => 'string',
            'ordered' => 'nullable|array',
            'ordered.*' => 'string',
        ]);

        $existingPaths = collect($item->media_paths ?? []);
        $removed = collect($data['removed'] ?? [])->filter()->unique()->values();
        $remainingExisting = $existingPaths
            ->reject(fn ($path) => $removed->contains($path))
            ->values()
            ->all();

        $incomingFiles = $r->file('media', []);
        if (count($remainingExisting) + count($incomingFiles) > 5) {
            return back()->withErrors([
                'media' => __('Maksimal 5 media per momen.'),
            ]);
        }

        $mediaKeys = $data['media_keys'] ?? [];
        $newUploads = [];
        foreach ($incomingFiles as $index => $file) {
            $storedPath = $file->store("spaces/{$space->id}/timeline", 'public');
            $newUploads[] = [
                'key' => $mediaKeys[$index] ?? null,
                'path' => $storedPath,
            ];
        }

        foreach ($removed as $removedPath) {
            if ($existingPaths->contains($removedPath)) {
                Storage::disk('public')->delete($removedPath);
            }
        }

        $orderedTokens = collect($data['ordered'] ?? [])->filter();
        $finalPaths = [];

        foreach ($orderedTokens as $token) {
            $existingIndex = array_search($token, $remainingExisting, true);
            if ($existingIndex !== false) {
                $finalPaths[] = $token;
                array_splice($remainingExisting, $existingIndex, 1);
                continue;
            }

            foreach ($newUploads as $upload) {
                if (($upload['key'] ?? null) === $token && !in_array($upload['path'], $finalPaths, true)) {
                    $finalPaths[] = $upload['path'];
                    break;
                }
            }
        }

        foreach ($remainingExisting as $path) {
            if (!in_array($path, $finalPaths, true)) {
                $finalPaths[] = $path;
            }
        }

        foreach ($newUploads as $upload) {
            if (!in_array($upload['path'], $finalPaths, true)) {
                $finalPaths[] = $upload['path'];
            }
        }

        $thumbnailPath = $item->thumbnail_path;
        if ($thumbnailPath && !in_array($thumbnailPath, $finalPaths, true)) {
            $thumbnailPath = $finalPaths[0] ?? null;
        }

        $item->update([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'date' => $data['date'],
            'media_paths' => $finalPaths,
            'thumbnail_path' => $thumbnailPath,
        ]);

        return redirect()->route('timeline.index', ['space' => $space->slug])
            ->with('success', 'Timeline berhasil diperbarui!');
    }

    public function destroy(Request $request, Space $space, $id)
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

        if ($request->wantsJson()) {
            return response()->json(['message' => 'deleted']);
        }

        return redirect()
            ->route('timeline.index', ['space' => $space->slug])
            ->with('success', __('Momen berhasil dihapus.'));
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
