<?php

return [
    'meta' => [
        'index' => 'Timeline Kenangan',
        'create' => 'Tambah Kenangan',
        'edit' => 'Ubah Kenangan',
    ],
    'flash' => [
        'created' => 'Timeline berhasil ditambahkan!',
        'updated' => 'Timeline berhasil diperbarui!',
        'deleted' => 'Momen berhasil dihapus.',
    ],
    'create' => [
        'heading' => [
            'title' => 'Tambah Momen Spesial',
            'subtitle' => 'Catat kenangan berharga untuk ruang :space.',
        ],
        'form' => [
            'title' => [
                'label' => 'Judul Momen',
                'placeholder' => 'Contoh: Dinner anniversary pertama',
            ],
            'date' => [
                'label' => 'Tanggal',
            ],
            'description' => [
                'label' => 'Deskripsi',
                'placeholder' => 'Ceritakan kisah di balik momen ini…',
            ],
            'media' => [
                'label' => 'Foto',
                'helper' => 'Unggah maksimal :count foto. Setiap gambar akan otomatis dioptimalkan ke format .webp.',
                'button' => 'Pilih foto',
                'empty' => 'Belum ada foto yang dipilih.',
                'preview_label' => 'Pratinjau',
            ],
            'actions' => [
                'cancel' => 'Batal',
                'submit' => 'Simpan kenangan',
                'submitting' => 'Menyimpan…',
            ],
        ],
    ],
    'edit' => [
        'heading' => [
            'title' => 'Ubah Kenangan',
            'subtitle' => 'Perbarui detail momen spesial ini.',
            'submit' => 'Perbarui kenangan',
            'submitting' => 'Memperbarui…',
            'media_label' => 'Tambah foto',
            'media_button' => 'Tambah foto',
        ],
    ],
];
