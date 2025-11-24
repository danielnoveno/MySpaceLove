<?php

namespace App\Services;

use App\Models\MemoryLaneConfig;
use App\Models\Space;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

class MemoryLaneContentService
{
    public function resolve(?Space $space = null): array
    {
        $memoryBase = __('surprise.memory_lane');
        $grid = data_get($memoryBase, 'puzzle.grid', ['rows' => 4, 'cols' => 4]);
        $defaultSpaceTitle = data_get($memoryBase, 'defaults.spaceTitle', 'us');
        $spaceTitle = $space?->title ?? $defaultSpaceTitle;

        $content = __('surprise.memory_lane', [
            'spaceTitle' => $spaceTitle,
            'rows' => $grid['rows'] ?? 4,
            'cols' => $grid['cols'] ?? 4,
        ]);

        $content['puzzle']['grid'] = $grid;
        $levels = collect($content['puzzle']['levels'] ?? [])->values();
        unset($content['defaults']);

        $config = $this->fetchConfig($space);

        if ($config) {
            $disk = Storage::disk('public');
            $overrides = $this->configLevels($config);

            $levels = $levels->map(function (array $level, int $index) use ($overrides, $disk) {
                $mapping = $overrides[$index] ?? null;

                if ($mapping === null) {
                    return $level;
                }

                if ($mapping['image'] && $disk->exists($mapping['image'])) {
                    $level['image'] = Storage::url($mapping['image']);
                }

                if (!empty($mapping['title'])) {
                    $level['summaryTitle'] = $mapping['title'];
                }

                if (!empty($mapping['body'])) {
                    $level['summaryBody'] = $mapping['body'];
                }

                return $level;
            });
        }

        $content['puzzle']['levels'] = $levels->values()->all();

        return $content;
    }

    public function resolveLevels(?Space $space = null): array
    {
        $content = $this->resolve($space);

        return $content['puzzle']['levels'] ?? [];
    }

    public function editorLevels(Space $space): array
    {
        $resolvedLevels = Collection::make($this->resolveLevels($space));
        $defaultLevels = Collection::make($this->resolveLevels());
        $config = $this->fetchConfig($space);
        $disk = Storage::disk('public');

        return $resolvedLevels
            ->map(function (array $level, int $index) use ($config, $disk, $defaultLevels) {
                $levelWord = match ($index) {
                    0 => 'one',
                    1 => 'two',
                    2 => 'three',
                    default => null,
                };

                if ($levelWord === null) {
                    return $level;
                }

                $imageAttribute = "level_{$levelWord}_image";
                $titleAttribute = "level_{$levelWord}_title";
                $bodyAttribute = "level_{$levelWord}_body";

                $storedPath = $config?->{$imageAttribute};
                $defaultLevel = $defaultLevels->get($index, []);
                $imageUrl = null;
                if ($storedPath && $disk->exists($storedPath)) {
                    $imageUrl = Storage::url($storedPath);
                }

                return [
                    'key' => "level_{$levelWord}",
                    'label' => $level['label'] ?? "Level " . ($index + 1),
                    'image' => $imageUrl,
                    'image_path' => $storedPath,
                    'default_image' => $defaultLevel['image'] ?? $level['image'] ?? null,
                    'title' => $config?->{$titleAttribute} ?? $level['summaryTitle'] ?? null,
                    'body' => $config?->{$bodyAttribute} ?? $level['summaryBody'] ?? null,
                ];
            })
            ->values()
            ->all();
    }

    public function scrapbookPages(?Space $space = null): array
    {
        return Collection::make($this->resolveLevels($space))
            ->map(function (array $level, int $index) {
                return [
                    'id' => $level['id'] ?? "scrapbook-level-" . ($index + 1),
                    'label' => $level['label'] ?? "Level " . ($index + 1),
                    'title' => $level['summaryTitle'] ?? $level['label'] ?? "Level " . ($index + 1),
                    'body' => $level['summaryBody'] ?? '',
                    'image' => $level['image'] ?? $level['default_image'] ?? null,
                ];
            })
            ->filter(function (array $page) {
                return ($page['image'] ?? null) || ($page['body'] ?? null) || ($page['title'] ?? null);
            })
            ->values()
            ->all();
    }

    public function isContentSet(MemoryLaneConfig $config): bool
    {
        return filled($config->level_one_title)
            || filled($config->level_one_body)
            || filled($config->level_one_image)
            || filled($config->level_two_title)
            || filled($config->level_two_body)
            || filled($config->level_two_image)
            || filled($config->level_three_title)
            || filled($config->level_three_body)
            || filled($config->level_three_image);
    }

    private function fetchConfig(?Space $space): ?MemoryLaneConfig
    {
        if (!$space || !Schema::hasTable('memory_lane_configs')) {
            return null;
        }

        $space->loadMissing('memoryLaneConfig');

        return $space->memoryLaneConfig;
    }

    private function configLevels(MemoryLaneConfig $config): array
    {
        return [
            [
                'image' => $config->level_one_image,
                'title' => $config->level_one_title,
                'body' => $config->level_one_body,
            ],
            [
                'image' => $config->level_two_image,
                'title' => $config->level_two_title,
                'body' => $config->level_two_body,
            ],
            [
                'image' => $config->level_three_image,
                'title' => $config->level_three_title,
                'body' => $config->level_three_body,
            ],
        ];
    }
}
