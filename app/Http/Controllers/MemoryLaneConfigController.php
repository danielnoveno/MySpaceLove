<?php

namespace App\Http\Controllers;

use App\Models\MemoryLaneConfig;
use App\Models\Space;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MemoryLaneConfigController extends Controller
{
    public function edit(Space $space)
    {
        $this->authorizeSpace($space);

        $space->loadMissing('memoryLaneConfig');
        $config = $space->memoryLaneConfig;

        $defaults = __('surprise.memory_lane.puzzle.levels');

        $levels = collect(range(1, 3))->map(function (int $index) use ($config, $defaults, $space) {
            $default = $defaults[$index - 1] ?? null;
            $imageAttribute = "level_{$index}_image";
            $titleAttribute = "level_{$index}_title";
            $bodyAttribute = "level_{$index}_body";

            $storedPath = $config?->{$imageAttribute};
            $resolvedImage = $storedPath ? Storage::disk('public')->url($storedPath) : null;

            return [
                'key' => "level_{$index}",
                'label' => $default['label'] ?? "Level {$index}",
                'image' => $resolvedImage,
                'image_path' => $storedPath,
                'default_image' => $default['image'] ?? null,
                'title' => $config?->{$titleAttribute} ?? $default['summaryTitle'] ?? null,
                'body' => $config?->{$bodyAttribute} ?? $default['summaryBody'] ?? null,
            ];
        });

        return Inertia::render('Surprise/MemoryLaneConfig', [
            'space' => [
                'id' => $space->id,
                'slug' => $space->slug,
                'title' => $space->title,
            ],
            'levels' => $levels,
        ]);
    }

    public function update(Request $request, Space $space)
    {
        $this->authorizeSpace($space);

        $validated = $request->validate([
            'level_one_title' => ['nullable', 'string', 'max:120'],
            'level_one_body' => ['nullable', 'string', 'max:800'],
            'level_one_image' => ['nullable', 'image', 'max:4096'],
            'level_one_reset' => ['nullable', 'boolean'],
            'level_two_title' => ['nullable', 'string', 'max:120'],
            'level_two_body' => ['nullable', 'string', 'max:800'],
            'level_two_image' => ['nullable', 'image', 'max:4096'],
            'level_two_reset' => ['nullable', 'boolean'],
            'level_three_title' => ['nullable', 'string', 'max:120'],
            'level_three_body' => ['nullable', 'string', 'max:800'],
            'level_three_image' => ['nullable', 'image', 'max:4096'],
            'level_three_reset' => ['nullable', 'boolean'],
        ]);

        $config = MemoryLaneConfig::firstOrNew(['space_id' => $space->id]);
        $storagePath = "spaces/{$space->id}/memory-lane";

        foreach ([1, 2, 3] as $index) {
            $imageField = "level_{$index}_image";
            $resetField = "level_{$index}_reset";
            if ($request->hasFile($imageField)) {
                if (!empty($config->{$imageField})) {
                    Storage::disk('public')->delete($config->{$imageField});
                }
                $config->{$imageField} = $request->file($imageField)->store($storagePath, 'public');
            } elseif ($request->boolean($resetField)) {
                if (!empty($config->{$imageField})) {
                    Storage::disk('public')->delete($config->{$imageField});
                }
                $config->{$imageField} = null;
            }

            $titleField = "level_{$index}_title";
            $bodyField = "level_{$index}_body";

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

        $config->space()->associate($space);
        $config->save();

        return redirect()
            ->route('memory-lane.edit', ['space' => $space->slug])
            ->with('success', __('Konfigurasi Memory Lane berhasil diperbarui.'));
    }

    private function authorizeSpace(Space $space): void
    {
        if (!$space->hasMember(Auth::id())) {
            abort(403);
        }
    }
}
