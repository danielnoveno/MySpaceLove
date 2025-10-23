<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MediaGallery;
use App\Models\Space;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MediaGalleryApiController extends Controller
{
    public function index(Space $space)
    {
        $this->authorizeSpace($space);

        $gallery = MediaGallery::where('space_id', $space->id)->latest()->get();
        return Inertia::render('MediaGallery/Index', [
            'items' => $gallery,
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
        $total = count($files);

        foreach ($files as $index => $file) {
            $path = $file->store("spaces/{$space->slug}/media", 'public');
            $resolvedTitle = $data['title']
                ? ($total > 1
                    ? sprintf('%s (%d)', $data['title'], $index + 1)
                    : $data['title'])
                : pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);

            MediaGallery::create([
                'space_id' => $space->id,
                'user_id' => Auth::id(),
                'title' => $resolvedTitle,
                'file_path' => $path,
                'type' => $file->getClientMimeType(),
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

    public function destroy(Space $space, $id)
    {
        $this->authorizeSpace($space);

        $media = MediaGallery::where('space_id', $space->id)->findOrFail($id);
        if ($media->user_id !== Auth::id()) abort(403);

        Storage::disk('public')->delete($media->file_path);
        $media->delete();
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
