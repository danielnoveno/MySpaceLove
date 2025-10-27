<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MediaGallery;
use App\Models\Space;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class MediaGalleryApiController extends Controller
{
    public function index(Space $space)
    {
        $this->authorizeSpace($space);

        $records = MediaGallery::where('space_id', $space->id)
            ->orderByDesc('created_at')
            ->orderBy('collection_index')
            ->get();

        $collections = $records
            ->groupBy(fn (MediaGallery $item) => $item->collection_key ?? (string) $item->id)
            ->sortByDesc(function ($group) {
                $first = $group->sortBy('collection_index')->first();
                return optional($first?->created_at)->timestamp ?? 0;
            })
            ->values()
            ->map(function ($group) {
                /** @var \Illuminate\Support\Collection $group */
                $sorted = $group->sortBy('collection_index')->values();
                /** @var MediaGallery|null $cover */
                $cover = $sorted->first();

                return [
                    'collection_key' => $cover?->collection_key,
                    'title' => $cover?->title,
                    'created_at' => optional($cover?->created_at)->toIso8601String(),
                    'count' => $sorted->count(),
                    'items' => $sorted->map(function (MediaGallery $item) {
                        return [
                            'id' => $item->id,
                            'title' => $item->title,
                            'file_path' => $item->file_path,
                            'type' => $item->type,
                            'url' => Storage::disk('public')->url($item->file_path),
                            'collection_index' => $item->collection_index,
                        ];
                    })->values()->all(),
                ];
            });

        return Inertia::render('MediaGallery/Index', [
            'collections' => $collections,
            'space' => $this->spacePayload($space),
        ]);
    }

    public function create(Space $space)
    {
        $this->authorizeSpace($space);

        return Inertia::render('MediaGallery/Create', [
            'space' => $this->spacePayload($space),
        ]);
    }

    public function store(Request $r, Space $space)
    {
        $this->authorizeSpace($space);

        $data = $r->validate([
            'title' => 'nullable|string|max:255',
            'files' => 'required|array|min:1|max:12',
            'files.*' => 'required|file|mimes:jpg,jpeg,png,gif,mp4,mov|max:30720',
        ]);

        $files = $r->file('files', []);
        $collectionKey = (string) Str::uuid();
        $baseTitle = isset($data['title']) ? trim($data['title']) : null;

        foreach ($files as $index => $file) {
            $path = $file->store("spaces/{$space->slug}/media", 'public');
            $resolvedTitle = $baseTitle !== null && $baseTitle !== ''
                ? $baseTitle
                : pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);

            MediaGallery::create([
                'space_id' => $space->id,
                'user_id' => Auth::id(),
                'title' => $resolvedTitle,
                'file_path' => $path,
                'type' => $file->getClientMimeType(),
                'collection_key' => $collectionKey,
                'collection_index' => $index,
            ]);
        }

        return Inertia::location(route('gallery.index', ['space' => $space->slug]));
    }

    public function edit(Space $space, $id)
    {
        $this->authorizeSpace($space);

        $item = MediaGallery::where('space_id', $space->id)->findOrFail($id);

        return Inertia::render('MediaGallery/Edit', [
            'item' => $item,
            'space' => $this->spacePayload($space),
        ]);
    }

    public function update(Request $r, Space $space, $id)
    {
        $this->authorizeSpace($space);

        $media = MediaGallery::where('space_id', $space->id)->findOrFail($id);
        if ($media->user_id !== Auth::id()) abort(403);

        $data = $r->validate([
            'title' => 'nullable|string|max:255',
            'file'  => 'nullable|file|mimes:jpg,jpeg,png,gif,mp4,mov|max:30720',
        ]);

        if ($r->hasFile('file')) {
            Storage::disk('public')->delete($media->file_path);
            $media->file_path = $r->file('file')->store("spaces/{$space->slug}/media", 'public');
        }

        $media->update(['title' => $data['title'] ?? $media->title, 'file_path' => $media->file_path]);
        return Inertia::location(route('gallery.index', ['space' => $space->slug]));
    }

    public function destroy(Request $request, Space $space, $id)
    {
        $this->authorizeSpace($space);

        $media = MediaGallery::where('space_id', $space->id)->findOrFail($id);
        if ($media->user_id !== Auth::id()) abort(403);

        $collectionKey = $media->collection_key;

        Storage::disk('public')->delete($media->file_path);
        $media->delete();

        if ($collectionKey) {
            MediaGallery::where('space_id', $space->id)
                ->where('collection_key', $collectionKey)
                ->orderBy('collection_index')
                ->get()
                ->values()
                ->each(function (MediaGallery $item, int $order): void {
                    $item->forceFill(['collection_index' => $order])->saveQuietly();
                });
        }

        if ($request->wantsJson()) {
            return response()->json(['message' => 'deleted']);
        }

        return redirect()
            ->route('gallery.index', ['space' => $space->slug])
            ->with('success', __('Foto berhasil dihapus.'));
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
