<?php

return [
    'memory_lane' => [
        'defaults' => [
            'spaceTitle' => 'us',
        ],
        'headTitle' => 'Memory Lane Kit',
        'secretGate' => [
            'code' => '160825',
            'accessLabel' => 'Restricted Access',
            'title' => 'Enter Our Anniversary Date',
            'description' => 'Only those who remember the special date (format DDMMYY).',
            'placeholder' => 'Example: 160825',
            'buttonLabel' => 'Unlock Kit',
            'errorMessage' => 'Wrong code. Try remembering our special date again.',
            'inputLabel' => 'Secret Code',
        ],
        'puzzle' => [
            'grid' => [
                'rows' => 4,
                'cols' => 4,
            ],
            'pretitle' => 'Mini game',
            'title' => 'Solve the Memory Lane puzzle',
            'description' => 'Before exploring the :spaceTitle space kit, complete this :cols×:rows puzzle first.',
            'solvedTitle' => 'Yes! The :spaceTitle puzzle is complete',
            'solvedDescription' => 'Now you can enjoy every stage of the Memory Lane Kit.',
            'dragLabel' => 'Drag each piece into the correct slot.',
            'movesLabel' => 'Moves',
            'resetLabel' => 'Shuffle pieces again',
            'levels' => [
                [
                    'id' => 'flashback',
                    'label' => 'Level 1 — Flashback',
                    'image' => '/images/puzzle/defaultimage.png',
                    'summaryTitle' => 'Flashback time',
                    'summaryBody' => 'Great job! Take a minute to remember how this moment happened, what you felt, and why it still makes you smile today.',
                ],
                [
                    'id' => 'affirmation',
                    'label' => 'Level 2 — Affirmation',
                    'image' => '/images/puzzle/defaultimage.png',
                    'summaryTitle' => 'Words from the heart',
                    'summaryBody' => 'Write a short congratulations or appreciation message for your partner. Tell them what you love about them right now.',
                ],
                [
                    'id' => 'memory',
                    'label' => 'Level 3 — Memory Capsule',
                    'image' => '/images/puzzle/defaultimage.png',
                    'summaryTitle' => 'Memory capsule unlocked',
                    'summaryBody' => 'Leave a memo, a promise, or a little surprise note for the future. You just built the final piece of today’s Memory Lane.',
                ],
            ],
        ],
        'intro' => [
            'tagline' => 'Surprise kit for the :spaceTitle space',
            'title' => 'Memory Lane Kit',
            'description' => 'Three little prep missions before your partner opens the main gift. Perfect for birthdays, anniversaries, or turning an ordinary day into something special.',
            'stepsHeading' => 'Step by step',
            'tokensHeading' => 'Surprise tokens',
            'challengeLabel' => 'Challenge:',
            'closing' => [
                'description' => 'After this kit, open the Surprise Story menu to send the birthday story gift for the :spaceTitle space. Share this link so your partner gets a double surprise.',
                'story' => [
                    'title' => 'Surprise Story',
                    'description' => 'Gift the complete birthday story to your partner.',
                    'button' => 'Open Storybook',
                ],
                'footnote' => 'Keep the xxxxx code between us, okay?',
            ],
        ],
        'steps' => [
            [
                'id' => 'reminisce',
                'title' => 'Warm Flashback',
                'prompt' => 'Open the gallery and pick our three favourite photos. Tell me why each moment matters.',
                'action' => 'Prepare one heartfelt closing line for each photo.',
            ],
            [
                'id' => 'gratitude',
                'title' => 'Gratitude List',
                'prompt' => 'Write five things that made you grateful for our relationship this week.',
                'action' => 'Slip a sticky note into your partner’s wallet or bag tomorrow.',
            ],
            [
                'id' => 'future',
                'title' => 'Dream Date',
                'prompt' => 'Imagine one dream activity to do together. It doesn’t have to be fancy—our version is enough.',
                'action' => 'Send a playful voice note tonight inviting them on that date.',
            ],
        ],
        'tokens' => [
            [
                'label' => 'Mini Puzzle',
                'detail' => 'Hide tiny clues in three spots around the house.',
                'accent' => 'bg-pink-200/60 text-pink-700',
            ],
            [
                'label' => 'Secret Playlist',
                'detail' => 'Create four songs and add a note about why each track matters.',
                'accent' => 'bg-purple-200/60 text-purple-700',
            ],
            [
                'label' => 'Comfort Food',
                'detail' => 'Order their favourite meal and attach a little message.',
                'accent' => 'bg-emerald-200/60 text-emerald-700',
            ],
        ],
    ],
    'story_book' => [
        'defaults' => [
            'spaceTitle' => 'My Favorite Person',
        ],
        'headTitle' => 'Birthday Story',
        'secretGate' => [
            'enabled' => false,
            'code' => '160825',
            'accessLabel' => 'Restricted Access',
            'title' => 'Enter Our Anniversary Date',
            'description' => 'Special date (format DDMMYY) required to unlock this gift.',
            'placeholder' => 'Example: 160825',
            'buttonLabel' => 'Open Story',
            'errorMessage' => 'Wrong code. Try remembering our special date again.',
            'inputLabel' => 'Secret Code',
        ],
        'hero' => [
            'tagline' => 'A secret page just for you',
            'title' => 'Happy Birthday, :spaceTitle',
            'description' => 'I made this digital book so you can relive every chapter of our journey. Take your time; tap next whenever you want to turn the page. I hope it makes you smile today.',
        ],
        'flipbook' => [
            'empty' => 'There is no story to display yet.',
            'narratorLabel' => 'Love log',
            'progressSuffix' => 'complete',
            'messageLabel' => 'A note for you',
            'previous' => 'Previous',
            'next' => 'Next',
            'finish' => 'Finish',
            'dateFallback' => 'Special memory',
        ],
        'footer' => [
            'reminder' => 'If you want to add new chapters, let me know. We can update it together anytime.',
            'finishMessage' => 'Thank you for being my safest home. I love you every single day.',
            'nextButton' => 'Next',
        ],
        'scrapbook' => [
            'title' => 'Digital scrapbook',
            'subtitle' => 'Each Memory Lane mission becomes a keepsake page you can revisit anytime.',
            'empty' => 'You have not prepared custom Memory Lane content yet.',
            'cta' => 'Configure Memory Lane Kit',
        ],
        'chapters' => [
            [
                'id' => 'first-hello',
                'chapterLabel' => 'Chapter 1',
                'title' => 'How Our Story Began',
                'dateLabel' => '17 January 2021',
                'intro' => 'There was a warm spark the first time you greeted me. We were both shy, yet quietly curious.',
                'story' => 'We were still strangers, but our conversation felt like something I had longed for. Your smile made my heart race, and from that day I began collecting every little detail about you.',
                'highlights' => [
                    [
                        'title' => 'First Location',
                        'description' => 'A tiny coffee shop in the corner of town where dim lights and indie songs witnessed our heartbeat.',
                    ],
                    [
                        'title' => 'Funny Moment',
                        'description' => 'You mispronounced my name, and I took it as the universe hinting that we’d grow closer.',
                    ],
                ],
                'quote' => [
                    'text' => 'I never imagined that short greeting would become the doorway to my coziest home.',
                ],
                'theme' => [
                    'gradient' => 'linear-gradient(135deg, #ffe4e6 0%, #fdf2f8 45%, #fce7f3 100%)',
                    'accent' => '#ec4899',
                    'text' => '#1f2937',
                    'soft' => 'rgba(236, 72, 153, 0.12)',
                ],
                'decorations' => ['hearts', 'sparkles'],
            ],
            [
                'id' => 'first-date',
                'chapterLabel' => 'Chapter 2',
                'title' => 'Our First Date',
                'dateLabel' => '5 February 2021',
                'intro' => 'We decided to meet again. This time it wasn’t a coincidence—it was a choice.',
                'story' => 'I still remember you choosing a pastel outfit that made your aura even softer. We walked hand in hand, talked without pause, and shared stories no one else knew about us.',
                'highlights' => [
                    [
                        'title' => 'Road Playlist',
                        'description' => 'The R&B tracks you picked became a mix of our racing hearts and our laughter.',
                    ],
                    [
                        'title' => 'Little Promise',
                        'description' => 'We promised to text each other before bed. Since then, there’s never been a night without “good night”.',
                    ],
                ],
                'quote' => [
                    'text' => 'I can still remember the scent you wore that day.',
                ],
                'theme' => [
                    'gradient' => 'linear-gradient(120deg, #fbcfe8 10%, #fdf4ff 60%, #e0f2fe 100%)',
                    'accent' => '#a855f7',
                    'text' => '#1e293b',
                    'soft' => 'rgba(168, 85, 247, 0.12)',
                ],
                'decorations' => ['sparkles', 'stars'],
            ],
            [
                'id' => 'storms',
                'chapterLabel' => 'Chapter 3',
                'title' => 'Weathering the Storm Together',
                'dateLabel' => '2022 - 2023',
                'intro' => 'We disagreed, went silent for a while, yet eventually sat down to listen.',
                'story' => 'Some nights I was scared of losing you. But you stayed, taught me to choose softer words, and you learned to soften your ego. We’re not perfect, yet we always find our way home.',
                'highlights' => [
                    [
                        'title' => 'Comforting Hug',
                        'description' => 'After every debate, you pulled me close and said, “we’re not enemies.”',
                    ],
                    [
                        'title' => 'Quiet Prayer',
                        'description' => 'I know you silently asked God to protect our relationship. It touched me deeply.',
                    ],
                ],
                'quote' => [
                    'text' => 'If I could choose again, I’d still choose to grow with you.',
                ],
                'theme' => [
                    'gradient' => 'linear-gradient(125deg, #ede9fe 0%, #cffafe 55%, #f0f9ff 100%)',
                    'accent' => '#0ea5e9',
                    'text' => '#0f172a',
                    'soft' => 'rgba(14, 165, 233, 0.12)',
                ],
                'decorations' => ['stars', 'petals'],
            ],
            [
                'id' => 'daily-joy',
                'chapterLabel' => 'Chapter 4',
                'title' => 'Little Habits, Big Love',
                'dateLabel' => '2023 - Today',
                'intro' => 'Our routines may be simple, yet that’s where I feel truly loved and loving.',
                'story' => 'We cook while calling each other, send random photos, and share tiny stories that always make the day feel full. You built a home inside my life.',
                'highlights' => [
                    [
                        'title' => 'Sweet Notes',
                        'description' => 'The post-it on my laptop saying “You’ve got this!” is still here today.',
                    ],
                    [
                        'title' => 'Gadget Time Capsule',
                        'description' => 'Our chat history feels like a small museum filled with the best versions of us.',
                    ],
                ],
                'quote' => [
                    'text' => 'Thank you for making every day worth looking forward to.',
                ],
                'theme' => [
                    'gradient' => 'linear-gradient(140deg, #dcfce7 0%, #fef9c3 60%, #ffedd5 100%)',
                    'accent' => '#22c55e',
                    'text' => '#1f2937',
                    'soft' => 'rgba(34, 197, 94, 0.14)',
                ],
                'decorations' => ['petals', 'hearts'],
            ],
            [
                'id' => 'future',
                'chapterLabel' => 'Chapter 5',
                'title' => 'Our Tomorrow',
                'dateLabel' => 'Forever',
                'intro' => 'I made this page today to remind you how serious I am about our journey.',
                'story' => 'I want to keep writing with you—celebrating your birthday, our anniversary, and everyday moments that become extraordinary. Let’s build a home filled with warm light and laughter.',
                'highlights' => [
                    [
                        'title' => 'Shared Dreams',
                        'description' => 'Return to the city where we first met, take spontaneous staycations, and keep learning new things together.',
                    ],
                    [
                        'title' => 'Pure Commitment',
                        'description' => 'We’ll stay a team: looking out for each other, reminding each other, and always being a place to come home to.',
                    ],
                ],
                'quote' => [
                    'text' => 'Happy birthday, love. This is only the first chapter of many beautiful pages we will write together.',
                ],
                'theme' => [
                    'gradient' => 'linear-gradient(135deg, #fef2f2 5%, #fce7f3 40%, #ede9fe 100%)',
                    'accent' => '#f97316',
                    'text' => '#1f2937',
                    'soft' => 'rgba(249, 115, 22, 0.15)',
                ],
                'decorations' => ['hearts', 'sparkles'],
            ],
        ],
    ],
];
