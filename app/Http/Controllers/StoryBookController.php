<?php

namespace App\Http\Controllers;

use App\Models\Space;
use App\Services\MemoryLaneContentService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StoryBookController extends Controller
{
    public function __construct(private readonly MemoryLaneContentService $memoryLaneContentService)
    {
    }

    public function show(Space $space)
    {
        $pages = $this->memoryLaneContentService->scrapbookPages($space);

        return Inertia::render('Surprise/StoryBookPage', [
            'space' => [
                'id' => $space->id,
                'slug' => $space->slug,
                'title' => $space->title,
            ],
            'pages' => $pages,
        ]);
    }
}