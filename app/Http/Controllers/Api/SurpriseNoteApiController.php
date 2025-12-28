<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SurpriseNote;
use App\Models\Space;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SurpriseNoteApiController extends Controller
{
    public function index(Space $space)
    {
        $this->authorizeSpace($space);

        // show notes; front-end will check unlock_date
        return SurpriseNote::where('space_id', $space->id)->latest()->get();
    }

    public function store(Request $r, Space $space)
    {
        $this->authorizeSpace($space);

        $data = $r->validate(['title' => 'nullable|string|max:255', 'message' => 'required|string', 'unlock_date' => 'required|date']);
        $data['space_id'] = $space->id;
        $data['user_id'] = Auth::id();

        $note = SurpriseNote::create($data);
        return response()->json($note, 201);
    }

    public function update(Request $r, Space $space, $id)
    {
        $this->authorizeSpace($space);

        $note = SurpriseNote::where('space_id', $space->id)->findOrFail($id);
        if ($note->user_id !== Auth::id()) abort(403);

        $data = $r->validate(['title' => 'nullable|string|max:255', 'message' => 'required|string', 'unlock_date' => 'required|date']);
        $note->update($data);
        return $note;
    }

    public function destroy(Space $space, $id)
    {
        $this->authorizeSpace($space);
        $note = SurpriseNote::where('space_id', $space->id)->findOrFail($id);
        if ($note->user_id !== Auth::id()) abort(403);
        $note->delete();
        return response()->json(['message' => 'deleted']);
    }

    private function authorizeSpace(Space $space)
    {
        if (!$space->hasMember(Auth::id())) abort(403);
    }
}
