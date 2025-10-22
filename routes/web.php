<?php

require __DIR__ . '/auth.php';

use App\Http\Controllers\Api\CountdownApiController;
use App\Http\Controllers\Api\DailyApiController;
use App\Http\Controllers\Api\DailyMessageApiController;
use App\Http\Controllers\Api\DocApiController;
use App\Http\Controllers\Api\LoveJournalApiController;
use App\Http\Controllers\Api\LoveTimelineApiController;
use App\Http\Controllers\Api\MediaGalleryApiController;
use App\Http\Controllers\Api\SpaceApiController;
use App\Http\Controllers\Api\SurpriseNoteApiController;
use App\Http\Controllers\Api\WishlistApiController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\SpaceController;
use App\Http\Controllers\SpotifyAuthController;
use App\Http\Controllers\SpotifyController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

Route::get('/', function () {
    return redirect('/login');
});

Route::get('/about', function () {
    return Inertia::render('About.jsx');
})->name('about');

Route::get('/location/{space:slug}', [LocationController::class, 'publicView'])->name('location.public');
Route::get('/surprise/story', function () {
    return Inertia::render('Surprise/StoryBook');
})->name('surprise.story');
Route::get('/surprise/memory', function () {
    return Inertia::render('Surprise/MemoryLanePublic');
})->name('surprise.memory');
Route::get('/surprise/{space:slug}/story', function (\App\Models\Space $space) {
    return Inertia::render('Surprise/StoryBook', [
        'space' => [
            'id' => $space->id,
            'slug' => $space->slug,
            'title' => $space->title,
        ],
    ]);
})->name('surprise.story.space');
Route::get('/surprise/{space:slug}/memory', function (\App\Models\Space $space) {
    return Inertia::render('Surprise/MemoryLanePublic', [
        'space' => [
            'id' => $space->id,
            'slug' => $space->slug,
            'title' => $space->title,
        ],
    ]);
})->name('surprise.memory.space');

