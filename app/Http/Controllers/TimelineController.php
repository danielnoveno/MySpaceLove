<?php

namespace App\Http\Controllers;

use App\Models\Timeline;
use Illuminate\Http\Request;

class TimelineController extends Controller
{
    public function index()
    {
        return Timeline::where('user_id', auth()->id())->latest()->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'content' => 'required|string',
            'media' => 'nullable|string',
            'tag' => 'nullable|string',
        ]);
        $data['user_id'] = auth()->id();
        return Timeline::create($data);
    }

    public function update(Request $request, Timeline $timeline)
    {
        abort_if($timeline->user_id !== auth()->id(), 403);
        $data = $request->validate([
            'content' => 'required|string',
            'media' => 'nullable|string',
            'tag' => 'nullable|string',
        ]);
        $timeline->update($data);
        return $timeline;
    }

    public function destroy(Timeline $timeline)
    {
        abort_if($timeline->user_id !== auth()->id(), 403);
        $timeline->delete();
        return response()->noContent();
    }
}
