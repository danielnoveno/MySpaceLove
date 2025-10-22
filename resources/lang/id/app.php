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
            'choose_space' => 'Pilih Space',
            'manage_spaces' => 'Kelola Spaces',
            'profile' => 'Profil',
            'logout' => 'Keluar',
            'locked_tooltip' => 'Fitur couple akan aktif setelah pasanganmu bergabung.',
            'mobile_title' => 'Navigasi',
        ],
        'user' => [
            'fallback_name' => 'User',
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
    ],
];
