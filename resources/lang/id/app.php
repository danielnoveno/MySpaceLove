<?php

return [
    'common' => [
        'actions' => [
            'save' => 'Simpan',
            'cancel' => 'Batal',
            'edit' => 'Edit',
            'delete' => 'Hapus',
            'close' => 'Tutup',
            'confirm' => 'Konfirmasi',
            'view_all' => 'Lihat semua',
            'clear' => 'Bersihkan',
            'search' => 'Cari',
            'regenerate' => 'Generate ulang',
            'send_email' => 'Kirim ke Email',
            'add' => 'Tambah',
            'update' => 'Perbarui',
            'back' => 'Kembali',
            'connect' => 'Hubungkan',
            'understand' => 'Mengerti',
        ],
        'states' => [
            'locked' => 'Terkunci',
            'empty' => 'Belum ada data.',
        ],
    ],
    'layout' => [
        'navigation' => [
            'dashboard' => 'Dashboard',
            'timeline' => 'Timeline',
            'daily_messages' => 'Daily Message',
            'gallery' => 'Galeri',
            'spotify' => 'Spotify Kit',
            'memory_lane' => 'Memory Lane Kit',
            'choose_space' => 'Pilih Space',
            'manage_spaces' => 'Kelola Spaces',
            'profile' => 'Profil',
            'logout' => 'Keluar',
            'locked_tooltip' => 'Fitur couple akan aktif setelah pasanganmu bergabung.',
            'owner_only_tooltip' => 'Hanya pemilik space yang dapat mengakses menu ini.',
            'mobile_title' => 'Navigasi',
        ],
        'user' => [
            'fallback_name' => 'User',
        ],
        'language' => [
            'label' => 'Bahasa',
            'options' => [
                'en' => 'Bahasa Inggris',
                'id' => 'Bahasa Indonesia',
            ],
        ],
    ],
    'dashboard' => [
        'meta' => [
            'title' => 'Dashboard - :space',
        ],
        'header' => [
            'subtitle' => 'Space kamu bersama pasangan',
        ],
        'modals' => [
            'daily_message' => [
                'title' => 'Pesan Cinta Hari Ini',
            ],
            'locked' => [
                'title' => 'Fitur Terkunci',
                'action' => 'Mengerti',
            ],
        ],
        'cards' => [
            'partner_pending' => [
                'title' => 'Pasangan belum terhubung',
                'description' => 'Ajak pasanganmu bergabung agar kalian bisa menikmati semua fitur berdua.',
                'cta' => 'Hubungkan Pasangan',
            ],
            'timeline_total' => 'Total Timeline',
            'gallery_total' => 'Foto & Video',
            'location_share' => [
                'title' => 'Berbagi Lokasi',
                'cta' => 'Buka Peta',
            ],
            'quick_actions' => [
                'title' => 'Aksi Cepat',
                'add_moment' => [
                    'label' => 'Tambah Momen',
                    'description' => 'Catat momen spesial',
                ],
                'upload_photo' => [
                    'label' => 'Upload Foto',
                    'description' => 'Simpan kenangan',
                ],
                'daily_message' => [
                    'label' => 'Pesan Harian',
                    'description' => 'Lihat pesan cinta',
                ],
                'memory_lane' => [
                    'label' => 'Memory Lane Kit',
                    'description' => 'Panduan surprise 3 tahap + storybook',
                ],
                'memory_lane_setup' => [
                    'label' => 'Atur Memory Lane',
                    'description' => 'Upload foto puzzle & pesan tiap level',
                ],
                'spotify' => [
                    'label' => 'Spotify Companion',
                    'description' => 'Sinkronisasi musik & mood jarak jauh',
                ],
                'journal' => [
                    'label' => 'Tulis Journal',
                    'description' => 'Ekspresikan perasaan',
                ],
                'nobar' => [
                    'label' => 'Masuk Nobar',
                    'description' => 'Mulai nonton bareng',
                ],
            ],
            'upcoming_events' => [
                'title' => 'Event Mendatang',
                'empty' => 'Belum ada event yang dijadwalkan. Yuk buat countdown pertama kalian!',
                'days_left' => ':count hari lagi',
                'view_all' => 'Lihat Semua',
            ],
            'recent_messages' => [
                'title' => 'Pesan Terbaru',
                'empty' => 'Belum ada pesan terbaru. Coba tulis pesan spesial untuk pasanganmu!',
                'show_more' => 'Baca selengkapnya',
                'show_less' => 'Sembunyikan',
                'view_all' => 'Lihat Semua',
            ],
        ],
        'locks' => [
            'requires_partner' => 'Hubungkan pasanganmu terlebih dahulu untuk membuka fitur ini.',
            'requires_owner' => 'Hanya pemilik space yang dapat mengatur fitur ini.',
            'owner_badge' => 'Khusus pemilik',
        ],
    ],
    'spaces' => [
        'meta' => [
            'title' => 'Spaces',
        ],
        'header' => [
            'title' => 'Kelola Spaces',
            'subtitle' => 'Buat, gabung, dan kelola space couple kalian.',
        ],
    ],
    'daily_messages' => [
        'meta' => [
            'title' => 'Daily Messages',
        ],
        'header' => 'Daily Message',
        'title' => 'Pesan Harian Kita 💌',
        'actions' => [
            'search' => 'Cari Pesan',
            'add_manual' => '+ Tambah Manual',
            'regenerate_ai' => 'Regenerate AI',
            'send_email' => 'Kirim ke Email',
        ],
        'empty' => 'Belum ada pesan harian. AI akan generate otomatis! ✨',
        'modal' => [
            'title' => 'Cari Pesan Harian',
            'keyword' => 'Kata Kunci',
            'date' => 'Tanggal (YYYY-MM-DD)',
        ],
        'expand' => [
            'more' => 'Baca selengkapnya',
            'less' => 'Baca lebih sedikit',
        ],
        'feedback' => [
            'email_sent' => 'Pesan harian berhasil dikirim ke email pasanganmu! 💌',
            'email_failed' => 'Email tidak dapat dikirim. Coba lagi ya.',
            'email_partner_missing' => 'Pastikan pasanganmu sudah terhubung dan memiliki email sebelum mengirim.',
        ],
    ],
    'emails' => [
        'daily_message' => [
            'subject' => ':sender mengirim pesan harian untuk :partner (:date)',
            'heading' => 'Ada pesan manis untukmu 💌',
            'greeting' => 'Hai :partner,',
            'intro' => ':sender mengirim pesan harian hari ini dari space ":space".',
            'date_label' => 'Tanggal',
            'message_label' => 'Pesan',
            'signature' => 'Dengan cinta, :sender',
            'outro' => 'Dikirim penuh kasih oleh :appName',
            'sender_fallback' => 'Seseorang spesial',
            'partner_fallback' => 'kamu',
            'date_format' => 'd F Y',
        ],
        'nobar_schedule' => [
            'subject' => 'Pengingat Nobar: :title',
            'heading' => 'Nobar akan dimulai 🍿',
            'greeting' => 'Hai :recipient,',
            'intro' => ':creator baru saja menjadwalkan nobar di space ":space".',
            'schedule_label' => 'Jadwal',
            'details_label' => 'Catatan',
            'cta' => 'Buka Ruang Nobar',
            'footer' => 'Dikirim penuh kasih oleh :appName',
            'creator_fallback' => 'Seseorang spesial',
            'recipient_fallback' => 'teman baik',
            'time_format' => 'd F Y H.i T',
        ],
    ],
];
