<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DailyMessageGenerator
{
    private ?string $lastErrorMessage = null;
    private ?int $lastErrorStatus = null;
    private string $model;

    public function generate(
        ?string $existingMessage = null,
        ?string $mood = null,
        ?string $senderName = null,
        ?string $partnerName = null,
        array $recentMessages = []
    ): ?string {
        $this->model = env('GEMINI_MODEL', 'gemini-2.5-flash');
        return $this->generateGeminiMessage($existingMessage, $mood, $senderName, $partnerName, $recentMessages);
    }

    private function generateGeminiMessage(
        ?string $existingMessage = null,
        ?string $mood = null,
        ?string $senderName = null,
        ?string $partnerName = null,
        array $recentMessages = []
    ) {
        $this->lastErrorMessage = null;
        $this->lastErrorStatus = null;

        $apiKey = env('GEMINI_API_KEY');
        if (!$apiKey) {
            $this->lastErrorMessage = 'GEMINI_API_KEY is not set in .env file. Falling back to local generator.';
            Log::warning($this->lastErrorMessage);

            return $this->generateFallbackMessage($senderName, $partnerName);
        }

        try {
            // Array of styles for variation (tetap dipertahankan agar tema harian berubah-ubah)
            $styles = [
                'romantic quote style from famous writers or thinkers',
                'short playful message with emojis like chat style',
                'inspirational affirmation mixing English and Bahasa Indonesia',
                'flirty and teasing message but still cute',
                'soft comforting reminder style message',
                'appreciation message with grateful tone',
                'aesthetic mini love note like Pinterest style',
                'uplifting daily relationship affirmation',
                'funny meme-like but romantic style message'
            ];

            $selectedStyle = $styles[array_rand($styles)];

            $fromName = $senderName ? trim($senderName) : null;
            $toName = $partnerName ? trim($partnerName) : null;

            $context = [
                'from_name' => $fromName,
                'partner_name' => $toName,
            ];

            // Instruksi Personal (Ciri Khas)
            $voiceCalibration = "Adopt a very specific Indonesian boyfriend persona. The speech pattern must be casual, slightly clingy, and warm.
            KEY LINGUISTIC MARKERS (Use these naturally in sentences):
            1. Use particles like 'tu', 'tau', 'dong' frequently to emphasize feelings (e.g., 'Aku tu...', 'Sayang tau gak...', 'Kamu tu...').
            2. Use affectionate terms repetitively but naturally (e.g., 'Sayang', 'Yang').
            3. Sentence structure should feel spoken, not written. It should sound like a whisper or a soft chat.
            4. Example vibe (do not copy, just mimic syntax): 'Aku tu mikirin kamu terus tau yang', 'Sayang tau gak aku sesayang itu sama kamu'.";

            // Instruksi Psikologis (Trauma & Trust Issue Research)
            $psychologicalFramework = "The recipient has past trauma and trust issues. The message MUST follow these psychological safety guidelines:
            1. **Avoid Hyperbole/Love Bombing:** Do not use over-the-top promises like 'I will die for you' or 'Everything is perfect'. This triggers suspicion in people with trust issues.
            2. **Focus on Consistency & Safety:** Use words that imply stability, safety, and calming presence (e.g., 'aman', 'tenang', 'di sini', 'pulang').
            3. **Validating & Reassuring:** Ackowledge that while things might be hard, you are staying. The tone must be 'Secure Attachment'—grounded, calm, and sure.
            4. **The Goal:** Make them feel regulated and safe, not just flattered. Prove reliability through words.";

            if (!$fromName) {
                $context['from_name_hint'] = "Use a gentle neutral sign-off like 'Your partner'.";
            }

            if (!$toName) {
                $context['partner_name_hint'] = 'No partner name supplied, keep the wording affectionate without inventing one.';
            }

            $personalizationRequirement = $toName
                ? sprintf(
                    'Mention %s naturally at least once and write it as if %s is speaking directly to them using the defined persona.',
                    $toName,
                    $fromName ?: 'their partner'
                )
                : 'Keep the message intimate without inventing specific names.';

            $signOffInstruction = $fromName
                ? sprintf('Optionally close with a warm sign-off from %s.', $fromName)
                : 'Close with a caring sign-off that still feels personal.';

            // Structured prompt as JSON
            $promptData = [
                "task" => "Generate a deep, reassuring, and romantic message.",
                "persona_calibration" => [
                    "voice_style" => $voiceCalibration,
                    "psychological_approach" => $psychologicalFramework
                ],
                "requirements" => [
                    "length" => "Keep it 200-300 words and 30-60 sentences. Never stop before 200 words; extend smoothly if needed.",
                    "theme_style" => $selectedStyle, // Tetap gunakan style random tapi dibalut dengan persona di atas
                    "language" => "Dominant Bahasa Indonesia with natural casual slang, occasionally mixed with simple soft English phrases.",
                    "tone" => "Calming, Convincing (meyakinkan), Clingy but Secure, Warm.",
                    "emoji" => "Add 6-15 appropriate emojis inline (warm colors like 🤎, 🤍, 🧸, 🏠).",
                    "avoid" => [
                        "Cliché poetic words like 'samudra', 'benang merah', 'rembulan' (unless used ironically)",
                        "Formal Indonesian (baku)",
                        "Robotic transitions",
                        "Overly dramatic promises that sound fake"
                    ],
                    "format" => "No numbering, no bullet points, no lists. Just one flowing heartfelt paragraph.",
                    "personalization" => $personalizationRequirement,
                    "sign_off" => $signOffInstruction,
                ],
                "context" => $context,
                "examples_to_learn_syntax_from" => [
                    // Hanya untuk referensi syntax, bukan untuk dicopy
                    "Aku tu kadang suka mikir, beruntung banget ya aku punya kamu. Kamu tu rumah buat aku tau yang.",
                    "Sayang, kalo dunia lagi berisik, lari ke aku ya? Aku tu bakal selalu ada buat dengerin kamu, sesayang itu aku sama kamu tau.",
                    "Gak perlu takut ya cantik, aku disini. Aku tu gak kemana-mana, kita jalanin pelan-pelan ya sayang."
                ],
                "output" => "Write one brand new message strictly following the 'persona_calibration' and 'psychological_approach'. Output the message text only."
            ];

            if (!empty($recentMessages)) {
                $promptData['recent_week_chats'] = [
                    'note' => 'These are the chats/daily messages from the past 7 days. Study them first so the new message feels fresh.',
                    'messages' => array_values($recentMessages),
                ];

                $promptData['requirements']['variation_guard'] = "Read 'recent_week_chats' carefully. Avoid repeating the same openings, hooks, emoji placements, or sentence rhythms. Invent a new flow that still matches the persona.";
            }

            // --- Dynamic Prompt Modification ---
            if ($existingMessage) {
                $promptData['task'] = "Rewrite this existing message to match the 'persona_calibration' (make it sound like 'aku tu...', 'sayang tau gak') and make it more psychologically reassuring.";
                $promptData['original_message'] = $existingMessage;
            }

            if ($mood) {
                $promptData['requirements']['user_mood'] = "The partner is currently feeling '{$mood}'. Adjust the reassurance level to soothe this specific emotion.";
            }

            $promptJson = json_encode($promptData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

            $url = sprintf(
                'https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s',
                $this->model,
                $apiKey
            );

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post($url, [
                'contents' => [
                    [
                        'role' => 'user',
                        'parts' => [
                            ['text' => $promptJson]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 1.4, // Sedikit lebih kreatif untuk variasi emosi
                    'topK' => 50,
                    'topP' => 0.95,
                ]
            ]);

            Log::info('Gemini API Response', [
                'status' => $response->status(),
                'model'  => $this->model,
            ]);

            if ($response->failed()) {
                $this->lastErrorStatus = $response->status();
                $this->lastErrorMessage = $response->json('error.message') ?? 'Gemini API request failed.';
                Log::warning('Gemini API request failed, using fallback generator.', [
                    'status' => $this->lastErrorStatus,
                    'message' => $this->lastErrorMessage,
                ]);

                return $this->generateFallbackMessage($senderName, $partnerName);
            }

            $candidates = $response->json('candidates');
            $text = null;

            if (is_array($candidates) && !empty($candidates)) {
                $parts = $candidates[0]['content']['parts'] ?? null;

                if (is_array($parts) && !empty($parts)) {
                    $text = $parts[0]['text'] ?? null;

                    if ($text) {
                        $text = preg_replace('/^\d+\.\s*/m', '', trim($text));
                        $text = preg_replace('/^[-*]\s*/m', '', $text);
                        $text = trim($text, "\"'");
                        $text = preg_replace("/[\r\n]+/", " ", $text);
                        $text = trim(preg_replace('/\s+/', ' ', $text));
                    } else {
                        Log::warning('Gemini API: Text is empty.');
                    }
                } else {
                    Log::warning('Gemini API: Parts is empty or not an array.');
                }
            } else {
                Log::warning('Gemini API: Candidates is empty or not an array.');
            }

            if ($text) {
                return $text;
            }

            Log::warning('Gemini API returned no usable text, using fallback generator.');
            return $this->generateFallbackMessage($senderName, $partnerName);
        } catch (\Exception $e) {
            $this->lastErrorMessage = $e->getMessage();
            $this->lastErrorStatus = 500;

            Log::error('Gemini API Exception', ['message' => $this->lastErrorMessage]);
            return $this->generateFallbackMessage($senderName, $partnerName);
        }
    }

    public function getLastErrorMessage(): ?string
    {
        return $this->lastErrorMessage;
    }

    public function getLastErrorStatus(): ?int
    {
        return $this->lastErrorStatus;
    }

    /**
     * Fallback message generator when Gemini is unavailable.
     */
    private function generateFallbackMessage(?string $senderName, ?string $partnerName): string
    {
        $from = $senderName && trim($senderName) !== '' ? trim($senderName) : 'aku';
        $to = $partnerName && trim($partnerName) !== '' ? trim($partnerName) : 'sayang';

        // Updated fallback to match the "aku tu" style slightly better
        $sentences = [
            "Halo {$to}, aku tu cuma mau bilang kalo kamu berharga banget buat {$from} 🤎.",
            "Sayang tau gak, aku suka banget cara kamu bikin hal kecil jadi spesial, makasih ya udah jadi diri kamu sendiri 😊.",
            "Setiap kali kamu cerita tentang harimu, aku tu ngerasa deket banget sama kamu.",
            "{$to} tu tempat ternyaman aku tau, makanya aku betah banget sama kamu.",
            "Aku bangga banget sama kamu, jangan lupa istirahat ya sayang, aku gamau kamu sakit 💪.",
            "Aku tu pengen terus jadi orang yang bisa kamu andalkan, aku disini ya, gak kemana-mana.",
            "Kalo hari ini berat, inget ya ada aku disini yang selalu dukung kamu, sesayang itu aku sama kamu.",
            "Semoga hari ini ada hal kecil yang bikin kamu senyum ya, love you more than words can say 🧸.",
            "Aku gak akan bosen bilang kalo kamu tu versi terbaik yang pernah aku temui.",
            "Makasih ya udah kasih aku ruang di hidup kamu, aku janji bakal jaga kepercayaan ini baik-baik.",
            "Peluk jauh dari {$from}, kamu aman sama aku 💌."
        ];

        return implode(' ', $sentences);
    }
}
