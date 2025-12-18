<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LoveTimeline;
use App\Models\Space;
use App\Services\ActivityLogger;
use App\Services\UploadedFileProcessor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class LoveTimelineApiController extends Controller
{
    public function __construct(
        private readonly UploadedFileProcessor $fileProcessor,
        private readonly ActivityLogger $activityLogger
    )
    {
    }

    public function index(Space $space)
    {
        $this->authorizeSpace($space);

        $timelines = $space->timelines()
            ->orderBy('date')
            ->get()
            ->map(function (LoveTimeline $timeline) use ($space) {
                $mediaPaths = $timeline->media_paths ?? [];
                $thumbnail = $timeline->thumbnail_path;

                if ($thumbnail && !in_array($thumbnail, $mediaPaths, true)) {
                    $thumbnail = null;
                }

                $resolvedThumbnail = $thumbnail
                    ? asset('storage/' . $thumbnail)
                    : ($mediaPaths ? asset('storage/' . $mediaPaths[0]) : null);

                return [
                    'uuid' => $timeline->uuid,
                    'title' => $timeline->title,
                    'description' => $timeline->description,
                    'date' => $timeline->date?->toDateString(),
                    'media_paths' => $mediaPaths,
                    'thumbnail_path' => $thumbnail,
                    'thumbnail_url' => $resolvedThumbnail,
                    'media_urls' => collect($mediaPaths)->map(fn ($path) => asset('storage/' . $path))->all(),
                ];
            });

        return Inertia::render('Timeline/Index', [
            'timelines' => $timelines,
            'space' => $this->spacePayload($space),
        ]);
    }

    public function create(Space $space)
    {
        $this->authorizeSpace($space);

        return Inertia::render('Timeline/Create', [
            'space' => $this->spacePayload($space),
        ]);
    }

    public function store(Request $request, Space $space)
    {
        $request->validate(
            [
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'date' => 'required|date',
                'media' => 'nullable|array|max:5', // ⬅️ batas maksimal 5 file
                'media.*' => 'nullable|file|mimes:jpg,jpeg,png,webp|max:10240', // max 10MB per file
            ],
            [
                'media.*.max' => __('errors.timeline.image_too_large'),
            ],
        );

        $timeline = new LoveTimeline();
        $timeline->space_id = $space->id;
        $timeline->title = $request->title;
        $timeline->description = $request->description;
        $timeline->date = $request->date;

        $paths = [];
        if ($request->hasFile('media')) {
            foreach ($request->file('media') as $index => $file) {
                $stored = $this->fileProcessor->store(
                    $file,
                    "spaces/{$space->id}/timeline",
                    'public',
                    'errors.timeline.media_too_large',
                    sprintf('media.%d', $index),
                );
                $paths[] = $stored['path'];
            }
        }

        $timeline->media_paths = $paths;
        $timeline->thumbnail_path = $paths[0] ?? null;
        $timeline->save();
        $this->notifyTimelineEvent($space, $timeline, 'created');

        return redirect()
            ->route('timeline.index', ['space' => $space->slug])
            ->with('success', __('timeline.flash.created'));
    }

    public function edit(Space $space, LoveTimeline $timeline)
    {
        $this->authorizeSpace($space);

        if ($timeline->space_id !== $space->id) {
            abort(404);
        }

        return Inertia::render('Timeline/Edit', [
            'item' => [
                'uuid' => $timeline->uuid,
                'title' => $timeline->title,
                'description' => $timeline->description,
                'date' => $timeline->date?->toDateString(),
                'media_paths' => $timeline->media_paths ?? [],
            ],
            'space' => $this->spacePayload($space),
        ]);
    }

    public function update(Request $r, Space $space, LoveTimeline $timeline)
    {
        $this->authorizeSpace($space);

        if ($timeline->space_id !== $space->id) {
            abort(404);
        }

        $data = $r->validate(
            [
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'date' => 'required|date',
                'media' => 'nullable|array|max:5',
                'media.*' => 'nullable|file|mimes:jpg,jpeg,png,webp,mp4,mov|max:10240',
                'media_keys' => 'nullable|array',
                'media_keys.*' => 'string',
                'removed' => 'nullable|array',
                'removed.*' => 'string',
                'ordered' => 'nullable|array',
                'ordered.*' => 'string',
            ],
            [
                'media.*.max' => __('errors.timeline.media_too_large'),
            ],
        );

        $existingPaths = collect($timeline->media_paths ?? []);
        $removed = collect($data['removed'] ?? [])->filter()->unique()->values();
        $remainingExisting = $existingPaths
            ->reject(fn ($path) => $removed->contains($path))
            ->values()
            ->all();

        $incomingFiles = $r->file('media', []);
        if (count($remainingExisting) + count($incomingFiles) > 5) {
            return back()->withErrors([
                'media' => __('Maksimal 5 media per momen.'),
            ]);
        }

        $mediaKeys = $data['media_keys'] ?? [];
        $newUploads = [];
        foreach ($incomingFiles as $index => $file) {
            $stored = $this->fileProcessor->store(
                $file,
                "spaces/{$space->id}/timeline",
                'public',
                'errors.timeline.media_too_large',
                sprintf('media.%d', $index),
            );
            $newUploads[] = [
                'key' => $mediaKeys[$index] ?? null,
                'path' => $stored['path'],
            ];
        }

        foreach ($removed as $removedPath) {
            if ($existingPaths->contains($removedPath)) {
                Storage::disk('public')->delete($removedPath);
            }
        }

        $orderedTokens = collect($data['ordered'] ?? [])->filter();
        $finalPaths = [];

        foreach ($orderedTokens as $token) {
            $existingIndex = array_search($token, $remainingExisting, true);
            if ($existingIndex !== false) {
                $finalPaths[] = $token;
                array_splice($remainingExisting, $existingIndex, 1);
                continue;
            }

            foreach ($newUploads as $upload) {
                if (($upload['key'] ?? null) === $token && !in_array($upload['path'], $finalPaths, true)) {
                    $finalPaths[] = $upload['path'];
                    break;
                }
            }
        }

        foreach ($remainingExisting as $path) {
            if (!in_array($path, $finalPaths, true)) {
                $finalPaths[] = $path;
            }
        }

        foreach ($newUploads as $upload) {
            if (!in_array($upload['path'], $finalPaths, true)) {
                $finalPaths[] = $upload['path'];
            }
        }

        $thumbnailPath = $timeline->thumbnail_path;
        if ($thumbnailPath && !in_array($thumbnailPath, $finalPaths, true)) {
            $thumbnailPath = $finalPaths[0] ?? null;
        }

        $timeline->update([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'date' => $data['date'],
            'media_paths' => $finalPaths,
            'thumbnail_path' => $thumbnailPath,
        ]);
        $this->notifyTimelineEvent($space, $timeline, 'updated');

        return redirect()->route('timeline.index', ['space' => $space->slug])
            ->with('success', __('timeline.flash.updated'));
    }

    public function destroy(Request $request, Space $space, LoveTimeline $timeline)
    {
        $this->authorizeSpace($space);

        if ($timeline->space_id !== $space->id) {
            abort(404);
        }

        $mediaPaths = $timeline->media_paths ?? [];
        foreach ($mediaPaths as $path) {
            Storage::disk('public')->delete($path);
        }

        if ($timeline->thumbnail_path && !in_array($timeline->thumbnail_path, $mediaPaths, true)) {
            Storage::disk('public')->delete($timeline->thumbnail_path);
        }

        $timeline->delete();
        $this->notifyTimelineEvent($space, $timeline, 'deleted');

        if ($request->wantsJson()) {
            return response()->json(['message' => 'deleted']);
        }

        return redirect()
            ->route('timeline.index', ['space' => $space->slug])
            ->with('success', __('timeline.flash.deleted'));
    }

    public function setThumbnail(Request $request, Space $space, LoveTimeline $timeline)
    {
        $this->authorizeSpace($space);

        if ($timeline->space_id !== $space->id) {
            abort(404);
        }

        $data = $request->validate([
            'path' => ['nullable', 'string'],
        ]);

        $path = $data['path'] ?? null;
        $media = $timeline->media_paths ?? [];

        if ($path !== null && !in_array($path, $media, true)) {
            return response()->json([
                'message' => 'Thumbnail tidak valid.',
            ], 422);
        }

        $timeline->update([
            'thumbnail_path' => $path,
        ]);

        return response()->json([
            'message' => 'Thumbnail berhasil diperbarui.',
            'thumbnail_path' => $path,
            'thumbnail_url' => $path ? asset('storage/' . $path) : null,
        ]);
    }

    private function notifyTimelineEvent(Space $space, LoveTimeline $timeline, string $action): void
    {
        if (!Schema::hasTable('notifications')) {
            return;
        }

        $space->loadMissing(['userOne', 'userTwo']);

        $recipients = collect([$space->userOne, $space->userTwo])
            ->filter()
            ->unique(fn ($user) => $user?->id)
            ->values();

        if ($recipients->isEmpty()) {
            return;
        }

        $actor = Auth::user();
        $actorName = $actor?->name ?? __('app.layout.user.fallback_name');
        $dateLabel = optional($timeline->date)->translatedFormat('d F Y');

        $messages = [
            'created' => [
                'event' => 'timeline.created',
                'title' => __(':actor menambahkan momen baru', ['actor' => $actorName]),
                'body' => __('Momen ":title" ditambahkan untuk tanggal :date.', [
                    'title' => $timeline->title,
                    'date' => $dateLabel ?? __('Tanggal belum ditetapkan'),
                ]),
            ],
            'updated' => [
                'event' => 'timeline.updated',
                'title' => __(':actor memperbarui momen timeline', ['actor' => $actorName]),
                'body' => __('Momen ":title" diperbarui. Periksa detail terbarunya.', [
                    'title' => $timeline->title,
                ]),
            ],
            'deleted' => [
                'event' => 'timeline.deleted',
                'title' => __(':actor menghapus sebuah momen', ['actor' => $actorName]),
                'body' => __('Momen ":title" telah dihapus dari timeline.', [
                    'title' => $timeline->title,
                ]),
            ],
        ];

        $message = $messages[$action] ?? null;
        if ($message === null) {
            return;
        }

        $data = [
            'space_id' => $space->id,
            'space_slug' => $space->slug,
            'timeline_id' => $timeline->id,
            'timeline_uuid' => $timeline->uuid,
            'timeline_title' => $timeline->title,
            'timeline_date' => optional($timeline->date)->toDateString(),
            'action_url' => route('timeline.index', ['space' => $space->slug]),
            'action_label' => __('Lihat timeline'),
        ];

        $this->activityLogger->log(
            $recipients->all(),
            $message['event'],
            $message['title'],
            $message['body'],
            $data,
            sendMail: true
        );
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
}
