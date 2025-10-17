<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\{
    SpaceApiController,
    LoveTimelineApiController,
    DailyMessageApiController,
    CountdownApiController,
    DailyApiController,
    LoveJournalApiController,
    SurpriseNoteApiController,
    MediaGalleryApiController,
    WishlistApiController,
    DocApiController,
    ThemeController
};
use App\Http\Controllers\LocationController;

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('spaces', SpaceApiController::class)->scoped([
        'space' => 'slug',
    ]);

    // nested resources: /api/spaces/{space}/...
    Route::get('spaces/{space}/timelines', [LoveTimelineApiController::class, 'index']);
    Route::post('spaces/{space}/timelines', [LoveTimelineApiController::class, 'store']);
    Route::put('spaces/{space}/timelines/{id}', [LoveTimelineApiController::class, 'update']);
    Route::delete('spaces/{space}/timelines/{id}', [LoveTimelineApiController::class, 'destroy']);

    Route::get('spaces/{space}/daily-message', [DailyMessageApiController::class, 'getTodayMessage'])
        ->name('api.spaces.daily-message');
    Route::post('spaces/{space}/daily-message/regenerate', [DailyMessageApiController::class, 'regenerate'])
        ->name('api.spaces.daily-message.regenerate');
    Route::get('spaces/{space}/daily-message/all', [DailyMessageApiController::class, 'index'])
        ->name('api.spaces.daily-message.all');

    Route::apiResource('spaces.countdowns', CountdownApiController::class)->except(['create', 'edit', 'show'])->scoped([
        'space' => 'slug',
    ]);
    Route::apiResource('spaces.journals', LoveJournalApiController::class)->except(['create', 'edit', 'show'])->scoped([
        'space' => 'slug',
    ]);
    Route::apiResource('spaces.surprise-notes', SurpriseNoteApiController::class)->except(['create', 'edit', 'show'])->scoped([
        'space' => 'slug',
    ]);
    Route::apiResource('spaces.galleries', MediaGalleryApiController::class)->except(['create', 'edit', 'show'])->scoped([
        'space' => 'slug',
    ]);
    Route::apiResource('spaces.wishlist', WishlistApiController::class)->except(['create', 'edit', 'show'])->scoped([
        'space' => 'slug',
    ]);
    Route::apiResource('spaces.docs', DocApiController::class)->except(['create', 'edit', 'show'])->scoped([
        'space' => 'slug',
    ]);

    Route::post('spaces/{space}/connect-partner', [SpaceApiController::class, 'connectPartner']);

    Route::get('themes', [ThemeController::class, 'index']);
    Route::get('themes/{id}', [ThemeController::class, 'show']);

    Route::post('/daily/create-room', [DailyApiController::class, 'createRoom'])->name('api.daily.create-room');
    Route::get('/daily/rooms', [DailyApiController::class, 'listRooms']);
    Route::delete('/daily/rooms/{name}', [DailyApiController::class, 'deleteRoom']);

    Route::post('location/update', [LocationController::class, 'update']);
    Route::get('location/{user}', [LocationController::class, 'show']);
    Route::post('spaces/{space}/location/share', [LocationController::class, 'share']);
    Route::delete('location', [LocationController::class, 'destroy']);
});
