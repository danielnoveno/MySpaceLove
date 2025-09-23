<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DailyMessage;
use App\Models\Space;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;

class DailyMessageApiController extends Controller
{
    public function index($spaceId)
    {
        $space = Space::findOrFail($spaceId);
        $this->authorizeSpace($space);

        $today = now()->toDateString();
        $message = DailyMessage::where('space_id', $space->id)->where('date', $today)->first();

        if (!$message) {
            // generate from Gemini (stub) - adjust endpoint/format to actual Gemini response
            $apiKey = env('GEMINI_API_KEY');
            try {
                $prompt = "Buat pesan cinta singkat 1-2 kalimat untuk pasangan LDR yang hangat dan menyemangati.";
                $resp = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $apiKey,
                    'Content-Type'  => 'application/json',
                ])->post('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' . $apiKey, [
                    // adapt payload to actual Gemini API shape
                    'prompt' => $prompt
                ]);

                // Attempt to extract text (adapt based on real response)
                $text = $resp->json('candidates.0.content.parts.0.text')
                    ?? $resp->json('candidates.0.output')
                    ?? $resp->json('output_text')
                    ?? null;
            } catch (\Exception $e) {
                $text = null;
            }

            if (!$text) {
                $text = "Hai sayang, semoga harimu cerah dan penuh semangat 💖";
            }

            $message = DailyMessage::create([
                'space_id' => $space->id,
                'date' => $today,
                'message' => $text,
                'generated_by' => 'ai'
            ]);
        }

        return response()->json($message);
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

        return response()->json($dm, 201);
    }

    public function regenerate($spaceId)
    {
        $space = Space::findOrFail($spaceId);
        $this->authorizeSpace($space);

        $today = now()->toDateString();
        DailyMessage::where('space_id', $space->id)->where('date', $today)->delete();
        return $this->index($spaceId);
    }

    private function authorizeSpace(Space $space)
    {
        if (!$space->hasMember(Auth::id())) abort(403);
    }
}
