<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;

class KlipyGifController extends Controller
{
    public function search(Request $request): JsonResponse
    {
        $data = $request->validate([
            'q' => ['nullable', 'string', 'max:120'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:40'],
            'offset' => ['nullable', 'integer', 'min:0', 'max:500'],
        ]);

        $query = trim((string) ($data['q'] ?? ''));
        $limit = (int) ($data['limit'] ?? 24);
        $offset = (int) ($data['offset'] ?? 0);
        $key = config('services.klipy.key');
        $baseUrl = rtrim((string) config('services.klipy.base_url'), '/');

        if (!$key) {
            return response()->json([
                'configured' => false,
                'gifs' => [],
                'message' => 'KLIPY_API_KEY belum diatur di .env.',
            ]);
        }

        $endpoint = $query !== '' ? 'search' : 'trending';
        $url = "{$baseUrl}/{$key}/gifs/{$endpoint}";

        $response = Http::acceptJson()
            ->timeout(10)
            ->retry(1, 200)
            ->get($url, array_filter([
                'q' => $query !== '' ? $query : null,
                'limit' => $limit,
                'offset' => $offset,
            ], fn ($value) => $value !== null));

        if (!$response->successful()) {
            return response()->json([
                'configured' => true,
                'gifs' => [],
                'message' => 'Klipy API gagal merespons.',
                'status' => $response->status(),
            ], 502);
        }

        return response()->json([
            'configured' => true,
            'gifs' => $this->normalizeGifs($response->json()),
        ]);
    }

    private function normalizeGifs(mixed $payload): array
    {
        $items = data_get($payload, 'data')
            ?? data_get($payload, 'result')
            ?? data_get($payload, 'results')
            ?? data_get($payload, 'gifs')
            ?? [];

        if (isset($items['data']) && is_array($items['data'])) {
            $items = $items['data'];
        }

        if (!is_array($items)) {
            return [];
        }

        return collect($items)
            ->map(function ($item): ?array {
                if (!is_array($item)) {
                    return null;
                }

                $url = $this->firstString([
                    data_get($item, 'images.original.url'),
                    data_get($item, 'images.fixed_height.url'),
                    data_get($item, 'media.0.gif.url'),
                    data_get($item, 'gif.url'),
                    data_get($item, 'url'),
                    data_get($item, 'image_url'),
                ]);

                $preview = $this->firstString([
                    data_get($item, 'images.fixed_width_small.url'),
                    data_get($item, 'images.preview_gif.url'),
                    data_get($item, 'preview.url'),
                    data_get($item, 'thumbnail_url'),
                    $url,
                ]);

                if (!$url) {
                    return null;
                }

                return [
                    'id' => (string) ($this->firstString([data_get($item, 'id'), data_get($item, 'slug')]) ?? md5($url)),
                    'title' => (string) ($this->firstString([data_get($item, 'title'), data_get($item, 'name')]) ?? 'GIF'),
                    'url' => $url,
                    'preview_url' => $preview,
                    'source' => 'klipy',
                ];
            })
            ->filter()
            ->values()
            ->all();
    }

    private function firstString(array $values): ?string
    {
        foreach (Arr::flatten($values) as $value) {
            if (is_string($value) && trim($value) !== '') {
                return $value;
            }
        }

        return null;
    }
}
