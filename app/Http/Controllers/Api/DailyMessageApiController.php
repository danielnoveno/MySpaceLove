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

    public function index($spaceId)
    {
        $space = Space::findOrFail($spaceId);
        $this->authorizeSpace($space);

        $today = now()->toDateString();
        $message = DailyMessage::where('space_id', $space->id)->where('date', $today)->first();

        if (!$message) {
            // generate from Gemini (stub) - adjust endpoint/format to actual Gemini response
            $text = $this->dailyMessageGenerator->generate();

            $message = DailyMessage::create([
                'space_id' => $space->id,
                'date' => $today,
                'message' => $text,
                'generated_by' => 'ai'
            ]);

            $messages = DailyMessage::where('space_id', $space->id)->latest()->get();
            return Inertia::render('DailyMessages/Index', [
                'messages' => $messages,
                'spaceId' => $spaceId,
            ]);
        }

        $messages = DailyMessage::where('space_id', $space->id)->latest()->get();
        return Inertia::render('DailyMessages/Index', [
            'messages' => $messages,
            'spaceId' => $spaceId,
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
        ]);
        $date = date('Y-m-d', strtotime($data['date']));

        DailyMessage::where('space_id', $space->id)
            ->where('date', $date)
            ->delete();

        $text = $this->dailyMessageGenerator->generate();

        if (!$text) {
            return redirect()->route('daily.index', $spaceId)
                ->with('error', 'Gagal generate pesan AI');
        }

        DailyMessage::create([
            'space_id'     => $space->id,
            'date'         => $date,
            'message'      => $text,
            'generated_by' => 'ai'
        ]);

        return redirect()->route('daily.index', $spaceId)
            ->with('success', 'Pesan AI berhasil digenerate ulang!');
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
