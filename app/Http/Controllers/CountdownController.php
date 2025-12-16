<?php

namespace App\Http\Controllers;

use App\Models\Countdown;
use Illuminate\Http\Request;

class CountdownController extends Controller
{
    public function index()
    {
        return Countdown::where('user_id', auth()->id())->latest()->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string',
            'event_date' => 'required|date'
        ]);
        $data['user_id'] = auth()->id();
        return Countdown::create($data);
    }

    public function update(Request $request, Countdown $countdown)
    {
        abort_if($countdown->user_id !== auth()->id(), 403);
        $data = $request->validate([
            'title' => 'required|string',
            'event_date' => 'required|date'
        ]);
        $countdown->update($data);
        return $countdown;
    }

    public function destroy(Countdown $countdown)
    {
        abort_if($countdown->user_id !== auth()->id(), 403);
        $countdown->delete();
        return response()->noContent();
    }
}
