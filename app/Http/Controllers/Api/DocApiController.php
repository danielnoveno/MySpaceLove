<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Doc;
use App\Models\Space;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class DocApiController extends Controller
{
    public function index($spaceId)
    {
        $space = Space::findOrFail($spaceId);
        $this->authorizeSpace($space);
        return $space->docs()->latest()->get();
    }

    public function store(Request $r, $spaceId)
    {
        $space = Space::findOrFail($spaceId);
        $this->authorizeSpace($space);

        $data = $r->validate([
            'title' => 'nullable|string|max:255',
            'file' => 'required|file|mimes:pdf,doc,docx,xlsx,png,jpg,jpeg|max:51200',
            'notes' => 'nullable|string'
        ]);

        $path = $r->file('file')->store("spaces/{$space->slug}/docs", 'public');

        $doc = Doc::create([
            'space_id' => $space->id,
            'user_id'  => Auth::id(),
            'title'    => $data['title'] ?? null,
            'file_path' => $path,
            'notes'    => $data['notes'] ?? null
        ]);

        return response()->json($doc, 201);
    }

    public function destroy($spaceId, $id)
    {
        $space = Space::findOrFail($spaceId);
        $this->authorizeSpace($space);
        $doc = Doc::where('space_id', $space->id)->findOrFail($id);
        if ($doc->user_id !== Auth::id()) abort(403);
        Storage::disk('public')->delete($doc->file_path);
        $doc->delete();
        return response()->json(['message' => 'deleted']);
    }

    private function authorizeSpace(Space $space)
    {
        if (!$space->hasMember(Auth::id())) abort(403);
    }
}
