<?php

return [
    'memory_lane' => [
        'defaults' => [
            'spaceTitle' => 'kita',
        ],
        'headTitle' => 'Memory Lane Kit',
        'secretGate' => [
            'code' => '160825',
            'accessLabel' => 'Akses Terbatas',
            'title' => 'Masukkan Tanggal Jadian Kita',
            'description' => 'Khusus yang ingat tanggal spesial (format DDMMYY).',
            'placeholder' => 'Contoh: 160825',
            'buttonLabel' => 'Buka Kit',
            'errorMessage' => 'Kode salah. Coba ingat lagi tanggal spesial kita.',
            'inputLabel' => 'Secret Code',
        ],
        'puzzle' => [
            'grid' => [
                'rows' => 4,
                'cols' => 4,
            ],
            'pretitle' => 'Mini game',
            'title' => 'Susun puzzle Memory Lane',
            'description' => 'Sebelum lanjut ke kit ruang :spaceTitle, selesaikan puzzle :cols×:rows ini dulu.',
            'solvedTitle' => 'Yes! Puzzle :spaceTitle selesai',
            'solvedDescription' => 'Sekarang kamu bisa lanjut menikmati tiap tahap Memory Lane Kit.',
            'dragLabel' => 'Seret potongan ke slot yang pas.',
            'movesLabel' => 'Langkah',
            'resetLabel' => 'Acak ulang kepingan',
            'levels' => [
                [
                    'id' => 'flashback',
                    'label' => 'Level 1 — Flashback',
                    'image' => '/images/puzzle/defaultimage.png',
                    'summaryTitle' => 'Flashback hangat',
                    'summaryBody' => 'Mantap! Ceritain ulang kenangan di foto ini: apa yang terjadi, perasaanmu waktu itu, dan kenapa momen ini spesial buat kalian.',
                ],
                [
                    'id' => 'affirmation',
                    'label' => 'Level 2 — Affirmation',
                    'image' => '/images/puzzle/defaultimage.png',
                    'summaryTitle' => 'Ucapan apresiasi',
                    'summaryBody' => 'Tulis ucapan selamat atau apresiasi singkat untuk pasanganmu. Ceritakan hal kecil apa yang bikin kamu bersyukur hari ini.',
                ],
                [
                    'id' => 'memory',
                    'label' => 'Level 3 — Memory Capsule',
                    'image' => '/images/puzzle/defaultimage.png',
                    'summaryTitle' => 'Memo kenangan',
                    'summaryBody' => 'Tinggalkan memo, janji kecil, atau rencana seru untuk ke depan. Kamu baru saja melengkapi potongan terakhir Memory Lane hari ini.',
                ],
            ],
        ],
        'intro' => [
            'tagline' => 'Surprise kit ruang :spaceTitle',
            'title' => 'Memory Lane Kit',
            'description' => 'Ada tiga tahap mini buat kamu siapin sebelum pasangan buka hadiah utama. Bisa dipakai untuk ulang tahun, anniversary, atau cuma mau bikin hari biasa jadi spesial.',
            'stepsHeading' => 'Step by step',
            'tokensHeading' => 'Token kejutan',
            'challengeLabel' => 'Tantangan:',
            'closing' => [
                'description' => 'Selesai kit ini, buka menu Surprise Story buat kirim hadiah cerita ulang tahun ruang :spaceTitle. Bagikan link ini biar pasanganmu dapet kejutan ganda.',
                'story' => [
                    'title' => 'Surprise Story',
                    'description' => 'Hadiahkan cerita ulang tahun lengkap untuk pasanganmu.',
                    'button' => 'Buka Storybook',
                ],
                'footnote' => 'Rahasiain kode 160825 ya, cuma kita yang tahu!',
            ],
        ],
        'steps' => [
            [
                'id' => 'reminisce',
                'title' => 'Flashback Hangat',
                'prompt' => 'Buka galeri dan pilih tiga foto favorit kita. Ceritain kenapa foto-foto itu paling berkesan.',
                'action' => 'Siapkan satu kalimat penutup napas untuk tiap foto.',
            ],
            [
                'id' => 'gratitude',
                'title' => 'List Terima Kasih',
                'prompt' => 'Tulis lima hal yang membuatmu bersyukur tentang hubungan ini minggu ini.',
                'action' => 'Selipkan sticky note ke dompet/tas pasanganmu besok.',
            ],
            [
                'id' => 'future',
                'title' => 'Dream Date',
                'prompt' => 'Bayangin satu aktivitas impian bareng. Nggak harus mewah—yang penting versi kita.',
                'action' => 'Kirim voice note lucu malam nanti berisi undangan date itu.',
            ],
        ],
        'tokens' => [
            [
                'label' => 'Mini Puzzle',
                'detail' => 'Sembunyikan petunjuk kecil di tiga tempat rumah.',
                'accent' => 'bg-pink-200/60 text-pink-700',
            ],
            [
                'label' => 'Playlist Rahasia',
                'detail' => 'Buat 4 lagu dengan catatan kenapa kamu pilih lagu itu.',
                'accent' => 'bg-purple-200/60 text-purple-700',
            ],
            [
                'label' => 'Comfort Food',
                'detail' => 'Pesan makanan favoritnya dan tempelkan pesan singkat.',
                'accent' => 'bg-emerald-200/60 text-emerald-700',
            ],
        ],
    ],
    'story_book' => [
        'defaults' => [
            'spaceTitle' => 'My Favorite Person',
        ],
        'headTitle' => 'Cerita Ulang Tahun',
        'secretGate' => [
            'enabled' => false,
            'code' => '160825',
            'accessLabel' => 'Akses Terbatas',
            'title' => 'Masukkan Tanggal Jadian Kita',
            'description' => 'Tanggal spesial (format DDMMYY) buat buka hadiah ini.',
            'placeholder' => 'Contoh: 160825',
            'buttonLabel' => 'Buka Cerita',
            'errorMessage' => 'Kode salah. Coba ingat lagi tanggal spesial kalian.',
            'inputLabel' => 'Secret Code',
        ],
        'hero' => [
            'tagline' => 'Halaman rahasia untukmu',
            'title' => 'Happy Birthday, :spaceTitle',
            'description' => 'Kubuat buku digital ini supaya kamu bisa lagi flashback ke setiap bab perjalanan kita. Baca pelan-pelan aja, tekan tombol berikutnya kalau ingin lanjut ke halaman selanjutnya. Semoga bikin kamu senyum lagi hari ini.',
        ],
        'flipbook' => [
            'empty' => 'Belum ada cerita untuk ditampilkan.',
            'narratorLabel' => 'Narablog cinta',
            'progressSuffix' => 'selesai',
            'messageLabel' => 'Pesan untukmu',
            'previous' => 'Sebelumnya',
            'next' => 'Berikutnya',
            'finish' => 'Selesai',
            'dateFallback' => 'Memori spesial',
        ],
        'footer' => [
            'reminder' => 'Kalau kamu mau nambahin cerita baru, tinggal kabarin aku ya. Kita bisa update bareng lagi kapan saja.',
            'finishMessage' => 'Terima kasih sudah jadi rumah ternyaman. Aku cinta kamu every single day.',
            'nextButton' => 'Next',
        ],
        'scrapbook' => [
            'title' => 'Digital scrapbook',
            'subtitle' => 'Setiap misi Memory Lane berubah jadi kartu kenangan yang bisa kamu buka kapan saja.',
            'empty' => 'Kalian belum menyiapkan konten Memory Lane khusus.',
            'cta' => 'Atur Memory Lane Kit',
        ],
        'chapters' => [
            [
                'id' => 'first-hello',
                'chapterLabel' => 'Bab 1',
                'title' => 'Awal Cerita Kita',
                'dateLabel' => '17 Januari 2021',
                'intro' => 'Ada percikan hangat yang muncul saat pertama kali kamu sapaku. Kita sama-sama malu, tapi diam-diam penasaran.',
                'story' => 'Waktu itu kita masih asing, tapi percakapan kita terasa seperti sesuatu yang sudah lama dirindukan. Senyummu bikin jantungku deg-degan dan sejak hari itu aku mulai mengumpulkan setiap detail tentangmu.',
                'highlights' => [
                    [
                        'title' => 'Lokasi Pertama',
                        'description' => 'Coffee shop kecil di pojok kota, tempat lampu temaram dan lagu indie jadi saksi degup jantung kita.',
                    ],
                    [
                        'title' => 'Momen Lucu',
                        'description' => 'Kamu salah sebut namaku, tapi aku malah merasa itu cara semesta ngasih kode kalau kita bakal dekat.',
                    ],
                ],
                'quote' => [
                    'text' => 'Aku nggak nyangka, sapa singkat itu bakal jadi awal rumah ternyaman.',
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
                'chapterLabel' => 'Bab 2',
                'title' => 'Kencan Pertama',
                'dateLabel' => '5 Februari 2021',
                'intro' => 'Kita memantapkan langkah untuk ketemu lagi. Kali ini bukan kebetulan, tapi keputusan.',
                'story' => 'Aku masih ingat kamu pilih baju warna pastel yang bikin auramu makin lembut. Kita jalan sambil pegang tangan, ngobrol tanpa jeda, dan berbagi hal-hal yang orang lain nggak tahu tentang kita.',
                'highlights' => [
                    [
                        'title' => 'Playlist Jalan',
                        'description' => 'Nada-nada RnB yang kamu pilih jadi campuran antara degup jantung dan suara tawa kita.',
                    ],
                    [
                        'title' => 'Janji Kecil',
                        'description' => 'Kita sepakat bakal saling kabarin sebelum tidur. Sejak itu nggak pernah ada malam tanpa "selamat tidur".',
                    ],
                ],
                'quote' => [
                    'text' => 'Ingatan tentang harummu di hari itu masih nempel sampai sekarang.',
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
                'chapterLabel' => 'Bab 3',
                'title' => 'Lewat Hujan Sama-Sama',
                'dateLabel' => '2022 - 2023',
                'intro' => 'Kita sempat beda pendapat, sempat diam-diaman, tapi akhirnya kita saling duduk dan belajar mendengar.',
                'story' => 'Ada malam-malam ketika aku takut kehilanganmu. Tapi kamu tetap bertahan, ngajarin aku cara milih kata yang lebih lembut, dan kamu juga belajar ngerem ego. Kita nggak sempurna, tapi kita selalu kembali pulang.',
                'highlights' => [
                    [
                        'title' => 'Pelukan Penguat',
                        'description' => 'Setiap habis debat, akhirnya kamu menarikku dan bilang, "kita bukan musuh".',
                    ],
                    [
                        'title' => 'Doa Diam-Diam',
                        'description' => 'Aku tahu kamu juga diam-diam minta ke Tuhan buat jaga hubungan ini. Aku tersentuh banget.',
                    ],
                ],
                'quote' => [
                    'text' => 'Kalau boleh milih ulang, aku tetap pilih berproses denganmu.',
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
                'chapterLabel' => 'Bab 4',
                'title' => 'Kebiasaan Kecil yang Besar',
                'dateLabel' => '2023 - Sekarang',
                'intro' => 'Rutinitas kita mungkin sederhana, tapi di sanalah aku merasa benar-benar dicintai dan mencintai.',
                'story' => 'Kita punya ritual telepon sambil masak, kirim foto random, dan berbagi cerita sepele yang selalu bikin hari terasa penuh. Kamu bikin rumah di dalam hidupku.',
                'highlights' => [
                    [
                        'title' => 'Catatan Manis',
                        'description' => 'Post-it di laptopku bertuliskan "Semangat ya, kamu hebat!" masih aku simpan sampai sekarang.',
                    ],
                    [
                        'title' => 'Gadget Time Capsule',
                        'description' => 'Chat kita selama ini kayak museum kecil yang penuh sama versi terbaik kita.',
                    ],
                ],
                'quote' => [
                    'text' => 'Terima kasih udah bikin tiap hari jadi sesuatu yang pantas ditunggu.',
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
                'chapterLabel' => 'Bab 5',
                'title' => 'Tentang Masa Depan Kita',
                'dateLabel' => 'Seterusnya',
                'intro' => 'Hari ini aku bikin halaman ini buat ngingetin kamu kalau aku serius sama perjalanan kita.',
                'story' => 'Aku mau terus nulis cerita denganmu, ngerayain ulang tahun kamu, ulang tahun kita, dan hari-hari biasa yang jadi luar biasa. Kita bikin rumah yang temaramnya hangat dan penuh tawa.',
                'highlights' => [
                    [
                        'title' => 'Mimpi Berdua',
                        'description' => 'Balikin kota tempat kita pertama ketemu, staycation dadakan, dan belajar hal-hal baru bareng.',
                    ],
                    [
                        'title' => 'Komitmen Murni',
                        'description' => 'Kita terus jadi tim: saling jaga, saling ingetin, dan saling jadi tempat pulang.',
                    ],
                ],
                'quote' => [
                    'text' => 'Selamat ulang tahun, sayang. Ini baru bab pertama dari banyak halaman cantik yang akan kita tulis bareng.',
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
