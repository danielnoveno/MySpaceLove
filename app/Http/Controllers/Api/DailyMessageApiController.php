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

    public function index(Request $request, $spaceId)
    {
        $space = Space::findOrFail($spaceId);
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
                $text = $this->dailyMessageGenerator->generate();
                DailyMessage::create([
                    'space_id' => $space->id,
                    'date' => $today,
                    'message' => $text,
                    'generated_by' => 'ai'
                ]);
                $messages = DailyMessage::where('space_id', $space->id)->latest()->get();
            }
        }

        return Inertia::render('DailyMessages/Index', [
            'messages' => $messages,
            'spaceId' => $spaceId,
            'filters' => [
                'search' => $search,
                'date' => $date,
            ],
        ]);
    }

    public function create($spaceId)
    {
        $space = Space::findOrFail($spaceId);
        $this->authorizeSpace($space);

        return Inertia::render('DailyMessages/Create', [
            'spaceId' => $space->id,
            'space'   => $space,
        ]);
    }

    public function store(Request $r, $spaceId)
    {
        $space = Space::findOrFail($spaceId);
        $this->authorizeSpace($space);

        $data = $r->validate([
            'date' => 'required|date',
            'message' => 'required|string',
        ]);

        $dm = DailyMessage::updateOrCreate(
            ['space_id' => $space->id, 'date' => $data['date']],
            ['message' => $data['message'], 'generated_by' => 'manual']
        );

        return redirect(route('daily.index', ['spaceId' => $spaceId]));
    }

    public function regenerate($spaceId)
    {
        $space = Space::findOrFail($spaceId);
        $this->authorizeSpace($space);

        $data = request()->validate([
            'date' => 'required|date',
            'message' => 'nullable|string', // Pesan yang ada untuk improvisasi
            'mood' => 'nullable|string',    // Mood atau prompt tambahan
        ]);
        $date = date('Y-m-d', strtotime($data['date']));

        DailyMessage::where('space_id', $space->id)
            ->where('date', $date)
            ->delete();

        // Teruskan pesan dan mood ke generator
        $existingMessage = $data['message'] ?? null;
        $mood = $data['mood'] ?? null;

        $text = $this->dailyMessageGenerator->generate($existingMessage, $mood);

        if (!$text) {
            return redirect()->route('daily.index', $spaceId)
                ->with('error', 'Gagal generate pesan AI');
        }

        $dailyMessage = DailyMessage::create([
            'space_id'     => $space->id,
            'date'         => $date,
            'message'      => $text,
            'generated_by' => 'ai'
        ]);

        if (request()->has('json')) {
            return response()->json(['message' => $dailyMessage]);
        }

        return redirect()->route('daily.index', $spaceId)
            ->with('success', 'Pesan Harian berhasil di-regenerate!');
    }

    private function authorizeSpace(Space $space)
    {
        if (!$space->hasMember(Auth::id())) abort(403);
    }

    public function update(Request $request, $spaceId, $id)
    {
        $space = Space::findOrFail($spaceId);
        $this->authorizeSpace($space);

        $data = $request->validate([
            'date' => 'required|date',
            'message' => 'required|string',
        ]);

        $dailyMessage = DailyMessage::findOrFail($id);

        $dailyMessage->update($data);

        // return redirect(route('daily.edit', ['spaceId' => $spaceId, 'id' => $id]));
        return redirect()->route('daily.index', $spaceId)
            ->with('success', 'Daily Message berhasil diperbarui!');
    }

    public function edit($spaceId, $id)
    {
        $space = Space::findOrFail($spaceId);
        $this->authorizeSpace($space);

        $dailyMessage = DailyMessage::findOrFail($id);

        return Inertia::render('DailyMessages/Edit', [
            'spaceId' => $space->id,
            'dailyMessage' => $dailyMessage,
        ]);
    }
}
