<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LoveJournal;
use App\Models\Space;
use App\Notifications\JournalCreated;
use App\Notifications\JournalDeleted;
use App\Notifications\JournalUpdated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Services\ActivityLogger;
use Inertia\Inertia;

class LoveJournalApiController extends Controller
{
    public function __construct(private readonly ActivityLogger $activityLogger)
    {
    }

    public function index(Space $space)
    {
        $this->authorizeSpace($space);
        // return LoveJournal::where('space_id', $space->id)->latest()->get();

        $journals = LoveJournal::where('space_id', $space->id)->latest()->get();

        return Inertia::render('Journals/Index', [
            'items' => $journals,
            'space' => $this->spacePayload($space),
        ]);
    }

    public function store(Request $r, Space $space)
    {
        $this->authorizeSpace($space);

        $data = $r->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'mood' => 'nullable|in:happy,sad,miss,excited,grateful,melancholy',
        ]);
        $data['space_id'] = $space->id;
        $data['user_id'] = Auth::id();

        $journal = LoveJournal::create($data);

        $partner = $space->partner();
        $senderName = Auth::user()->name ?? 'Pasangan';
        $data = [
            'space_id' => $space->id,
            'space_slug' => $space->slug,
            'journal_id' => $journal->id,
            'journal_title' => $journal->title,
            'action_url' => route('journal.index', ['space' => $space->slug]),
            'action_label' => __('Lihat Jurnal'),
        ];

        if ($partner) {
            $this->activityLogger->log(
                $partner,
                'journal.created',
                __(':actor membuat jurnal baru', ['actor' => $senderName]),
                __('Jurnal ":title" baru ditambahkan.', ['title' => $journal->title]),
                $data,
                sendMail: true
            );
            $partner->notify(new JournalCreated($journal, $space, 'created', $senderName));
        }


        $this->activityLogger->log(
            Auth::user(),
            'journal.created',
            __('Jurnal Anda berhasil dibuat'),
            __('Jurnal ":title" Anda telah berhasil disimpan.', ['title' => $journal->title]),
            $data,
            sendMail: false // Sender already gets JournalCreated, only log activity for them
        );

        return Inertia::location(route('journal.index', ['space' => $space->slug]));
    }

    public function update(Request $r, Space $space, $id)
    {
        $this->authorizeSpace($space);
        $journal = LoveJournal::where('space_id', $space->id)->findOrFail($id);

        // only allow author to update their own journal
        if ($journal->user_id !== Auth::id()) abort(403);

        $data = $r->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'mood' => 'nullable|in:happy,sad,miss,excited,grateful,melancholy',
        ]);
        $journal->update($data);

        $partner = $space->partner();
        $senderName = Auth::user()->name ?? 'Pasangan';
        if ($partner) {
            $partner->notify(new JournalUpdated($journal, $space, 'updated', $senderName));
        }


        return Inertia::location(route('journal.index', ['space' => $space->slug]));
    }

    public function destroy(Request $request, Space $space, $id)
    {
        $this->authorizeSpace($space);
        $journal = LoveJournal::where('space_id', $space->id)->findOrFail($id);
        if ($journal->user_id !== Auth::id()) abort(403);
        $journalId = $journal->id;
        $journal->delete();

        $partner = $space->partner();
        $senderName = Auth::user()->name ?? 'Pasangan';
        if ($partner) {
            $partner->notify(new JournalDeleted($journal, $space, 'deleted', $senderName));
        }


        if ($request->wantsJson()) {
            return response()->json(['message' => 'deleted']);
        }

        return redirect()
            ->route('journal.index', ['space' => $space->slug])
            ->with('success', __('Jurnal berhasil dihapus.'));
    }

    public function create(Space $space)
    {
        $this->authorizeSpace($space);
        return Inertia::render('Journals/Create', [
            'space' => $this->spacePayload($space),
        ]);
    }

    public function edit(Space $space, $id)
    {
        $this->authorizeSpace($space);
        $journal = LoveJournal::where('space_id', $space->id)->findOrFail($id);

        return Inertia::render('Journals/Edit', [
            'journal' => $journal,
            'space' => $this->spacePayload($space),
        ]);
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
