<?php

namespace App\Http\Controllers;

use App\Models\MemoryLaneConfig;
use App\Models\Space;
use App\Services\MemoryLaneContentService;
use App\Services\UploadedFileProcessor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MemoryLaneConfigController extends Controller
{
    public function __construct(
        private readonly MemoryLaneContentService $memoryLaneContentService,
        private readonly UploadedFileProcessor $fileProcessor
    )
    {
    }

    public function edit(Space $space)
    {
        $this->authorizeSpace($space);

        $levels = $this->memoryLaneContentService->editorLevels($space);
        $config = $space->memoryLaneConfig;

        // Process flipbook pages to include full image URLs
        $flipbookPages = $config?->flipbook_pages ?? [];
        if (!empty($flipbookPages) && is_array($flipbookPages)) {
            $disk = Storage::disk('public');
            $flipbookPages = collect($flipbookPages)->map(function ($page) use ($disk) {
                if (!empty($page['image']) && $disk->exists($page['image'])) {
                    $page['image'] = asset(Storage::url($page['image']));
                }
                return $page;
            })->all();
        }

        return Inertia::render('Surprise/MemoryLaneConfig', [
            'space' => [
                'id' => $space->id,
                'slug' => $space->slug,
                'title' => $space->title,
            ],
            'levels' => $levels,
            'pin' => $config?->pin ?? '00000',
            'contentSet' => $config?->content_set ?? false,
            'activeLevels' => $config?->active_levels ?? 3,
            'defaultRewards' => config('memory_lane_rewards.default_rewards', []),
            'customRewards' => $config?->custom_rewards ?? [],
            'flipbookPages' => $flipbookPages,
            'flipbookCoverImage' => $config?->flipbook_cover_image ? asset(Storage::url($config->flipbook_cover_image)) : null,
            'flipbookCoverTitle' => $config?->flipbook_cover_title ?? '',
        ]);
    }

    public function update(Request $request, Space $space)
    {
        $this->authorizeSpace($space);

        $validated = $request->validate(
            [
                'level_one_title' => ['nullable', 'string', 'max:120'],
                'level_one_body' => ['nullable', 'string', 'max:800'],
                'level_one_image' => ['nullable', 'image', 'max:10240'],
                'level_one_reset' => ['nullable', 'boolean'],
                'level_two_title' => ['nullable', 'string', 'max:120'],
                'level_two_body' => ['nullable', 'string', 'max:800'],
                'level_two_image' => ['nullable', 'image', 'max:10240'],
                'level_two_reset' => ['nullable', 'boolean'],
                'level_three_title' => ['nullable', 'string', 'max:120'],
                'level_three_body' => ['nullable', 'string', 'max:800'],
                'level_three_image' => ['nullable', 'image', 'max:10240'],
                'level_three_reset' => ['nullable', 'boolean'],
                'active_levels' => ['required', 'integer', 'min:0', 'max:3'],
                'pin' => ['nullable', 'string', 'min:4', 'max:10'],
                'custom_rewards' => ['nullable', 'array'],
                'custom_rewards.*.id' => ['required', 'integer'],
                'custom_rewards.*.enabled' => ['nullable', 'boolean'],
                'flipbook_pages' => ['nullable', 'array', 'max:10'],
                'flipbook_pages.*.id' => ['nullable'],
                'flipbook_pages.*.title' => ['nullable', 'string', 'max:200'],
                'flipbook_pages.*.body' => ['nullable', 'string', 'max:2000'],
                'flipbook_pages.*.image' => ['nullable', 'string'],
                'flipbook_pages.*.image_file' => ['nullable', 'image', 'max:10240'],
                'flipbook_cover_image' => ['nullable', 'image', 'max:10240'],
                'flipbook_cover_title' => ['nullable', 'string', 'max:200'],
            ],
            [
                'level_one_image.max' => __('errors.memory_lane.kit_image_too_large'),
                'level_two_image.max' => __('errors.memory_lane.kit_image_too_large'),
                'level_three_image.max' => __('errors.memory_lane.kit_image_too_large'),
                'flipbook_pages.*.image_file.max' => __('errors.memory_lane.kit_image_too_large'),
                'flipbook_cover_image.max' => __('errors.memory_lane.kit_image_too_large'),
            ],
        );

        $config = MemoryLaneConfig::firstOrNew(['space_id' => $space->id]);
        $storagePath = "spaces/{$space->id}/memory-lane";

        foreach ([1, 2, 3] as $index) {
            $levelWord = match ($index) {
                1 => 'one',
                2 => 'two',
                3 => 'three',
            };
            $imageField = "level_{$levelWord}_image";
            $resetField = "level_{$levelWord}_reset";
            if ($request->hasFile($imageField)) {
                if (!empty($config->{$imageField})) {
                    Storage::disk('public')->delete($config->{$imageField});
                }
                $stored = $this->fileProcessor->store(
                    $request->file($imageField),
                    $storagePath,
                    'public',
                    'errors.memory_lane.kit_image_too_large',
                    $imageField,
                );
                $config->{$imageField} = $stored['path'];
            } elseif ($request->boolean($resetField)) {
                if (!empty($config->{$imageField})) {
                    Storage::disk('public')->delete($config->{$imageField});
                }
                $config->{$imageField} = null;
            }

            $titleField = "level_{$levelWord}_title";
            $bodyField = "level_{$levelWord}_body";

            if (array_key_exists($titleField, $validated)) {
                $config->{$titleField} = filled($validated[$titleField])
                    ? $validated[$titleField]
                    : null;
            }

            if (array_key_exists($bodyField, $validated)) {
                $config->{$bodyField} = filled($validated[$bodyField])
                    ? $validated[$bodyField]
                    : null;
            }
        }

        // Normalize PIN: trim whitespace and convert to lowercase for consistency
        $normalizedPin = !empty($validated['pin'])
            ? strtolower(trim(preg_replace('/\s+/', '', $validated['pin'])))
            : '00000';
        $config->pin = $normalizedPin;
        $config->active_levels = $validated['active_levels'] ?? 3;

        // Process custom rewards
        if (isset($validated['custom_rewards'])) {
            $config->custom_rewards = $validated['custom_rewards'];
        }

        // Process flipbook pages with image uploads
        if (isset($validated['flipbook_pages'])) {
            $flipbookPages = [];
            
            foreach ($validated['flipbook_pages'] as $index => $page) {
                // Extract storage path from full URL if needed
                $existingImagePath = $page['image'] ?? null;
                if ($existingImagePath && str_starts_with($existingImagePath, '/storage/')) {
                    // Remove /storage/ prefix to get the actual path
                    $existingImagePath = substr($existingImagePath, 9);
                } elseif ($existingImagePath && str_starts_with($existingImagePath, 'http')) {
                    // If it's a full URL, extract the path after /storage/
                    $existingImagePath = null; // Don't use URL, will be replaced
                }

                $processedPage = [
                    'id' => $page['id'] ?? uniqid('page_'),
                    'title' => $page['title'] ?? '',
                    'body' => $page['body'] ?? '',
                    'image' => $existingImagePath,
                ];

                // Handle image file upload for this page
                $imageFileKey = "flipbook_pages.{$index}.image_file";
                if ($request->hasFile($imageFileKey)) {
                    // Delete old image if exists
                    if (!empty($processedPage['image'])) {
                        Storage::disk('public')->delete($processedPage['image']);
                    }

                    $stored = $this->fileProcessor->store(
                        $request->file($imageFileKey),
                        "{$storagePath}/flipbook",
                        'public',
                        'errors.memory_lane.kit_image_too_large',
                        $imageFileKey,
                    );
                    $processedPage['image'] = $stored['path'];
                }

                // Only add pages that have content
                if (!empty($processedPage['title']) || !empty($processedPage['body']) || !empty($processedPage['image'])) {
                    $flipbookPages[] = $processedPage;
                }
            }

            $config->flipbook_pages = $flipbookPages;
        }

        // Process flipbook cover image
        if ($request->hasFile('flipbook_cover_image')) {
            // Delete old cover image if exists
            if (!empty($config->flipbook_cover_image)) {
                Storage::disk('public')->delete($config->flipbook_cover_image);
            }

            $stored = $this->fileProcessor->store(
                $request->file('flipbook_cover_image'),
                "{$storagePath}/flipbook",
                'public',
                'errors.memory_lane.kit_image_too_large',
                'flipbook_cover_image',
            );
            $config->flipbook_cover_image = $stored['path'];
        }

        // Process flipbook cover title
        if (array_key_exists('flipbook_cover_title', $validated)) {
            $config->flipbook_cover_title = filled($validated['flipbook_cover_title'])
                ? $validated['flipbook_cover_title']
                : null;
        }

        $config->content_set = $this->memoryLaneContentService->isContentSet($config);

        $config->space()->associate($space);
        $config->save();

        return redirect()
            ->route('memory-lane.edit', ['space' => $space->slug])
            ->with('success', __('memory_lane.config.flash.success'));
    }

    private function authorizeSpace(Space $space): void
    {
        if (!$space->hasMember(Auth::id())) {
            abort(403);
        }
    }

    public function verifyPin(Request $request, Space $space)
    {
        $validated = $request->validate([
            'pin' => ['required', 'string', 'min:4', 'max:10'],
        ]);

        $config = MemoryLaneConfig::where('space_id', $space->id)->first();

        // Normalize input PIN to match the normalization used when saving
        $normalizedInputPin = strtolower(trim(preg_replace('/\s+/', '', $validated['pin'])));

        if (!$config || $config->pin !== $normalizedInputPin) {
            return back()->withErrors([
                'pin' => __('memory_lane.config.access.pin_invalid'),
            ]);
        }

        $request->session()->put("memory_lane_access_{$space->slug}", true);

        return redirect()->route('surprise.memory.space', ['space' => $space->slug]);
    }
}
