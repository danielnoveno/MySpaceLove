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

        return Inertia::render('Surprise/MemoryLaneConfig', [
            'space' => [
                'id' => $space->id,
                'slug' => $space->slug,
                'title' => $space->title,
            ],
            'levels' => $levels,
            'pin' => $space->memoryLaneConfig?->pin,
            'contentSet' => $space->memoryLaneConfig?->content_set ?? false,
        ]);
    }

    public function update(Request $request, Space $space)
    {
        $this->authorizeSpace($space);

        $validated = $request->validate([
            'level_one_title' => ['nullable', 'string', 'max:120'],
            'level_one_body' => ['nullable', 'string', 'max:800'],
            'level_one_image' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
            'level_one_reset' => ['nullable', 'boolean'],
            'level_two_title' => ['nullable', 'string', 'max:120'],
            'level_two_body' => ['nullable', 'string', 'max:800'],
            'level_two_image' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
            'level_two_reset' => ['nullable', 'boolean'],
            'level_three_title' => ['nullable', 'string', 'max:120'],
            'level_three_body' => ['nullable', 'string', 'max:800'],
            'level_three_image' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
            'level_three_reset' => ['nullable', 'boolean'],
            'pin' => ['nullable', 'string', 'min:4', 'max:10'],
        ]);

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
                    $imageField,
                    'app.uploads.errors.memory_lane_image_too_large'
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

        $config->pin = $validated['pin'] ?? null;

        $config->content_set = $this->memoryLaneContentService->isContentSet($config);

        $config->space()->associate($space);
        $config->save();

        if ($request->has('pin')) {
            return redirect()
                ->route('memory-lane.edit', ['space' => $space->slug])
                ->with('success', __('memory_lane.flash.pin_updated'));
        }

        return redirect()
            ->route('memory-lane.edit', ['space' => $space->slug])
            ->with('success', __('memory_lane.flash.saved'));
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

        if (!$config || $config->pin !== $validated['pin']) {
            return back()->withErrors(['pin' => __('memory_lane.validation.pin_invalid')]);
        }

        $request->session()->put("memory_lane_access_{$space->slug}", true);

        return redirect()->route('surprise.memory.space', ['space' => $space->slug]);
    }
}
