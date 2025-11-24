<?php

return [
    'meta' => [
        'config' => 'Memory Lane Kit',
        'storybook' => 'Storybook',
    ],
    'config' => [
        'heading' => [
            'title' => 'Memory Lane Kit',
            'subtitle' => 'Kurasi kejutan, ilustrasi, dan catatan manis untuk petualangan puzzle kalian.',
        ],
        'flash' => [
            'success' => 'Konfigurasi Memory Lane berhasil disimpan.',
            'error' => 'Terjadi kesalahan saat menyimpan konfigurasi Memory Lane.',
        ],
        'access' => [
            'title' => 'PIN Akses',
            'description' => 'Lindungi kejutan Memory Lane dengan PIN opsional. Kosongkan jika ingin pasangan langsung masuk.',
            'pin_label' => 'PIN akses (kosongkan untuk menonaktifkan)',
            'pin_placeholder' => 'Contoh: 1234',
            'pin_helper' => '4-10 karakter. Bagikan hanya kepada orang yang boleh melihat kejutan ini.',
            'empty_notice' => 'Konten Memory Lane Kit belum diatur. Pengunjung akan melihat keadaan kosong sampai kamu mengisi minimal satu level.',
            'pin_invalid' => 'PIN yang kamu masukkan tidak sesuai.',
        ],
        'levels' => [
            'title' => 'Level kejutan',
            'description' => 'Perbarui gambar dan kalimat manis di setiap tahap kejutan. Gambar akan otomatis dioptimalkan ke format .webp.',
            'image_helper' => 'Tarik & lepas atau pilih gambar (maks. 10 MB, JPG/PNG otomatis dikonversi ke .webp).',
            'reset' => 'Gunakan gambar default',
            'remove' => 'Hapus gambar',
            'change' => 'Ganti gambar',
            'empty_image' => 'Belum ada gambar',
            'fields' => [
                'title' => 'Judul',
                'body' => 'Cerita singkat',
            ],
        ],
        'actions' => [
            'save' => 'Simpan perubahan',
            'saving' => 'Menyimpan…',
            'reset' => 'Atur ulang',
        ],
    ],
    'storybook' => [
        'hero' => [
            'title' => 'Storybook Kenangan Kita',
            'subtitle' => 'Balik tiap halaman kenangan dari Memory Lane Kit.',
            'cta' => 'Mulai membuka',
        ],
        'empty' => [
            'title' => 'Belum ada halaman scrapbook',
            'body' => 'Tambahkan foto dan catatan di Memory Lane Kit agar muncul di storybook ini.',
        ],
        'player' => [
            'next' => 'Halaman berikutnya',
            'previous' => 'Halaman sebelumnya',
        ],
    ],
];
