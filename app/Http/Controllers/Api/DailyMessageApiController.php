<?php


namespace App\Http\Controllers\Api;

use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Models\DailyMessage;
use App\Models\Space;
use App\Services\DailyMessageGenerator;
use Gemini;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class DailyMessageApiController extends Controller
{
    private $dailyMessageGenerator;

    public function __construct(DailyMessageGenerator $dailyMessageGenerator)
    {
        $this->dailyMessageGenerator = $dailyMessageGenerator;
    }

    public function index(Request $request, Space $space)
    {
        $this->authorizeSpace($space);

        $search = $request->input('search');
        $date = $request->input('date');

        $query = DailyMessage::where('space_id', $space->id);

        if ($search) {
            $query->where('message', 'like', '%' . $search . '%');
        }

        if ($date) {
            $query->whereDate('date', $date);
        }

        $messages = $query->latest()->get();

        // If no messages are found and no search/date filters are applied, generate a message for today
        if ($messages->isEmpty() && !$search && !$date) {
            $today = now()->toDateString();
            $message = DailyMessage::where('space_id', $space->id)->where('date', $today)->first();

            if (!$message) {
                [$fromName, $partnerName] = $this->resolveNamePair($space);
                $text = $this->dailyMessageGenerator->generate(null, null, $fromName, $partnerName);
                DailyMessage::create([
                    'space_id' => $space->id,
                    'date' => $today,
                    'message' => $text,
                    'generated_by' => 'ai'
                ]);
                $messages = DailyMessage::where('space_id', $space->id)->latest()->get();
            }
        }

        if (request()->has('json')) {
            if ($messages->isNotEmpty()) {
                return response()->json(['message' => $messages->first()]);
            } else {
                return response()->json(['message' => null], 404);
            }
        } else {
            return Inertia::render('DailyMessages/Index', [
                'messages' => $messages,
                'space' => $this->spacePayload($space),
                'filters' => [
                    'search' => $search,
                    'date' => $date,
                ],
            ]);
        }
    }

    public function create(Space $space)
    {
        $this->authorizeSpace($space);

        return Inertia::render('DailyMessages/Create', [
            'space' => $this->spacePayload($space),
        ]);
    }

    public function store(Request $r, Space $space)
    {
        $this->authorizeSpace($space);

        $data = $r->validate([
            'date' => 'required|date',
            'message' => 'required|string',
        ]);

        $dm = DailyMessage::updateOrCreate(
            ['space_id' => $space->id, 'date' => $data['date']],
            ['message' => $data['message'], 'generated_by' => 'manual']
        );

        return redirect(route('daily.index', ['space' => $space->slug]));
    }

   public function regenerate(Space $space)
    {
        $this->authorizeSpace($space);

        // Hapus pesan harian yang ada untuk hari ini
        $today = now()->toDateString();
        DailyMessage::where('space_id', $space->id)
            ->where('date', $today)
            ->delete();

        // Generate pesan baru
        [$fromName, $partnerName] = $this->resolveNamePair($space);
        $text = $this->dailyMessageGenerator->generate(null, null, $fromName, $partnerName);

        if (!$text) {
            return response()->json(['error' => 'Gagal generate pesan AI'], 500);
        }

        $dailyMessage = DailyMessage::create([
            'space_id'     => $space->id,
            'date'         => $today,
            'message'      => $text,
            'generated_by' => 'ai'
        ]);

        return response()->json(['message' => $dailyMessage]);
    }

    public function getTodayMessage(Space $space)
    {
        $this->authorizeSpace($space);

        $today = now()->toDateString();
        $message = DailyMessage::where('space_id', $space->id)->where('date', $today)->first();

        if ($message) {
            return response()->json(['message' => $message]);
        } else {
            return response()->json(['message' => null], 404);
        }
    }

    private function authorizeSpace(Space $space)
    {
        if (!$space->hasMember(Auth::id())) abort(403);
    }

    private function resolveNamePair(Space $space): array
    {
        $space->loadMissing(['userOne', 'userTwo']);

        $currentUser = Auth::user();
        $fromName = $currentUser?->name;
        $partnerName = null;

        if ($currentUser) {
            if ($space->user_one_id === $currentUser->id) {
                $partnerName = optional($space->userTwo)->name;
            } elseif ($space->user_two_id === $currentUser->id) {
                $partnerName = optional($space->userOne)->name;
            }
        }

        if (!$fromName && $space->userOne) {
            $fromName = $space->userOne->name;
        }

        if (!$partnerName) {
            if ($space->userOne && $space->userOne->name !== $fromName) {
                $partnerName = $space->userOne->name;
            } elseif ($space->userTwo && $space->userTwo->name !== $fromName) {
                $partnerName = $space->userTwo->name;
            }
        }

        return [$fromName, $partnerName];
    }

    public function update(Request $request, Space $space, $id)
    {
        $this->authorizeSpace($space);

        $data = $request->validate([
            'date' => 'required|date',
            'message' => 'required|string',
        ]);

        $dailyMessage = DailyMessage::where('space_id', $space->id)->findOrFail($id);

        $dailyMessage->update($data);

        return redirect()->route('daily.index', ['space' => $space->slug])
            ->with('success', 'Daily Message berhasil diperbarui!');
    }

    public function edit(Space $space, $id)
    {
        $this->authorizeSpace($space);

        $dailyMessage = DailyMessage::where('space_id', $space->id)->findOrFail($id);

        return Inertia::render('DailyMessages/Edit', [
            'space' => $this->spacePayload($space),
            'dailyMessage' => $dailyMessage,
        ]);
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
