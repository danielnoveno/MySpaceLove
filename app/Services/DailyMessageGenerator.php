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
            return null; // easier to handle in controller
        }

        try {
            // Array of styles for variation
            $styles = [
                'romantic quote style from famous writers or thinkers',
                'short playful message with emojis like chat style',
                'inspirational affirmation mixing English and Bahasa Indonesia',
                'flirty and teasing message but still cute',
                'soft comforting reminder style message',
                'appreciation message with grateful tone',
                'aesthetic mini love note like Pinterest style',
                'uplifting daily relationship affirmation',
                'quote from philosophers or poets about love adapted to couple context',
                'funny meme-like but romantic style message'
            ];

            $selectedStyle = $styles[array_rand($styles)];

            // Structured prompt as JSON
            $promptData = [
                "task" => "Generate a unique romantic or love-related message.",
                "requirements" => [
                    "length" => "20-50 sentences",
                    "style" => $selectedStyle,
                    "language" => "Mix of natural Bahasa Indonesia and/or English",
                    "tone" => "warm, genuine, personal, avoid clichés",
                    "emoji" => "Add 5-7 appropriate emojis",
                    "avoid" => [
                        "Sayangku",
                        "meski jarak memisahkan",
                        "samudra dan daratan",
                        "benang cinta tak kasat mata",
                        "ketahuilah",
                        "percayalah at beginning"
                    ],
                    "source_reference" => "You may draw inspiration or quotes from famous authors, poets, or philosophers about love (like Rumi, Khalil Gibran, Maya Angelou, etc.) but adapt to personal message style.",
                ],
                "examples" => [
                    // --- Your short examples ---
                    "You're special to me. You are the only one who I wouldn't mind losing sleep for, the only one who I can never get tired of talking to and the only one who crosses my mind constantly throughout the day. You are the only one who can make me smile without any intention and affect my emotions with every action of yours. I can't explain in words how much you mean to me but you're the one I'm afraid of losing and the one I want to keep in my life.",

                    "My dear pretty girl I know It's so easy to love someone when things are perfect and everything's wonderful. But to love someone when things are difficult, when they're not being perfect, when they're messing up, flaws are seen, mistakes are made, I think that's what really allows you to see how much love really is there. Anyone can love someone who's doing and saying all the right things, being everything you want and need, but to love someone at their lowest, to love someone despite how broken they feel, when they're lost, when you're willing to stand by them no matter how challenging or difficult things may be, I think that kind of love is a lot more beautiful. Thank you for loving me both times, when things are good and also when things are bad, for taking in every part of me, accepting my flaws, forgiving me, helping me become the best version of myself. I'm truly grateful to have you my love and I'm blessed to be yours. I love you, every version of you, in all the good and bad days, you're my girlfriend, my wifey to be, you always have me, there's no letting go. Nuh uhhh. Mwaghhh Yours and only yours Poohoooh",

                    "My Love, You once asked why I fell in love with you, I am writing this letter to answer that question, you might be wondering why I fell in love with you because I don't often say things like you are pretty, gorgeous or mesmerizing it's not because you aren't. You are beyond beautiful, in ways words will always fail to capture. But I never fell for just the way you look. I fell for the way your soul shines and the word pretty is too small for a soul as vast as yours I love the kindness in your heart, the way you carry your pain with grace, the way you feel everything so deeply-even when it hurts. I love how you cry for others, how you love without limits, how you forgive yet never let anyone dim your light. You think too much, feel too much, care too much-and, that is what makes you extraordinary. I love how your mind dances with questions, how you find magic in the smallest things, how you soften for those you love yet stand unshaken in the face of disrespect. You are both gentle and fierce, innocent and wise. And that is why I love you-not just for your beauty, but for the universe you hold inside you. And when time paints your face with lines of a life well-lived, when years try to steal your youth, I will love you still. I will look at you like you are my sun, my moon, my eternal universe. Because I never loved you for how you looked-I loved you for who you are. And I always will. Eternally yours, The one who stays.",

                    "I don't really know how to start off this message. I have written and removed and written and removed again but I hope this one will not be deleted. No one has loved me like you've loved me. No one has ever taken care of me the way you take care of me. No one in the past has been worried about small things regarding me like you do. I have never met someone like you and this is not to flatter you. This is the truth. People may think or have conclusions like they want to, but me and you know the truth, the real truth. I have never thought you were playing games with me, not when we started, not during and not when things got a bit out of hand. I knew you were honest, I knew your feelings were real and you reminded me of that every single day.... and you still do, even when our backs are against the wall. I can only imagine what you're going through and what is really going on in your mind. You are the only one who I wouldn't mind losing sleep for, the only one who I can never get tired of talking to and the only one who crosses my mind constantly throughout the day. You are the only one who can make me smile without any intention and affect my emotions with every action of yours. I can't explain in words how much you mean to me but you're the one I'm afraid of losing and the one I want to keep in my life. I hope I can make you feel the value that you deserve. You're the best girl anyone could ever ask for. I hope you",

                    // --- Your short casual examples ---
                    // "Kamu tau gak? Setiap kali liat notif dari kamu, hari aku langsung berasa lebih cerah ☀️",
                    // "Aku bangga sama kamu yang terus berjuang di sana. Keep going, sayang! 💪❤️",
                    // "Random thought: Kamu itu comfort person aku banget 🥺✨",
                    // "Pengen remind you aja kalau kamu doing great! I'm always rooting for you 🌟",
                    // "Miss you tapi aku tau kita both lagi kerja keras untuk masa depan kita. Let's go! 💕",
                    // "Hari ini kamu udah makan belum? Jangan lupa jaga kesehatan ya ❤️",
                    // "Fun fact: Kamu itu alasan aku semangat bangun pagi 🌅✨",
                    // "Lagi ngapain? Btw, kamu keren banget tau gak 😎💙",
                    // "Seneng banget punya kamu yang selalu ngerti aku. Thank you for being you 🥰",
                    // "Kangen sih, tapi lebih kangen liat kamu sukses dan bahagia 🌟💕"
                ],
                "output" => "Write one brand new message different from all examples. Directly output the message only without intro."
            ];

            $promptJson = json_encode($promptData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

            $url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=' . $apiKey;

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
                    'temperature' => 1.3,
                    'topK' => 50,
                    'topP' => 0.95,
                    'maxOutputTokens' => 300,
                ]
            ]);

            Log::info('Gemini API Response', [
                'status' => $response->status(),
                'body'   => $response->json()
            ]);

            if ($response->failed()) {
                return null;
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

            return $text ?: null;
        } catch (\Exception $e) {
            Log::error('Gemini API Exception', [
                'message' => $e->getMessage(),
            ]);
            return null;
        }
    }
}
