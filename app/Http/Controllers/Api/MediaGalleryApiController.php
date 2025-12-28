<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MediaGallery;
use App\Models\Space;
use App\Models\User;
use App\Notifications\MediaGalleryCreated;
use App\Services\ActivityNotifier;
use App\Services\UploadedFileProcessor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class MediaGalleryApiController extends Controller
{
    private ?bool $collectionSupport = null;

    public function __construct(private readonly UploadedFileProcessor $fileProcessor)
    {
    }

    public function index(Space $space)
    {
        $this->authorizeSpace($space);

        $hasCollections = $this->supportsCollections();

        $query = MediaGallery::where('space_id', $space->id)
            ->orderByDesc('created_at');

        if ($hasCollections) {
            $query->orderBy('collection_index');
        }

        $records = $query->get();

        $mapItem = static function (MediaGallery $item): array {
            return [
                'id' => $item->id,
                'title' => $item->title,
                'file_path' => $item->file_path,
                'type' => $item->type,
                'url' => $item->file_path ? Storage::disk('public')->url($item->file_path) : null,
                'collection_index' => $item->collection_index,
            ];
        };

        if ($hasCollections) {
            $collections = $records
                ->groupBy(fn (MediaGallery $item) => $item->collection_key ?? (string) $item->id)
                ->sortByDesc(function ($group) {
                    $first = $group->sortBy('collection_index')->first();
                    return optional($first?->created_at)->timestamp ?? 0;
                })
                ->values()
                ->map(function ($group) use ($mapItem) {
                    /** @var \Illuminate\Support\Collection $group */
                    $sorted = $group->sortBy('collection_index')->values();
                    /** @var MediaGallery|null $cover */
                    $cover = $sorted->first();

                    return [
                        'collection_key' => $cover?->collection_key,
                        'title' => $cover?->title,
                        'created_at' => optional($cover?->created_at)->toIso8601String(),
                        'count' => $sorted->count(),
                        'items' => $sorted->map(fn (MediaGallery $item) => $mapItem($item))->values()->all(),
                    ];
                });
        } else {
            $collections = $records
                ->map(function (MediaGallery $item) use ($mapItem) {
                    return [
                        'collection_key' => (string) $item->id,
                        'title' => $item->title,
                        'created_at' => optional($item->created_at)->toIso8601String(),
                        'count' => 1,
                        'items' => [$mapItem($item)],
                    ];
                })
                ->values();
        }

        return Inertia::render('MediaGallery/Index', [
            'collections' => $collections,
            'space' => $this->spacePayload($space),
        ]);
    }

    public function create(Space $space)
    {
        $this->authorizeSpace($space);

        return Inertia::render('MediaGallery/Create', [
            'space' => $this->spacePayload($space),
        ]);
    }

    public function store(Request $r, Space $space)
    {
        $this->authorizeSpace($space);
        $hasCollections = $this->supportsCollections();

        Log::info('Gallery upload attempt', [
            'space_id' => $space->id,
            'space_slug' => $space->slug,
            'user_id' => Auth::id(),
            'file_count' => count($r->file('files', [])),
            'has_collections' => $hasCollections,
            'payload' => $r->only(['title']),
        ]);

        $data = $r->validate([
            'title' => 'nullable|string|max:255',
            'files' => 'required|array|min:1|max:12',
            'files.*' => 'required|file|mimes:jpg,jpeg,png,gif,mp4,mov|max:15360', // 15 MB
            'collection_key' => 'nullable|string|exists:media_galleries,collection_key',
        ]);

        $files = $r->file('files', []);
        $collectionKey = $data['collection_key'] ?? null;
        $isNewUpload = $collectionKey === null;

        if ($isNewUpload) {
            $collectionKey = $hasCollections ? (string) Str::uuid() : null;
            $baseTitle = isset($data['title']) ? trim($data['title']) : null;
            $nextIndex = 0;
        } else {
            $baseTitle = MediaGallery::where('collection_key', $collectionKey)->first()?->title ?? null;
            $nextIndex = MediaGallery::where('collection_key', $collectionKey)->max('collection_index') + 1;
        }


        try {
            foreach ($files as $index => $file) {
                $stored = $this->fileProcessor->store($file, "spaces/{$space->slug}/media");
                $path = $stored['path'];
                $resolvedTitle = $baseTitle !== null && $baseTitle !== ''
                    ? $baseTitle
                    : pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);

                $payload = [
                    'space_id' => $space->id,
                    'user_id' => Auth::id(),
                    'title' => $resolvedTitle,
                    'file_path' => $path,
                    'type' => $stored['mime'],
                ];

                if ($hasCollections) {
                    $payload['collection_key'] = $collectionKey;
                    $payload['collection_index'] = $nextIndex + $index;
                }

                $mediaItem = MediaGallery::create($payload);
                if ($index === 0) {
                    $firstMediaItem = $mediaItem;
                }
            }

            Log::info('Gallery upload saved', [
                'space_id' => $space->id,
                'space_slug' => $space->slug,
                'created' => count($files),
                'collection_key' => $collectionKey,
            ]);

            ActivityNotifier::notifySpace(
                $space,
                Auth::user(),
                'gallery_create',
                ['count' => count($files)]
            );

            /** @var \App\Models\User $sender */
            $sender = Auth::user();
            $partner = $this->resolvePartnerUser($space);

            if ($partner && isset($firstMediaItem)) {
                $partner->notify(new MediaGalleryCreated($firstMediaItem, $sender, count($files)));
            }

            // Notify sender for confirmation
            if (isset($firstMediaItem)) {
                $sender->notify(new MediaGalleryCreated($firstMediaItem, $sender, count($files), true));
            }
        } catch (\Throwable $exception) {
            Log::error('Gallery upload failed', [
                'space_id' => $space->id,
                'user_id' => Auth::id(),
                'message' => $exception->getMessage(),
            ]);

            throw $exception;
        }

        return Inertia::location(route('gallery.index', ['space' => $space->slug]));
    }

    public function edit(Space $space, $id)
    {
        $this->authorizeSpace($space);

        $item = MediaGallery::where('space_id', $space->id)->findOrFail($id);

        return Inertia::render('MediaGallery/Edit', [
            'item' => $item,
            'space' => $this->spacePayload($space),
        ]);
    }

    public function update(Request $r, Space $space, $id)
    {
        $this->authorizeSpace($space);

        $media = MediaGallery::where('space_id', $space->id)->findOrFail($id);
        if ($media->user_id !== Auth::id()) abort(403);

        $data = $r->validate([
            'title' => 'nullable|string|max:255',
            'file'  => 'nullable|file|mimes:jpg,jpeg,png,gif,mp4,mov|max:15360', // 15 MB
        ]);

        $updates = [
            'title' => $data['title'] ?? $media->title,
        ];

        if ($r->hasFile('file')) {
            Storage::disk('public')->delete($media->file_path);
            $stored = $this->fileProcessor->store($r->file('file'), "spaces/{$space->slug}/media");
            $updates['file_path'] = $stored['path'];
            $updates['type'] = $stored['mime'];
        }

        $media->update($updates);
        return Inertia::location(route('gallery.index', ['space' => $space->slug]));
    }

    public function destroy(Request $request, Space $space, $id)
    {
        $this->authorizeSpace($space);

        $media = MediaGallery::where('space_id', $space->id)->findOrFail($id);
        if ($media->user_id !== Auth::id()) abort(403);

        $collectionKey = $media->collection_key;

        if ($media->file_path) {
            Storage::disk('public')->delete($media->file_path);
        }
        $media->delete();

        if ($collectionKey && $this->supportsCollections()) {
            MediaGallery::where('space_id', $space->id)
                ->where('collection_key', $collectionKey)
                ->orderBy('collection_index')
                ->get()
                ->values()
                ->each(function (MediaGallery $item, int $order): void {
                    $item->forceFill(['collection_index' => $order])->saveQuietly();
                });
        }

        if ($request->wantsJson()) {
            return response()->json(['message' => 'deleted']);
        }

        return redirect()
            ->route('gallery.index', ['space' => $space->slug])
            ->with('success', __('Foto berhasil dihapus.'));
    }

    private function supportsCollections(): bool
    {
        if ($this->collectionSupport !== null) {
            return $this->collectionSupport;
        }

        $this->collectionSupport = Schema::hasColumn('media_galleries', 'collection_key')
            && Schema::hasColumn('media_galleries', 'collection_index');

        return $this->collectionSupport;
    }

    private function authorizeSpace(Space $space)
    {
        if (!$space->hasMember(Auth::id())) abort(403);
    }

    private function spacePayload(Space $space): array
    {
        return [
            'id' => $space->id,
            'slug' => $space->slug,
            'title' => $space->title,
        ];
    }

    private function resolvePartnerUser(Space $space): ?User
    {
        $space->loadMissing(['userOne', 'userTwo']);

        $currentUserId = Auth::id();

        if ($currentUserId && $currentUserId === $space->user_one_id) {
            return $space->userTwo;
        }

        if ($currentUserId && $currentUserId === $space->user_two_id) {
            return $space->userOne;
        }

        return null;
    }
}
