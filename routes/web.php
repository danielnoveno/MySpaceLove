<?php

require __DIR__ . '/auth.php';

use App\Http\Controllers\Api\CountdownApiController;
use App\Http\Controllers\Api\DailyMessageApiController;
use App\Http\Controllers\Api\DocApiController;
use App\Http\Controllers\Api\LoveJournalApiController;
use App\Http\Controllers\Api\LoveTimelineApiController;
use App\Http\Controllers\Api\MediaGalleryApiController;
use App\Http\Controllers\Api\SpaceApiController;
use App\Http\Controllers\Api\SurpriseNoteApiController;
use App\Http\Controllers\Api\WishlistApiController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

Route::get('/', function () {
    return redirect('/login');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Profile Routes
    Route::get('/profile/edit', [App\Http\Controllers\ProfileController::class, 'edit'])->name('profile.edit');
    Route::put('/profile/update', [App\Http\Controllers\ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile/destroy', [App\Http\Controllers\ProfileController::class, 'destroy'])->name('profile.destroy');

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/timeline/{spaceId}', [LoveTimelineApiController::class, 'index'])->name('timeline.index');
    Route::get('/timeline/{spaceId}/create', [LoveTimelineApiController::class, 'create'])->name('timeline.create');
    Route::post('/timeline/{spaceId}', [LoveTimelineApiController::class, 'store'])->name('timeline.store');
    Route::get('/timeline/{spaceId}/{id}/edit', [LoveTimelineApiController::class, 'edit'])->name('timeline.edit');
    // Route::put('/timeline/{spaceId}/{id}', [LoveTimelineApiController::class, 'update'])->name('timeline.update');
    Route::post('/timeline/{spaceId}/{id}', [LoveTimelineApiController::class, 'update'])->name('timeline.update');
    Route::delete('/timeline/{spaceId}/{id}', [LoveTimelineApiController::class, 'destroy'])->name('timeline.destroy');

    // Daily Messages Routes
    Route::get('/daily-messages/{spaceId}', [DailyMessageApiController::class, 'index'])->name('daily.index');
    Route::get('/daily-messages/{spaceId}/create', [DailyMessageApiController::class, 'create'])->name('daily.create');
    Route::post('/daily-messages/{spaceId}', [DailyMessageApiController::class, 'store'])->name('daily.store');
    Route::get('/daily-messages/{spaceId}/{id}/edit', [DailyMessageApiController::class, 'edit'])->name('daily.edit');
    Route::put('/daily-messages/{spaceId}/{id}', [DailyMessageApiController::class, 'update'])->name('daily.update');
    Route::post('/daily-messages/{spaceId}/regenerate', [DailyMessageApiController::class, 'regenerate'])->name('daily.regenerate');

    // Countdown Routes
    Route::get('/countdowns', [CountdownApiController::class, 'index'])->name('countdown.index');
    Route::get('/countdowns/create', [CountdownApiController::class, 'create'])->name('countdown.create');
    Route::post('/countdowns', [CountdownApiController::class, 'store'])->name('countdown.store');
    Route::get('/countdowns/{id}/edit', [CountdownApiController::class, 'edit'])->name('countdown.edit');
    Route::put('/countdowns/{id}', [CountdownApiController::class, 'update'])->name('countdown.update');
    Route::delete('/countdowns/{id}', [CountdownApiController::class, 'destroy'])->name('countdown.destroy');

    // Journal Routes
    Route::get('/journals/{spaceId}', [LoveJournalApiController::class, 'index'])->name('journal.index');
    Route::get('/journals/{spaceId}/create', [LoveJournalApiController::class, 'create'])->name('journal.create');
    Route::post('/journals/{spaceId}', [LoveJournalApiController::class, 'store'])->name('journal.store');
    Route::get('/journals/{spaceId}/{id}/edit', [LoveJournalApiController::class, 'edit'])->name('journal.edit');
    Route::put('/journals/{spaceId}/{id}', [LoveJournalApiController::class, 'update'])->name('journal.update');
    Route::delete('/journals/{spaceId}/{id}', [LoveJournalApiController::class, 'destroy'])->name('journal.destroy');

    // Surprise Notes Routes
    Route::get('/surprise-notes', [SurpriseNoteApiController::class, 'index'])->name('notes.index');
    Route::get('/surprise-notes/create', [SurpriseNoteApiController::class, 'create'])->name('notes.create');
    Route::post('/surprise-notes', [SurpriseNoteApiController::class, 'store'])->name('notes.store');
    Route::get('/surprise-notes/{id}/edit', [SurpriseNoteApiController::class, 'edit'])->name('notes.edit');
    Route::put('/surprise-notes/{id}', [SurpriseNoteApiController::class, 'update'])->name('notes.update');
    Route::delete('/surprise-notes/{id}', [SurpriseNoteApiController::class, 'destroy'])->name('notes.destroy');

    // Media Gallery Routes
    Route::get('/gallery/{spaceId}', [MediaGalleryApiController::class, 'index'])->name('gallery.index');
    Route::get('/gallery/{spaceId}/create', [MediaGalleryApiController::class, 'create'])->name('gallery.create');
    Route::post('/gallery/{spaceId}', [MediaGalleryApiController::class, 'store'])->name('gallery.store');
    Route::get('/gallery/{spaceId}/{id}/edit', [MediaGalleryApiController::class, 'edit'])->name('gallery.edit');
    Route::post('/gallery/{spaceId}/{id}', [MediaGalleryApiController::class, 'update'])->name('gallery.update');
    Route::delete('/gallery/{spaceId}/{id}', [MediaGalleryApiController::class, 'destroy'])->name('gallery.destroy');
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
    Route::delete('/docs/{id}', [DocApiController::class, 'destroy'])->name('docs.destroy');

    // Space Settings
    Route::get('/space/settings', [SpaceApiController::class, 'settings'])->name('space.settings');
    Route::put('/space/settings', [SpaceApiController::class, 'updateSettings'])->name('space.updateSettings');
});
