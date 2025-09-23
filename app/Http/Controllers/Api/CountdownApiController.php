<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Countdown;
use App\Models\Space;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CountdownApiController extends Controller
{
    public function index($spaceId)
    {
        $space = Space::findOrFail($spaceId);
        $this->authorizeSpace($space);
        return $space->countdowns()->orderBy('event_date')->get();
    }

    public function store(Request $r, $spaceId)
    {
        $space = Space::findOrFail($spaceId);
        $this->authorizeSpace($space);
        $data = $r->validate(['event_name' => 'required|string|max:255', 'event_date' => 'required|date']);
        $data['space_id'] = $space->id;
        return Countdown::create($data);
    }

    public function update(Request $r, $spaceId, $id)
    {
        $space = Space::findOrFail($spaceId);
        $this->authorizeSpace($space);
        $count = Countdown::where('space_id', $space->id)->findOrFail($id);
        $data = $r->validate(['event_name' => 'required|string|max:255', 'event_date' => 'required|date']);
        $count->update($data);
        return $count;
    }

    public function destroy($spaceId, $id)
    {
        $space = Space::findOrFail($spaceId);
        $this->authorizeSpace($space);
        $count = Countdown::where('space_id', $space->id)->findOrFail($id);
        $count->delete();
        return response()->json(['message' => 'deleted']);
    }

    private function authorizeSpace(Space $space)
    {
        if (!$space->hasMember(Auth::id())) abort(403);
    }
}
