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
            'refresh' => 'Muat ulang',
        ],
        'states' => [
            'locked' => 'Terkunci',
            'empty' => 'Belum ada data.',
        ],
    ],
    'uploads' => [
        'errors' => [
            'generic_file_too_large' => 'File yang diunggah melebihi 10 MB. Silakan kompres atau pilih file lain.',
            'generic_file_save_failed' => 'File tidak dapat disimpan. Silakan coba lagi.',
            'image_conversion_failed' => 'Gambar tidak dapat diproses. Unggah file JPG atau PNG dengan ukuran di bawah 10 MB.',
            'memory_lane_image_too_large' => 'Gambar untuk Memory Lane Kit maksimal 10 MB per file.',
            'timeline_media_too_large' => 'Ukuran file terlalu besar. Maksimal 10 MB untuk foto kenangan dan momen spesial.',
            'event_poster_too_large' => 'Ukuran poster event terlalu besar. Maksimal 10 MB.',
            'profile_image_too_large' => 'Foto profil terlalu besar. Maksimal 10 MB dan akan dikonversi ke .webp.',
        ],
        'success' => [
            'memory_lane_saved' => 'Konfigurasi Memory Lane berhasil disimpan.',
        ],
    ],
    'memory_lane' => [
        'flash' => [
            'saved' => 'Konfigurasi Memory Lane berhasil disimpan.',
            'pin_updated' => 'PIN Memory Lane berhasil diperbarui.',
        ],
        'validation' => [
            'pin_invalid' => 'PIN yang kamu masukkan salah.',
        ],
        'editor' => [
            'meta_title' => 'Memory Lane Kit',
            'title' => 'Konfigurasi Memory Lane Kit',
            'description' => 'Sesuaikan kejutan setiap level puzzle di :spaceTitle agar setiap momen terasa personal.',
            'access' => [
                'title' => 'Pengaturan akses',
                'description' => 'Atur PIN untuk melindungi Memory Lane Kit. Kosongkan jika semua orang dengan tautan boleh menikmatinya.',
                'pin_label' => 'PIN akses (kosongkan jika tanpa PIN)',
                'pin_placeholder' => 'Contoh: 1234',
                'empty_notice' => 'Konten Memory Lane Kit belum diatur. Pengunjung tidak akan melihat apa pun sampai kamu mengisi minimal satu level.',
            ],
            'level' => [
                'badge' => 'Level :number',
                'preview_alt' => 'Pratinjau gambar level :number',
                'empty_image' => 'Belum ada gambar',
                'upload' => 'Pilih gambar',
                'reset' => 'Gunakan gambar default',
                'title_label' => 'Judul pesan setelah level',
                'title_placeholder' => 'Contoh: Misi selesai!',
                'body_label' => 'Isi pesan',
                'body_placeholder' => 'Tulis cerita atau afirmasi setelah level ini selesai.',
            ],
            'actions' => [
                'submit' => 'Simpan konfigurasi',
                'saving' => 'Menyimpan…',
            ],
        ],
    ],
    'storybook' => [
        'page_label' => 'Halaman :number',
        'progress_template' => ':current dari :total',
        'actions' => [
            'start' => 'Buka scrapbook',
            'previous' => 'Memori sebelumnya',
            'next' => 'Memori selanjutnya',
            'back' => 'Kembali ke sampul',
        ],
        'empty' => 'Belum ada memori di scrapbook. Atur Memory Lane Kit terlebih dahulu.',
        'manage' => 'Kelola Memory Lane Kit',
    ],
    'spotify' => [
        'auth' => [
            'state_missing' => 'State Spotify tidak ditemukan.',
            'state_invalid' => 'State Spotify tidak valid.',
            'session_invalid' => 'Sesi kamu tidak valid. Silakan masuk kembali.',
            'authorization_code_missing' => 'Kode otorisasi Spotify tidak ditemukan.',
            'exchange_failed' => 'Gagal menukar kode Spotify. Silakan coba lagi.',
            'success' => 'Spotify berhasil terhubung!',
            'token_missing' => 'Token Spotify tidak ditemukan. Silakan hubungkan ulang.',
        ],
        'music_space' => [
            'meta_title' => 'Ruang Musik Pasangan',
            'header' => [
                'title' => 'Ruang Musik Kita',
                'subtitle' => 'Hubungkan akun Spotify Premium kalian, cari lagu bersama, dan kurasi playlist berdua.',
            ],
            'tabs' => [
                'home' => 'Beranda',
                'search' => 'Cari',
                'playlist' => 'Playlist',
                'stats' => 'Statistik',
            ],
            'connect' => [
                'headline' => 'Hubungkan Spotify',
                'description' => 'Sambungkan akun Spotify kalian untuk memutar lagu bersama, berbagi playlist, dan melihat status live.',
                'connect_button' => 'Login dengan Spotify',
                'connected' => 'Terhubung sebagai :name',
                'partner_status' => 'Status koneksi pasangan',
                'partner_connected' => ':name terhubung',
                'partner_missing' => 'Menunggu pasangan terhubung',
            ],
            'player' => [
                'title' => 'Sedang diputar',
                'empty' => 'Belum ada lagu yang diputar. Buka Spotify di perangkat mana pun untuk melihat statusnya.',
                'play' => 'Putar',
                'pause' => 'Jeda',
                'next' => 'Berikutnya',
                'previous' => 'Sebelumnya',
                'cover_alt' => 'Sampul lagu yang sedang diputar',
            ],
            'search' => [
                'title' => 'Cari lagu',
                'placeholder' => 'Cari lagu, artis, atau album',
                'button' => 'Cari',
                'empty' => 'Lagu tidak ditemukan. Coba kata kunci lain.',
                'add' => 'Tambah ke playlist',
                'play' => 'Putar sekarang',
                'connect_required' => 'Hubungkan Spotify untuk mencari dan memutar lagu.',
            ],
            'playlist' => [
                'title' => 'Playlist bersama kita',
                'create_cta' => 'Buat playlist kita',
                'empty' => 'Buat playlist bersama untuk mulai mengumpulkan lagu.',
                'tracks_empty' => 'Tambahkan lagu dari tab pencarian agar playlist semakin penuh.',
                'remove' => 'Hapus',
                'default_name' => 'Playlist Cinta Kita',
                'default_description' => 'Lagu-lagu yang mengingatkan kita satu sama lain.',
                'open_in_spotify' => 'Buka di Spotify',
                'create_modal' => [
                    'title' => 'Buat playlist bersama',
                    'name_label' => 'Nama playlist',
                    'description_label' => 'Deskripsi (opsional)',
                    'submit' => 'Buat playlist',
                    'name_placeholder' => 'Contoh: Playlist Cinta Kita',
                    'description_placeholder' => 'Tuliskan suasana playlist ini.',
                ],
            ],
            'stats' => [
                'title' => 'Statistik musik kita',
                'top_tracks' => 'Lagu favorit kita',
                'top_artists' => 'Artis favorit kita',
                'top_tracks_empty' => 'Belum ada lagu favorit. Dengarkan Spotify bersama untuk melihat daftar ini.',
                'top_artists_empty' => 'Belum ada artis favorit. Nikmati musik bersama agar daftar terisi.',
                'compatibility' => 'Kecocokan musik',
                'compatibility_description' => 'Kecocokan :score% berdasarkan lagu dan artis favorit kalian.',
                'compatibility_empty' => 'Hubungkan kedua akun untuk menghitung kecocokan musik.',
            ],
            'compatibility' => [
                'details' => ':tracks lagu cocok · :artists artis cocok',
                'badge' => 'Kecocokan :score%',
            ],
            'errors' => [
                'summary_failed' => 'Data Spotify belum bisa dimuat. Coba hubungkan ulang lalu muat ulang halaman.',
                'connection_required' => 'Hubungkan akun Spotify kamu untuk melanjutkan.',
                'create_playlist_failed' => 'Playlist gagal dibuat. Silakan coba lagi.',
                'add_failed' => 'Tidak dapat menambahkan lagu saat ini. Coba beberapa saat lagi.',
                'remove_failed' => 'Tidak dapat menghapus lagu saat ini. Coba beberapa saat lagi.',
                'playback_failed' => 'Pemutaran gagal. Buka Spotify di salah satu perangkat lalu coba lagi.',
                'playlist_missing' => 'Buat playlist bersama terlebih dahulu sebelum menambahkan lagu.',
            ],
        ],
    ],
    'layout' => [
        'navigation' => [
            'dashboard' => 'Dashboard',
            'timeline' => 'Timeline',
            'daily_messages' => 'Daily Message',
            'gallery' => 'Galeri',
            'spotify' => 'Ruang Musik Pasangan',
            'notifications' => 'Notifikasi',
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
        'flash' => [
            'google_login_success' => 'Berhasil masuk dengan Google.',
            'space_joined' => 'Selamat! Kamu sudah terhubung dengan Space pasanganmu.',
            'space_welcome' => 'Selamat datang! Buat Space pertama atau gabung memakai kode pasanganmu.',
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
                    'label' => 'Ruang Musik Pasangan',
                    'description' => 'Bagikan lagu, playlist, dan pemutaran langsung',
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
        'flash' => [
            'created' => 'Space berhasil dibuat! Kamu bisa mengundang pasangan kapan saja.',
        ],
    ],
    'location' => [
        'update_success' => 'Lokasi berhasil diperbarui.',
        'forbidden' => 'Kamu tidak memiliki izin untuk melihat lokasi pasangan.',
        'stop_success' => 'Berhasil menghentikan berbagi lokasi.',
        'partner_missing' => 'Pasanganmu belum terhubung di MySpaceLove.',
        'share_success' => 'Link lokasi berhasil dikirim ke pasanganmu.',
    ],
    'notifications' => [
        'meta' => [
            'title' => 'Notifikasi aktivitas',
        ],
        'header' => [
            'title' => 'Pusat aktivitas',
            'subtitle' => 'Semua momen, pembaruan, dan undangan kalian tersimpan rapi di sini.',
        ],
        'actions' => [
            'mark_all_read' => 'Tandai semua sudah dibaca',
            'filter_all' => 'Semua',
            'filter_unread' => 'Belum dibaca',
            'mark_read' => 'Tandai sudah dibaca',
        ],
        'summary' => [
            'recent' => 'Aktivitas terbaru',
            'unread_count' => ':count notifikasi belum dibaca',
        ],
        'empty' => [
            'title' => 'Belum ada notifikasi',
            'body' => 'Setiap aktivitas di space kalian akan tampil di sini.',
        ],
        'view' => [
            'opened_at' => 'Dibuka :date',
        ],
        'flash' => [
            'marked' => 'Notifikasi ditandai sudah dibaca.',
            'marked_all' => 'Semua notifikasi ditandai sudah dibaca.',
        ],
        'mail' => [
            'greeting' => 'Hai :name,',
            'action' => 'Lihat aktivitas',
            'footer' => 'Terima kasih sudah tetap terhubung dengan MySpaceLove 💖',
        ],
        'events' => [
            'account_registered' => [
                'title' => 'Selamat datang di MySpaceLove, :name!',
                'body' => 'Akunmu siap dipakai. Ajak pasangan untuk mulai berbagi momen.',
            ],
            'location_shared_self' => [
                'title' => 'Kamu membagikan lokasi ke :partner',
                'body' => 'Link dan koordinatnya kami simpan supaya bisa kamu lihat kapan saja.',
            ],
            'location_shared_partner' => [
                'title' => ':name baru saja membagikan lokasinya untukmu',
                'body' => 'Buka link yang dikirim untuk melihat lokasi terbarunya.',
            ],
            'location_updated' => [
                'title' => 'Lokasi diperbarui',
                'body' => 'Koordinat terakhirmu sudah diperbarui di peta bersama.',
            ],
            'location_stopped' => [
                'title' => 'Berbagi lokasi dijeda',
                'body' => 'Kami menghentikan berbagi lokasi real-time ke pasanganmu.',
            ],
            'timeline_created' => [
                'title' => ':actor menambahkan momen baru ke timeline',
                'body' => '":title" siap dikenang bersama pada :date.',
                'action' => 'Buka timeline',
            ],
            'countdown_created' => [
                'title' => ':actor merencanakan event spesial baru',
                'body' => 'Countdown ":title" dijadwalkan pada :date. Siapkan kejutan terbaikmu!',
                'action' => 'Lihat countdown',
            ],
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
    'timeline' => [
        'validation' => [
            'max_media' => 'Maksimal 5 media per momen.',
        ],
        'flash' => [
            'created' => 'Momen timeline berhasil ditambahkan.',
            'updated' => 'Momen timeline berhasil diperbarui.',
        ],
    ],
    'docs' => [
        'flash' => [
            'uploaded' => 'Dokumen berhasil diunggah.',
            'updated' => 'Dokumen berhasil diperbarui.',
            'deleted' => 'Dokumen berhasil dihapus.',
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
