<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DailyMessageGenerator
{
    public function generate(): string
    {
        return $this->generateGeminiMessage();
    }

    private function generateGeminiMessage()
    {
        $apiKey = env('GEMINI_API_KEY');
        if (!$apiKey) {
            Log::warning('GEMINI_API_KEY is not set in .env file.');
            return null; // biar gampang ditangani di controller
        }

        try {
            $prompt = <<<PROMPT
Tulis SATU saja pesan cinta romantis untuk pasangan LDR.
Gunakan gaya bahasa yang indah, hangat, penuh semangat, dan mendukung.
Boleh lebih dari 2 kalimat, seperti sebuah mini-paragraf singkat.
Tambahkan emoji agar lebih lucu & manis.
Jangan gunakan format list atau nomor.
Langsung tulis pesannya saja.
PROMPT;

            $url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' . $apiKey;

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post($url, [
                'contents' => [
                    [
                        'role' => 'user',
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ]
            ]);

            // Log untuk debugging
            Log::info('Gemini API Response', [
                'status' => $response->status(),
                'body'   => $response->json()
            ]);

            if ($response->failed()) {
                return null;
            }

            // Ambil teks dari response
            $text = $response->json('candidates.0.content.parts.0.text');

            if ($text) {
                // Hilangkan nomor/list kalau masih ada
                $text = preg_replace('/^\d+\.\s*/m', '', trim($text));

                // Kalau model masih kasih beberapa baris, ambil semua jadi 1 paragraf
                $text = preg_replace("/[\r\n]+/", " ", $text);

                // Rapikan spasi
                $text = trim(preg_replace('/\s+/', ' ', $text));
            }

            return $text ?: null;
        } catch (\Exception $e) {
            Log::error('Gemini API Exception', [
                'message' => $e->getMessage(),
            ]);
            return null;
        }
    }
}
