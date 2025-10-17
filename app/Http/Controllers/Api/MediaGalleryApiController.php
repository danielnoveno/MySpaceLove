<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MediaGallery;
use App\Models\Space;
use Doctrine\DBAL\Schema\Index;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MediaGalleryApiController extends Controller
{
    public function index($spaceId)
    {
        $space = Space::findOrFail($spaceId);
        $this->authorizeSpace($space);

        $gallery = MediaGallery::where('space_id', $space->id)->latest()->get();
        return Inertia::render('MediaGallery/Index', [
            'items' => $gallery,
            'spaceId' => $spaceId,
        ]);
    }

    public function create($spaceId)
    {
        $space = Space::findOrFail($spaceId);
        $this->authorizeSpace($space);

        return Inertia::render('MediaGallery/Create', [
            'spaceId' => $space->id,
            'space'   => $space,
        ]);
    }

    public function store(Request $r, $spaceId)
    {
        $space = Space::findOrFail($spaceId);
        $this->authorizeSpace($space);

        $data = $r->validate([
            'title' => 'nullable|string|max:255',
            'file'  => 'required|file|mimes:jpg,jpeg,png,gif,mp4,mov|max:30720',
        ]);

        $path = $r->file('file')->store("spaces/{$space->slug}/media", 'public');

        $media = MediaGallery::create([
            'space_id' => $space->id,
            'user_id'  => Auth::id(),
            'title'    => $data['title'] ?? null,
            'file_path' => $path,
            'type'     => $r->file('file')->getClientMimeType()
        ]);

        return Inertia::location(route('media-gallery.index', ['spaceId' => $spaceId]));
    }

    public function edit($spaceId, $id)
    {
        $item = MediaGallery::where('space_id', $spaceId)->findOrFail($id);

        return Inertia::render('MediaGallery/Edit', [
            'item' => $item,
            'spaceId' => $spaceId,
        ]);
    }

    public function update(Request $r, $spaceId, $id)
    {
        $space = Space::findOrFail($spaceId);
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
        return Inertia::location(route('gallery.index', ['spaceId' => $spaceId]));
    }

    public function destroy($spaceId, $id)
    {
        $space = Space::findOrFail($spaceId);
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
}
