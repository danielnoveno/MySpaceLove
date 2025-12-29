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
        
        // Get config to check for custom PIN, otherwise use default
        $config = $this->fetchConfig($space);
        $pin = $config?->pin ?? '00000';

        $content = __('surprise.memory_lane', [
            'spaceTitle' => $spaceTitle,
            'rows' => $grid['rows'] ?? 4,
            'cols' => $grid['cols'] ?? 4,
        ]);
        
        // Override the secret code with actual PIN (custom or default)
        $content['secretGate']['code'] = $pin;

        $content['puzzle']['grid'] = $grid;
        $levels = collect($content['puzzle']['levels'] ?? [])->values();
        unset($content['defaults']);

        $activeCount = $config?->active_levels ?? 3;

        // Ensure we don't return more levels than active, and handle 0 case
        if ($activeCount === 0) {
             $content['puzzle']['levels'] = [];
             $content['rewards'] = [];
             $content['flipbook'] = [];
             return $content;
        }
        
        // Take only the active number of levels from the base definition
        $levels = $levels->slice(0, $activeCount);

        if ($config) {
            $disk = Storage::disk('public');
            $overrides = $this->configLevels($config);

            $levels = $levels->map(function (array $level, int $index) use ($overrides, $disk, $config) {
                // ... same logic
                $mapping = $overrides[$index] ?? null;

                if ($mapping === null) {
                    return $level;
                }
                
                // ... 
                if ($mapping['image'] && $disk->exists($mapping['image'])) {
                     $level['image'] = Storage::url($mapping['image']);
                }

                if (!empty($mapping['title'])) {
                    $level['summaryTitle'] = $mapping['title'];
                }


                if (!empty($mapping['body'])) {
                    $level['summaryBody'] = $mapping['body'];
                }

                // Add level-specific rewards and flipbook
                if ($index === 0) {
                    // Level 1: Rewards/Gacha
                    $level['rewards'] = $this->getRewards($config);
                } elseif ($index === 1) {
                    // Level 2: Flipbook
                    $level['flipbook'] = $this->getFlipbookPages($config);
                }

                return $level;
            });
        }

        $content['puzzle']['levels'] = $levels->values()->all();
        
        // Add global rewards and flipbook for backward compatibility
        $content['rewards'] = $config ? $this->getRewards($config) : [];
        $content['flipbook'] = $config ? $this->getFlipbookPages($config) : [];

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

    public function flipbookPages(?Space $space = null): array
    {
        $config = $this->fetchConfig($space);
        
        if (!$config) {
            return [];
        }

        return $this->getFlipbookPages($config);
    }

    public function flipbookCoverData(?Space $space = null): array
    {
        $config = $this->fetchConfig($space);
        
        if (!$config) {
            return [
                'image' => null,
                'title' => 'Our Story',
            ];
        }

        $disk = Storage::disk('public');
        $coverImage = null;

        if (!empty($config->flipbook_cover_image) && $disk->exists($config->flipbook_cover_image)) {
            $coverImage = asset(Storage::url($config->flipbook_cover_image));
        }

        return [
            'image' => $coverImage,
            'title' => $config->flipbook_cover_title ?? 'Our Story',
        ];
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

    private function getRewards(MemoryLaneConfig $config): array
    {
        // Start with defaults
        $defaults = config('memory_lane_rewards.default_rewards', []);
        $customs = $config->custom_rewards ?? [];

        if (empty($customs) || !is_array($customs)) {
            return $defaults;
        }

        $merged = [];
        $customCollection = collect($customs);
        $defaultIds = collect($defaults)->pluck('id')->all();

        // 1. Process defaults (apply overrides)
        foreach ($defaults as $default) {
            // Use loose comparison to handle string vs int IDs
            $override = $customCollection->first(function ($item) use ($default) {
                return (string)($item['id'] ?? '') === (string)$default['id'];
            });

            if ($override) {
                // Merge default with override (e.g. enabled status)
                $merged[] = array_merge($default, $override);
            } else {
                // No override, keep default
                $merged[] = $default;
            }
        }

        // 2. Add pure custom rewards
        $pureCustoms = $customCollection->filter(function ($item) use ($defaultIds) {
            $itemId = (string)($item['id'] ?? '');
            $stringDefaultIds = array_map('strval', $defaultIds);
            return !empty($itemId) && !in_array($itemId, $stringDefaultIds);
        });

        foreach ($pureCustoms as $custom) {
            // Ensure pure custom rewards have necessary fields
            if (!empty($custom['title'])) {
                $merged[] = array_merge([
                    'category' => 'custom',
                    'enabled' => true,
                    'icon' => '🎁',
                ], $custom);
            }
        }

        // Return only enabled rewards for the public view
        return collect($merged)
            ->filter(fn ($r) => $r['enabled'] ?? true)
            ->values()
            ->all();
    }

    private function getFlipbookPages(MemoryLaneConfig $config): array
    {
        if (empty($config->flipbook_pages) || !is_array($config->flipbook_pages)) {
            return [];
        }

        $disk = Storage::disk('public');

        // Process flipbook pages to include full image URLs
        return collect($config->flipbook_pages)
            ->map(function ($page) use ($disk) {
                // Handle standard image
                if (!empty($page['image']) && $disk->exists($page['image'])) {
                    $page['image'] = asset(Storage::url($page['image']));
                }

                // Handle canvas elements images
                if (($page['type'] ?? 'standard') === 'canvas' && isset($page['canvas_elements'])) {
                    $elements = $page['canvas_elements'];
                    foreach ($elements as $key => $el) {
                        if ($el['type'] === 'image' && !empty($el['image_url'])) {
                            // Convert relative /storage/ path to asset URL if needed
                            if (str_starts_with($el['image_url'], '/storage/')) {
                                $el['image_url'] = asset($el['image_url']);
                            }
                        }
                        $elements[$key] = $el;
                    }
                    $page['canvas_elements'] = $elements;
                }
                
                return $page;
            })
            ->filter(function ($page) {
                // Only include pages that have content or are canvas type
                return ($page['type'] ?? 'standard') === 'canvas' || !empty($page['title']) || !empty($page['body']) || !empty($page['image']);
            })
            ->values()
            ->all();
    }
}
