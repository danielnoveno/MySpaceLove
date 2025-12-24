<?php

use Illuminate\Http\Request;
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
    ThemeController,
    ChatMessageController,
    JaasController
};
use App\Http\Controllers\LocationController;

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('spaces', SpaceApiController::class)
        ->names('api.spaces')
        ->scoped([
            'space' => 'slug',
        ]);

    // nested resources: /api/spaces/{space}/...
    Route::get('spaces/{space}/timelines', [LoveTimelineApiController::class, 'index']);
    Route::post('spaces/{space}/timelines', [LoveTimelineApiController::class, 'store']);
    Route::put('spaces/{space}/timelines/{timeline:uuid}', [LoveTimelineApiController::class, 'update']);
    Route::delete('spaces/{space}/timelines/{timeline:uuid}', [LoveTimelineApiController::class, 'destroy']);

    Route::get('spaces/{space}/daily-message', [DailyMessageApiController::class, 'getTodayMessage'])
        ->name('api.spaces.daily-message');
    Route::get('spaces/{space}/daily-message/all', [DailyMessageApiController::class, 'index'])
        ->name('api.spaces.daily-message.all');

    // Chat (self-hosted, space-scoped)
    Route::get('spaces/{space}/chat/messages', [ChatMessageController::class, 'index'])
        ->name('api.spaces.chat.messages.index');
    Route::post('spaces/{space}/chat/messages', [ChatMessageController::class, 'store'])
        ->name('api.spaces.chat.messages.store');
    Route::post('spaces/{space}/chat/messages/read', [ChatMessageController::class, 'markRead'])
        ->name('api.spaces.chat.messages.read');



    // Nobar signaling (REMOVED - Migrated to Agora)


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

    Route::post('spaces/{space}/connect-partner', [SpaceApiController::class, 'connectPartner'])->name('api.spaces.connect-partner');
    Route::post('spaces/{space}/confirm-partner', [SpaceApiController::class, 'confirmPartner'])->name('api.spaces.confirm-partner');
    Route::delete('spaces/{space}/invitations/{invitation}', [SpaceApiController::class, 'cancelInvitation'])->name('api.spaces.invitations.cancel');
    Route::post('spaces/join-by-code', [SpaceApiController::class, 'requestJoin'])->name('api.spaces.request-join');
    Route::post('spaces/{space}/separation/request', [SpaceApiController::class, 'requestSeparation'])->name('api.spaces.separation.request');
    Route::post('spaces/{space}/separation/respond', [SpaceApiController::class, 'respondSeparation'])->name('api.spaces.separation.respond');
    Route::post('spaces/{space}/separation/cancel', [SpaceApiController::class, 'cancelSeparation'])->name('api.spaces.separation.cancel');
    
    // JaaS Token
    Route::get('spaces/{space}/jaas/token', [JaasController::class, 'generateToken'])->name('api.spaces.jaas.token');

    Route::get('themes', [ThemeController::class, 'index']);
    Route::get('themes/{id}', [ThemeController::class, 'show']);



    Route::post('location/update', [LocationController::class, 'update']);
    Route::get('location/{user}', [LocationController::class, 'show']);
    Route::post('spaces/{space}/location/share', [LocationController::class, 'share']);
    Route::delete('location', [LocationController::class, 'destroy']);

    Route::get('/roomkit/user', function (Request $request) {
        return $request->user();
    });
});
