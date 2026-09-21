<?php

namespace App\Http\Controllers;

use App\Models\Space;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MessageController extends Controller
{
    public function index(Request $request, Space $space): Response
    {
        abort_unless($space->hasMember($request->user()?->id), 403);

        $request->attributes->set('currentSpace', $space);

        return Inertia::render('Messages/Index', [
            'space' => [
                'id' => $space->id,
                'slug' => $space->slug,
                'title' => $space->title,
            ],
            'messagesRoute' => route('api.spaces.chat.messages.index', ['space' => $space->slug]),
            'sendRoute' => route('api.spaces.chat.messages.store', ['space' => $space->slug]),
            'markReadRoute' => route('api.spaces.chat.messages.read', ['space' => $space->slug]),
            'gifSearchRoute' => route('klipy.gifs.search'),
        ]);
    }
}
