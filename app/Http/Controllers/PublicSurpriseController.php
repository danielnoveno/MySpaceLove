<?php

namespace App\Http\Controllers;

use App\Models\Space;
use App\Services\MemoryLaneContentService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicSurpriseController extends Controller
{
    public function __construct(private readonly MemoryLaneContentService $memoryLane)
    {
    }

    public function story(): Response
    {
        $storyBase = __('surprise.story_book');
        $defaultSpaceTitle = data_get($storyBase, 'defaults.spaceTitle', 'kita');

        $storyContent = __('surprise.story_book', [
            'spaceTitle' => $defaultSpaceTitle,
        ]);

        $memoryLaneContent = $this->memoryLane->resolve();
        $storyContent['secretGate']['code'] = $memoryLaneContent['secretGate']['code'] ?? '00000';

        $scrapbookMeta = data_get($storyContent, 'scrapbook', []);
        $scrapbookPages = $this->memoryLane->scrapbookPages();

        $storyContent['scrapbook'] = [
            'title' => $scrapbookMeta['title'] ?? 'Digital scrapbook',
            'subtitle' => $scrapbookMeta['subtitle'] ?? '',
            'empty' => $scrapbookMeta['empty'] ?? '',
            'cta' => $scrapbookMeta['cta'] ?? null,
            'manage_url' => null,
            'pages' => $scrapbookPages,
        ];

        unset($storyContent['defaults']);

        // Check verification for generic (session might use 'default' or similar)
        $isVerified = session()->get("memory_lane_access_default", false);

        return Inertia::render('Surprise/StoryBook', [
            'storyBook' => $storyContent,
            'isVerified' => $isVerified,
        ]);
    }

    public function spaceStory(Space $space): Response
    {
        $storyBase = __('surprise.story_book');
        $storyContent = __('surprise.story_book', [
            'spaceTitle' => $space->title ?? data_get($storyBase, 'defaults.spaceTitle', 'kita'),
        ]);

        $memoryLaneContent = $this->memoryLane->resolve($space);
        $storyContent['secretGate']['code'] = $memoryLaneContent['secretGate']['code'] ?? '00000';

        $scrapbookMeta = data_get($storyContent, 'scrapbook', []);
        
        $scrapbookPages = $this->memoryLane->flipbookPages($space);
        $coverData = $this->memoryLane->flipbookCoverData($space);

        $storyContent['scrapbook'] = [
            'title' => $scrapbookMeta['title'] ?? 'Digital scrapbook',
            'subtitle' => $scrapbookMeta['subtitle'] ?? '',
            'empty' => $scrapbookMeta['empty'] ?? '',
            'cta' => $scrapbookMeta['cta'] ?? null,
            'manage_url' => route('memory-lane.edit', ['space' => $space->slug]),
            'pages' => $scrapbookPages,
            'coverImage' => $coverData['image'],
            'coverTitle' => $coverData['title'],
        ];

        unset($storyContent['defaults']);

        $isVerified = session()->get("memory_lane_access_{$space->slug}", false);

        return Inertia::render('Surprise/StoryBook', [
            'space' => [
                'id' => $space->id,
                'slug' => $space->slug,
                'title' => $space->title,
            ],
            'storyBook' => $storyContent,
            'isVerified' => $isVerified,
        ]);
    }

    public function memory(Request $request): Response
    {
        $memoryContent = $this->memoryLane->resolve();
        $skipPuzzle = config('app.debug') || $request->boolean('skipPuzzle');
        $isVerified = session()->get("memory_lane_access_default", false);

        return Inertia::render('Surprise/MemoryLanePublic', [
            'memoryLane' => $memoryContent,
            'skipPuzzle' => $skipPuzzle,
            'isVerified' => $isVerified,
        ]);
    }

    public function spaceMemory(Request $request, Space $space): Response
    {
        $memoryContent = $this->memoryLane->resolve($space);
        $skipPuzzle = config('app.debug') || $request->boolean('skipPuzzle');
        $isVerified = session()->get("memory_lane_access_{$space->slug}", false);

        return Inertia::render('Surprise/MemoryLanePublic', [
            'space' => [
                'id' => $space->id,
                'slug' => $space->slug,
                'title' => $space->title,
            ],
            'memoryLane' => $memoryContent,
            'skipPuzzle' => $skipPuzzle,
            'isVerified' => $isVerified,
        ]);
    }
}
