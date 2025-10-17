<?php

namespace App\Http\Controllers;

use App\Models\DailyMessage;
use Illuminate\Http\Request;

class DailyMessageController extends Controller
{
    public function index()
    {
        return DailyMessage::where('user_id', auth()->id())->latest()->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'message' => 'required|string',
            'is_ai_generated' => 'boolean'
        ]);
        $data['user_id'] = auth()->id();
        return DailyMessage::create($data);
    }

    public function update(Request $request, DailyMessage $dailyMessage)
    {
        abort_if($dailyMessage->user_id !== auth()->id(), 403);
        $data = $request->validate([
            'message' => 'required|string',
            'is_ai_generated' => 'boolean'
        ]);
        $dailyMessage->update($data);
        return $dailyMessage;
    }

    public function destroy(DailyMessage $dailyMessage)
    {
        abort_if($dailyMessage->user_id !== auth()->id(), 403);
        $dailyMessage->delete();
        return response()->noContent();
    }
}