Route::middleware(['auth', 'verified'])->group(function () {
    // Profile Routes
    Route::get('/profile/edit', [App\Http\Controllers\ProfileController::class, 'edit'])->name('profile.edit');
    Route::put('/profile/update', [App\Http\Controllers\ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile/destroy', [App\Http\Controllers\ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/oauth/spotify/callback', [SpotifyAuthController::class, 'callback'])->name('spotify.callback');

    // Dashboard & Space selection
    Route::get('/dashboard', [DashboardController::class, 'redirect'])->name('dashboard');
    Route::get('/spaces', [SpaceController::class, 'index'])->name('spaces.index');
    Route::post('/spaces', [SpaceController::class, 'store'])->name('spaces.store');

    Route::middleware('space.access')->group(function () {
        Route::get('/spaces/{space:slug}/dashboard', [DashboardController::class, 'show'])->name('spaces.dashboard');

        Route::get('/spaces/{space:slug}/location', [LocationController::class, 'index'])->name('location.map');

        Route::get('/spaces/{space:slug}/timeline', [LoveTimelineApiController::class, 'index'])->name('timeline.index');
        Route::get('/spaces/{space:slug}/timeline/create', [LoveTimelineApiController::class, 'create'])->name('timeline.create');
        Route::post('/spaces/{space:slug}/timeline', [LoveTimelineApiController::class, 'store'])->name('timeline.store');
        Route::get('/spaces/{space:slug}/timeline/{id}/edit', [LoveTimelineApiController::class, 'edit'])->name('timeline.edit');
        Route::post('/spaces/{space:slug}/timeline/{id}', [LoveTimelineApiController::class, 'update'])->name('timeline.update');
        Route::delete('/spaces/{space:slug}/timeline/{id}', [LoveTimelineApiController::class, 'destroy'])->name('timeline.destroy');

        // Daily Messages Routes
        Route::get('/spaces/{space:slug}/daily-messages', [DailyMessageApiController::class, 'index'])->name('daily.index');
        Route::get('/spaces/{space:slug}/daily-messages/create', [DailyMessageApiController::class, 'create'])->name('daily.create');
        Route::post('/spaces/{space:slug}/daily-messages', [DailyMessageApiController::class, 'store'])->name('daily.store');
        Route::get('/spaces/{space:slug}/daily-messages/{id}/edit', [DailyMessageApiController::class, 'edit'])->name('daily.edit');
        Route::put('/spaces/{space:slug}/daily-messages/{id}', [DailyMessageApiController::class, 'update'])->name('daily.update');
        Route::post('/spaces/{space:slug}/daily-messages/regenerate', [DailyMessageApiController::class, 'regenerate'])->name('daily.regenerate');

        // Countdown Routes
        Route::get('/spaces/{space:slug}/countdowns', [CountdownApiController::class, 'index'])->name('countdown.index');
        Route::get('/spaces/{space:slug}/countdowns/create', [CountdownApiController::class, 'create'])->name('countdown.create');
        Route::post('/spaces/{space:slug}/countdowns', [CountdownApiController::class, 'store'])->name('countdown.store');
        Route::get('/spaces/{space:slug}/countdowns/{id}/edit', [CountdownApiController::class, 'edit'])->name('countdown.edit');
        Route::put('/spaces/{space:slug}/countdowns/{id}', [CountdownApiController::class, 'update'])->name('countdown.update');
        Route::delete('/spaces/{space:slug}/countdowns/{id}', [CountdownApiController::class, 'destroy'])->name('countdown.destroy');

        // Journal Routes
        Route::get('/spaces/{space:slug}/journals', [LoveJournalApiController::class, 'index'])->name('journal.index');
        Route::get('/spaces/{space:slug}/journals/create', [LoveJournalApiController::class, 'create'])->name('journal.create');
        Route::post('/spaces/{space:slug}/journals', [LoveJournalApiController::class, 'store'])->name('journal.store');
        Route::get('/spaces/{space:slug}/journals/{id}/edit', [LoveJournalApiController::class, 'edit'])->name('journal.edit');
        Route::put('/spaces/{space:slug}/journals/{id}', [LoveJournalApiController::class, 'update'])->name('journal.update');
        Route::delete('/spaces/{space:slug}/journals/{id}', [LoveJournalApiController::class, 'destroy'])->name('journal.destroy');

        // Media Gallery Routes
        Route::get('/spaces/{space:slug}/gallery', [MediaGalleryApiController::class, 'index'])->name('gallery.index');
        Route::get('/spaces/{space:slug}/gallery/create', [MediaGalleryApiController::class, 'create'])->name('gallery.create');
        Route::post('/spaces/{space:slug}/gallery', [MediaGalleryApiController::class, 'store'])->name('gallery.store');
        Route::get('/spaces/{space:slug}/gallery/{id}/edit', [MediaGalleryApiController::class, 'edit'])->name('gallery.edit');
        Route::put('/spaces/{space:slug}/gallery/{id}', [MediaGalleryApiController::class, 'update'])->name('gallery.update');
        Route::delete('/spaces/{space:slug}/gallery/{id}', [MediaGalleryApiController::class, 'destroy'])->name('gallery.destroy');

        Route::get('/spaces/{space:slug}/spotify/authorize', [SpotifyAuthController::class, 'redirect'])->name('spotify.authorize');
        Route::get('/spaces/{space:slug}/spotify/dashboard-data', [SpotifyController::class, 'dashboard'])->name('spotify.dashboard');
        Route::post('/spaces/{space:slug}/spotify/surprises', [SpotifyController::class, 'storeSurprise'])->name('spotify.surprises.store');
        Route::post('/spaces/{space:slug}/spotify/capsules', [SpotifyController::class, 'storeCapsule'])->name('spotify.capsules.store');

        Route::get('/spaces/{space:slug}/spotify-companion', function (\App\Models\Space $space) {
            return Inertia::render('Spotify/LongDistanceSpotifyHub', [
                'space' => [
                    'id' => $space->id,
                    'slug' => $space->slug,
                    'title' => $space->title,
                ],
            ]);
        })->name('spotify.companion');

        Route::get('/spaces/{space:slug}/nobar', function (\App\Models\Space $space) {
            return Inertia::render('Room/Show', [
                'spaceId' => $space->id,
            ]);
        })->name('space.nobar');

        Route::get('/spaces/{space:slug}/roomjitsi', function (\App\Models\Space $space) {
            return Inertia::render('Room/Show', [
                'spaceId' => $space->id,
                'user' => Auth::user()?->name ?? 'Guest',
            ]);
        });
    });

    // Surprise Notes Routes
    Route::get('/surprise-notes', [SurpriseNoteApiController::class, 'index'])->name('notes.index');
    Route::get('/surprise-notes/create', [SurpriseNoteApiController::class, 'create'])->name('notes.create');
    Route::post('/surprise-notes', [SurpriseNoteApiController::class, 'store'])->name('notes.store');
    Route::get('/surprise-notes/{id}/edit', [SurpriseNoteApiController::class, 'edit'])->name('notes.edit');
    Route::put('/surprise-notes/{id}', [SurpriseNoteApiController::class, 'update'])->name('notes.update');
    Route::delete('/surprise-notes/{id}', [SurpriseNoteApiController::class, 'destroy'])->name('notes.destroy');

    // Wishlist Routes
    Route::get('/wishlist', [WishlistApiController::class, 'index'])->name('wishlist.index');
    Route::get('/wishlist/create', [WishlistApiController::class, 'create'])->name('wishlist.create');
    Route::post('/wishlist', [WishlistApiController::class, 'store'])->name('wishlist.store');
    Route::get('/wishlist/{id}/edit', [WishlistApiController::class, 'edit'])->name('wishlist.edit');
    Route::put('/wishlist/{id}', [WishlistApiController::class, 'update'])->name('wishlist.update');
    Route::delete('/wishlist/{id}', [WishlistApiController::class, 'destroy'])->name('wishlist.destroy');

    // Docs Routes
    Route::get('/docs', [DocApiController::class, 'index'])->name('docs.index');
    Route::get('/docs/create', [DocApiController::class, 'create'])->name('docs.create');
    Route::post('/docs', [DocApiController::class, 'store'])->name('docs.store');
    Route::get('/docs/{id}/edit', [DocApiController::class, 'edit'])->name('docs.edit');
    Route::put('/docs/{id}', [DocApiController::class, 'update'])->name('docs.update');
    Route::delete('/docs/{id}', [DocApiController::class, 'destroy'])->name('docs.destroy');

    Route::get('/preview/{path}', function ($path) {
        $file = storage_path('app/public/' . $path);

        if (!file_exists($file)) {
            abort(404);
        }

        $mime = mime_content_type($file);
        $content = file_get_contents($file);

        // header inline agar bisa tampil di iframe
        return Response::make($content, 200, [
            'Content-Type' => $mime,
            'Content-Disposition' => 'inline; filename="' . basename($file) . '"',
        ]);
    })->where('path', '.*')->name('docs.preview');

    Route::post('/api/daily/create-room', [DailyApiController::class, 'createRoom'])->name('api.daily.create-room');

    Route::post('/room/{id}/chat', [ChatController::class, 'send']);
});
