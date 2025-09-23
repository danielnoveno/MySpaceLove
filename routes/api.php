<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\{
    SpaceApiController,
    LoveTimelineApiController,
    DailyMessageApiController,
    CountdownApiController,
    LoveJournalApiController,
    SurpriseNoteApiController,
    MediaGalleryApiController,
    WishlistApiController,
    DocApiController,
    ThemeController
};

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('spaces', SpaceApiController::class);

    // nested resources: /api/spaces/{space}/...
    Route::get('spaces/{space}/timelines', [LoveTimelineApiController::class, 'index']);
    Route::post('spaces/{space}/timelines', [LoveTimelineApiController::class, 'store']);
    Route::put('spaces/{space}/timelines/{id}', [LoveTimelineApiController::class, 'update']);
    Route::delete('spaces/{space}/timelines/{id}', [LoveTimelineApiController::class, 'destroy']);

    Route::get('spaces/{space}/daily-message', [DailyMessageApiController::class, 'index']);
    Route::post('spaces/{space}/daily-message', [DailyMessageApiController::class, 'store']);
    Route::post('spaces/{space}/daily-message/regenerate', [DailyMessageApiController::class, 'regenerate']);

    Route::apiResource('spaces.countdowns', CountdownApiController::class)->except(['create', 'edit', 'show']);
    Route::apiResource('spaces.journals', LoveJournalApiController::class)->except(['create', 'edit', 'show']);
    Route::apiResource('spaces.surprise-notes', SurpriseNoteApiController::class)->except(['create', 'edit', 'show']);
    Route::apiResource('spaces.galleries', MediaGalleryApiController::class)->except(['create', 'edit', 'show']);
    Route::apiResource('spaces.wishlist', WishlistApiController::class)->except(['create', 'edit', 'show']);
    Route::apiResource('spaces.docs', DocApiController::class)->except(['create', 'edit', 'show']);

    Route::get('themes', [ThemeController::class, 'index']);
    Route::get('themes/{id}', [ThemeController::class, 'show']);
});
