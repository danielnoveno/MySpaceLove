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
    public function index($spaceId)
    {
        $space = Space::findOrFail($spaceId);
        $this->authorizeSpace($space);

        $timelines = $space->timelines()->orderBy('date')->get();

        return Inertia::render('Timeline/Index', [
            'timelines' => $timelines,
            'spaceId' => $spaceId,
        ]);
    }

    public function create($spaceId)
    {
        $space = Space::findOrFail($spaceId);
        $this->authorizeSpace($space);

        return Inertia::render('Timeline/Create', [
            'spaceId' => $space->id,
            'space'   => $space,
        ]);
    }

    public function store(Request $request, $spaceId)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date' => 'required|date',
            'media' => 'nullable|file|mimes:jpg,jpeg,png,mp4|max:10240',
        ]);

        $timeline = new LoveTimeline();
        $timeline->space_id = $spaceId;
        $timeline->title = $request->title;
        $timeline->description = $request->description;
        $timeline->date = $request->date;

        if ($request->hasFile('media')) {
            $timeline->media_path = $request->file('media')->store("spaces/{$spaceId}/timeline", 'public');
        }

        $timeline->save();

        return redirect()->route('timeline.index', $spaceId)
            ->with('success', 'Timeline berhasil ditambahkan!');
    }

    public function edit($spaceId, $id)
    {
        $item = LoveTimeline::where('space_id', $spaceId)->findOrFail($id);

        return Inertia::render('Timeline/Edit', [
            'item' => $item,
            'spaceId' => $spaceId,
        ]);
    }

    public function update(Request $r, $spaceId, $id)
    {
        // dd($r->all(), $r->getContent());

        $space = Space::findOrFail($spaceId);
        $this->authorizeSpace($space);

        $item = LoveTimeline::where('space_id', $space->id)->findOrFail($id);
        $data = $r->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date' => 'required|date',
            'media' => 'nullable|file|mimes:jpg,jpeg,png,gif,mp4,mov|max:20480'
        ]);

        if ($r->hasFile('media')) {
            if ($item->media_path) Storage::disk('public')->delete($item->media_path);
            $item->media_path = $r->file('media')->store("spaces/{$space->slug}/timeline", 'public');
        }

        $item->update($data);
        return redirect()->route('timeline.index', $spaceId)
            ->with('success', 'Timeline berhasil diperbarui!');
    }

    public function destroy($spaceId, $id)
    {
        $space = Space::findOrFail($spaceId);
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
}
