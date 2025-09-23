<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MediaGallery;
use App\Models\Space;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class MediaGalleryApiController extends Controller
{
    public function index($spaceId)
    {
        $space = Space::findOrFail($spaceId);
        $this->authorizeSpace($space);
        return MediaGallery::where('space_id', $space->id)->latest()->get();
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

        return response()->json($media, 201);
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
        return response()->json($media);
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
