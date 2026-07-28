<?php

namespace App\Http\Controllers;

use App\Events\ChatSent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    public function send(Request $request, $id)
    {
        $user = Auth::user()?->name ?? 'Guest';
        event(new ChatSent($id, $user, $request->message));

        return response()->json(['status' => 'sent']);
    }
}
