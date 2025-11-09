<?php

namespace App\Http\Controllers;

use App\Models\Space;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StoryBookController extends Controller
{
    public function show(Space $space)
    {
        return Inertia::render('Surprise/StoryBookPage', [
            'space' => [
                'id' => $space->id,
                'slug' => $space->slug,
                'title' => $space->title,
            ],
        ]);
    }
}