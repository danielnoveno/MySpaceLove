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
use App\Http\Controllers\NobarController;
use App\Http\Controllers\SpotifyAuthController;
use App\Http\Controllers\SpotifyController;
use App\Models\Space;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

Route::get('/', function () {
    return redirect('/login');
});

Route::get('/about', function () {
    return Inertia::render('About');
})->name('about');

Route::get('/location/{space:slug}', [LocationController::class, 'publicView'])->name('location.public');
Route::get('/surprise/story', function () {
    $storyBase = __('surprise.story_book');
    $defaultSpaceTitle = data_get($storyBase, 'defaults.spaceTitle', 'My Favorite Person');

    $storyContent = __('surprise.story_book', [
        'spaceTitle' => $defaultSpaceTitle,
    ]);

    unset($storyContent['defaults']);

    return Inertia::render('Surprise/StoryBook', [
        'storyBook' => $storyContent,
    ]);
})->name('surprise.story');
Route::get('/surprise/memory', function () {
    $memoryBase = __('surprise.memory_lane');
    $defaultSpaceTitle = data_get($memoryBase, 'defaults.spaceTitle', 'kita');
    $grid = data_get($memoryBase, 'puzzle.grid', ['rows' => 4, 'cols' => 4]);

    $memoryContent = __('surprise.memory_lane', [
        'spaceTitle' => $defaultSpaceTitle,
        'rows' => $grid['rows'] ?? 4,
        'cols' => $grid['cols'] ?? 4,
    ]);

    $memoryContent['puzzle']['grid'] = $grid;
    unset($memoryContent['defaults']);

    return Inertia::render('Surprise/MemoryLanePublic', [
        'memoryLane' => $memoryContent,
    ]);
})->name('surprise.memory');
Route::get('/surprise/{space:slug}/story', function (\App\Models\Space $space) {
    $storyBase = __('surprise.story_book');
    $storyContent = __('surprise.story_book', [
        'spaceTitle' => $space->title ?? data_get($storyBase, 'defaults.spaceTitle', 'My Favorite Person'),
    ]);

    unset($storyContent['defaults']);

    return Inertia::render('Surprise/StoryBook', [
        'space' => [
            'id' => $space->id,
            'slug' => $space->slug,
            'title' => $space->title,
        ],
        'storyBook' => $storyContent,
    ]);
})->name('surprise.story.space');
Route::get('/surprise/{space:slug}/memory', function (\App\Models\Space $space) {
    $memoryBase = __('surprise.memory_lane');
    $grid = data_get($memoryBase, 'puzzle.grid', ['rows' => 4, 'cols' => 4]);
    $memoryContent = __('surprise.memory_lane', [
        'spaceTitle' => $space->title ?? data_get($memoryBase, 'defaults.spaceTitle', 'kita'),
        'rows' => $grid['rows'] ?? 4,
        'cols' => $grid['cols'] ?? 4,
    ]);

    $memoryContent['puzzle']['grid'] = $grid;
    unset($memoryContent['defaults']);

    return Inertia::render('Surprise/MemoryLanePublic', [
        'space' => [
            'id' => $space->id,
            'slug' => $space->slug,
            'title' => $space->title,
        ],
        'memoryLane' => $memoryContent,
    ]);
})->name('surprise.memory.space');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('/locale', function (Request $request) {
        $availableLocales = config('app.available_locales', []);

        $validated = $request->validate([
            'locale' => ['required', 'string', Rule::in($availableLocales)],
        ]);

        $locale = $validated['locale'];

        $request->session()->put('locale', $locale);
        app()->setLocale($locale);

        return back()->withCookie(cookie()->forever('locale', $locale));
    })->name('locale.switch');

    // Profile Routes
    Route::get('/profile/edit', [App\Http\Controllers\ProfileController::class, 'edit'])->name('profile.edit');
    Route::put('/profile/update', [App\Http\Controllers\ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile/destroy', [App\Http\Controllers\ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/oauth/spotify/callback', [SpotifyAuthController::class, 'callback'])->name('spotify.callback');

    // Dashboard & Space selection
    Route::get('/dashboard', [DashboardController::class, 'redirect'])->name('dashboard');
    Route::get('/spaces', [SpaceController::class, 'index'])->name('spaces.index');
    Route::post('/spaces', [SpaceController::class, 'store'])->name('spaces.store');

    $spaceFeatureRoutes = function (): void {
        Route::get('dashboard', [DashboardController::class, 'show'])->name('spaces.dashboard');

        Route::get('location', [LocationController::class, 'index'])->name('location.map');

        Route::get('timeline', [LoveTimelineApiController::class, 'index'])->name('timeline.index');
        Route::get('timeline/create', [LoveTimelineApiController::class, 'create'])->name('timeline.create');
        Route::post('timeline', [LoveTimelineApiController::class, 'store'])->name('timeline.store');
        Route::get('timeline/{id}/edit', [LoveTimelineApiController::class, 'edit'])->name('timeline.edit');
        Route::post('timeline/{id}', [LoveTimelineApiController::class, 'update'])->name('timeline.update');
        Route::delete('timeline/{id}', [LoveTimelineApiController::class, 'destroy'])->name('timeline.destroy');

        Route::get('daily-messages', [DailyMessageApiController::class, 'index'])->name('daily.index');
        Route::get('daily-messages/create', [DailyMessageApiController::class, 'create'])->name('daily.create');
        Route::post('daily-messages', [DailyMessageApiController::class, 'store'])->name('daily.store');
        Route::get('daily-messages/{id}/edit', [DailyMessageApiController::class, 'edit'])->name('daily.edit');
        Route::put('daily-messages/{id}', [DailyMessageApiController::class, 'update'])->name('daily.update');
        Route::post('daily-messages/regenerate', [DailyMessageApiController::class, 'regenerate'])->name('daily.regenerate');
        Route::post('daily-messages/{id}/email', [DailyMessageApiController::class, 'sendEmail'])->name('daily.email');

        Route::get('countdowns', [CountdownApiController::class, 'index'])->name('countdown.index');
        Route::get('countdowns/create', [CountdownApiController::class, 'create'])->name('countdown.create');
        Route::post('countdowns', [CountdownApiController::class, 'store'])->name('countdown.store');
        Route::get('countdowns/{id}/edit', [CountdownApiController::class, 'edit'])->name('countdown.edit');
        Route::put('countdowns/{id}', [CountdownApiController::class, 'update'])->name('countdown.update');
        Route::delete('countdowns/{id}', [CountdownApiController::class, 'destroy'])->name('countdown.destroy');

        Route::get('journals', [LoveJournalApiController::class, 'index'])->name('journal.index');
        Route::get('journals/create', [LoveJournalApiController::class, 'create'])->name('journal.create');
        Route::post('journals', [LoveJournalApiController::class, 'store'])->name('journal.store');
        Route::get('journals/{id}/edit', [LoveJournalApiController::class, 'edit'])->name('journal.edit');
        Route::put('journals/{id}', [LoveJournalApiController::class, 'update'])->name('journal.update');
        Route::delete('journals/{id}', [LoveJournalApiController::class, 'destroy'])->name('journal.destroy');

        Route::get('gallery', [MediaGalleryApiController::class, 'index'])->name('gallery.index');
        Route::get('gallery/create', [MediaGalleryApiController::class, 'create'])->name('gallery.create');
        Route::post('gallery', [MediaGalleryApiController::class, 'store'])->name('gallery.store');
        Route::get('gallery/{id}/edit', [MediaGalleryApiController::class, 'edit'])->name('gallery.edit');
        Route::put('gallery/{id}', [MediaGalleryApiController::class, 'update'])->name('gallery.update');
        Route::delete('gallery/{id}', [MediaGalleryApiController::class, 'destroy'])->name('gallery.destroy');

        Route::get('spotify/authorize', [SpotifyAuthController::class, 'redirect'])->name('spotify.authorize');
        Route::get('spotify/dashboard-data', [SpotifyController::class, 'dashboard'])->name('spotify.dashboard');
        Route::post('spotify/surprises', [SpotifyController::class, 'storeSurprise'])->name('spotify.surprises.store');
        Route::post('spotify/capsules', [SpotifyController::class, 'storeCapsule'])->name('spotify.capsules.store');
        Route::post('spotify/playback/join', [SpotifyController::class, 'joinPlayback'])->name('spotify.playback.join');

        Route::get('spotify-companion', function (Space $space) {
            return Inertia::render('Spotify/LongDistanceSpotifyHub', [
                'space' => [
                    'id' => $space->id,
                    'slug' => $space->slug,
                    'title' => $space->title,
                ],
            ]);
        })->name('spotify.companion');

        Route::get('nobar', [NobarController::class, 'show'])->name('space.nobar');
        Route::post('nobar/schedules', [NobarController::class, 'storeSchedule'])->name('space.nobar.schedules.store');

        Route::get('roomjitsi', function (Space $space) {
            return Inertia::render('Room/Show', [
                'spaceId' => $space->id,
                'user' => Auth::user()?->name ?? 'Guest',
            ]);
        });
    };

    if (config('app.space_subdomain_routing')) {
        Route::domain('{space:slug}.' . config('app.space_domain'))
            ->middleware('space.access')
            ->group($spaceFeatureRoutes);

        Route::middleware('space.access')->group(function () {
            Route::get('/spaces/{space:slug}/{any?}', function (Space $space, ?string $any = null) {
                $dashboardUrl = route('spaces.dashboard', ['space' => $space->slug]);
                $rootUrl = Str::replaceLast('/dashboard', '', $dashboardUrl);
                $target = $any ? Str::finish($rootUrl, '/') . ltrim($any, '/') : $dashboardUrl;

                return redirect()->to($target);
            })->where('any', '.*');
        });
    } else {
        Route::prefix('spaces/{space:slug}')
            ->middleware('space.access')
            ->group($spaceFeatureRoutes);
    }

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
