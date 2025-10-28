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
    'auth' => [
        'layout' => [
            'badge' => 'Didesain untuk pasangan yang ingin tetap dekat',
            'title' => 'Buat scrapbook perjalanan cinta kalian secara hidup.',
            'subtitle' => 'MySpaceLove menyatukan ritual, kejutan, dan check-in harian dalam satu ruang hangat.',
            'features' => [
                'Bagikan hitung mundur, playlist, jurnal, dan galeri tanpa ribet.',
                'Rencanakan kejutan manis dengan panduan Memory Lane Kit.',
                'Tetap terhubung lewat pengingat harian dan pembaruan real-time.',
            ],
            'footer' => 'Digemari pasangan LDR maupun yang tinggal bersama.',
        ],
        'common' => [
            'email' => 'Email',
            'password' => 'Kata sandi',
            'name' => 'Nama lengkap',
            'confirm_password' => 'Konfirmasi kata sandi',
            'remember_me' => 'Ingat saya',
            'google' => 'Lanjut dengan Google',
            'separator' => 'Masuk dengan email',
        ],
        'login' => [
            'meta_title' => 'Masuk',
            'title' => 'Selamat datang kembali',
            'subtitle' => 'Lanjutkan cerita dan jaga percikan rasa sayang kalian.',
            'submit' => 'Masuk',
            'forgot_password' => 'Lupa kata sandi?',
            'google' => 'Masuk dengan Google',
            'register_prompt' => [
                'text' => 'Belum punya akun?',
                'cta' => 'Daftar sekarang',
            ],
            'hero' => [
                'badge' => 'Terhubung setiap hari',
                'title' => 'Hidupkan lagi cerita cinta kalian secara online.',
                'subtitle' => 'Masuk untuk sinkron momen, hitung mundur, dan ritual manis.',
                'features' => [
                    'Akses dashboard pribadi berisi memori dan pesan cinta.',
                    'Tulis jurnal berdua dan pantau setiap milestone.',
                    'Bagikan playlist, galeri, dan kejutan dalam satu ruang.',
                ],
            ],
        ],
        'register' => [
            'meta_title' => 'Buat akun',
            'title' => 'Buat space kalian',
            'subtitle' => 'Mulai ruang bersama untuk semua momen kecil yang berarti.',
            'submit' => 'Buat akun',
            'google' => 'Daftar dengan Google',
            'login_prompt' => [
                'text' => 'Sudah punya akun?',
                'cta' => 'Masuk',
            ],
            'hero' => [
                'badge' => 'Mulai perjalanan baru',
                'title' => 'Bangun space yang tumbuh bersama hubungan kalian.',
                'subtitle' => 'Ajak pasangan, susun kejutan, dan rayakan setiap pencapaian.',
                'features' => [
                    'Personalisasi dashboard couple hanya dalam beberapa menit.',
                    'Hubungkan playlist, hitung mundur, dan jurnal cinta.',
                    'Nikmati kit kejutan dan ritual jarak jauh yang terarah.',
                ],
            ],
        ],
        'profile' => [
            'badge' => 'Pengaturan',
            'title' => 'Profil & keamanan',
            'subtitle' => 'Atur tampilanmu di space bersama dan jaga semuanya tetap aman.',
            'sections' => [
                'information' => [
                    'title' => 'Informasi profil',
                    'description' => 'Perbarui nama dan email yang tampil di seluruh pengalaman bersama.',
                    'fields' => [
                        'name' => 'Nama tampil',
                        'email' => 'Alamat email',
                    ],
                    'verification' => [
                        'notice' => 'Alamat email kamu belum terverifikasi.',
                        'action' => 'Kirim ulang email verifikasi.',
                        'sent' => 'Link verifikasi baru sudah kami kirim ke inbox kamu.',
                    ],
                    'actions' => [
                        'save' => 'Simpan perubahan',
                        'saved' => 'Tersimpan!',
                    ],
                ],
                'password' => [
                    'title' => 'Perbarui kata sandi',
                    'description' => 'Lindungi space kalian dengan kata sandi yang kuat dan unik.',
                    'fields' => [
                        'current' => 'Kata sandi saat ini',
                        'new' => 'Kata sandi baru',
                        'confirm' => 'Konfirmasi kata sandi baru',
                    ],
                    'actions' => [
                        'save' => 'Perbarui kata sandi',
                        'saved' => 'Kata sandi berhasil diperbarui!',
                    ],
                ],
                'delete' => [
                    'title' => 'Hapus akun',
                    'description' => 'Tindakan ini akan menghapus permanen semua data di MySpaceLove. Unduh data penting terlebih dahulu.',
                    'cta' => 'Hapus akun',
                    'modal' => [
                        'title' => 'Yakin ingin menghapus akun?',
                        'description' => 'Tindakan ini tidak bisa dibatalkan. Masukkan kata sandi untuk mengonfirmasi penghapusan permanen.',
                        'password_placeholder' => 'Kata sandi',
                        'cancel' => 'Batal',
                        'confirm' => 'Ya, hapus akun',
                    ],
                ],
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
