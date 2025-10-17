<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LoveJournal;
use App\Models\Space;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LoveJournalApiController extends Controller
{
    public function index($spaceId)
    {
        $space = Space::findOrFail($spaceId);
        $this->authorizeSpace($space);
        // return LoveJournal::where('space_id', $space->id)->latest()->get();

        $journals = LoveJournal::where('space_id', $space->id)->latest()->get();

        return Inertia::render('Journals/Index', [
            'items' => $journals,
            'spaceId' => $spaceId,
        ]);
    }

    public function store(Request $r, $spaceId)
    {
        $space = Space::findOrFail($spaceId);
        $this->authorizeSpace($space);

        $data = $r->validate(['title' => 'required|string|max:255', 'content' => 'required|string', 'mood' => 'nullable|in:happy,sad,miss,excited']);
        $data['space_id'] = $space->id;
        $data['user_id'] = Auth::id();

        $journal = LoveJournal::create($data);
        return Inertia::location(route('journal.index', ['spaceId' => $spaceId]));
    }

    public function update(Request $r, $spaceId, $id)
    {
        $space = Space::findOrFail($spaceId);
        $this->authorizeSpace($space);
        $journal = LoveJournal::where('space_id', $space->id)->findOrFail($id);

        // only allow author to update their own journal
        if ($journal->user_id !== Auth::id()) abort(403);

        $data = $r->validate(['title' => 'required|string|max:255', 'content' => 'required|string', 'mood' => 'nullable|in:happy,sad,miss,excited']);
        $journal->update($data);
        return Inertia::location(route('journal.index', ['spaceId' => $spaceId]));
    }

    public function destroy($spaceId, $id)
    {
        $space = Space::findOrFail($spaceId);
        $this->authorizeSpace($space);
        $journal = LoveJournal::where('space_id', $space->id)->findOrFail($id);
        if ($journal->user_id !== Auth::id()) abort(403);
        $journal->delete();
        return response()->json(['message' => 'deleted']);
    }

    public function create($spaceId)
    {
        $space = Space::findOrFail($spaceId);
        $this->authorizeSpace($space);
        return Inertia::render('Journals/Create', [
            'spaceId' => $space->id,
            'space'   => $space,
        ]);
    }

    public function edit($spaceId, $id)
    {
        $space = Space::findOrFail($spaceId);
        $this->authorizeSpace($space);
        $journal = LoveJournal::where('space_id', $space->id)->findOrFail($id);

        return Inertia::render('Journals/Edit', [
            'journal' => $journal,
            'spaceId' => $spaceId,
        ]);
    }

    private function authorizeSpace(Space $space)
    {
        if (!$space->hasMember(Auth::id())) abort(403);
    }
}
