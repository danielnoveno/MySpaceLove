<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Undangan Space Baru</title>
</head>
<body style="margin: 0; font-family: 'Figtree', 'Inter', Arial, sans-serif; background-color: #f9fafb; color: #0f172a;">
    <div style="max-width: 640px; margin: 0 auto; padding: 40px 24px;">
        <header style="margin-bottom: 20px;">
            <p style="margin: 0; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; color: #0ea5e9;">
                Undangan Space Baru
            </p>
            <h1 style="margin: 10px 0 0; font-size: 24px; font-weight: 700; color: #ec4899;">
                Hai {{ $invitee->name ?? 'LoveSpace Partner' }},
            </h1>
        </header>

        <p style="margin: 0 0 18px; font-size: 15px; line-height: 1.7;">
            {{ $inviter->name }} mengundangmu ke Space <strong>“{{ $space->title }}”</strong> di {{ $appName }}.
        </p>

        <p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #db2777; text-transform: uppercase; letter-spacing: 0.04em;">
            Cara cepat untuk gabung
        </p>
        <ol style="margin: 0 0 20px 20px; padding: 0; color: #475569; font-size: 14px; line-height: 1.7;">
            <li style="margin-bottom: 8px;">Masuk ke MySpaceLove melalui tombol di bawah.</li>
            <li style="margin-bottom: 8px;">Gunakan email <strong>{{ $invitee->email }}</strong> saat login.</li>
            <li>Terima undangan yang muncul di daftar Space kamu.</li>
        </ol>

        @if ($temporaryPassword)
            <p style="margin: 0 0 20px; padding: 16px 18px; border-radius: 14px; background-color: #fee2e2; color: #b91c1c; font-size: 14px; line-height: 1.7;">
                Kata sandi sementara untuk login pertama:<br>
                <strong style="display: inline-block; margin-top: 6px; font-size: 18px; letter-spacing: 0.1em;">{{ $temporaryPassword }}</strong><br>
                Setelah berhasil masuk, segera ubah dari menu profil.
            </p>
        @endif

        <p style="margin: 0 0 16px; font-size: 14px;">
            Kode undangan: <strong>{{ $invitation->token }}</strong>
        </p>

        <p style="margin: 0 0 20px; font-size: 14px; color: #475569;">
            Status terbaru: <strong style="color: #ec4899;">{{ $currentStatusLabel }}</strong>
        </p>

        @if (!empty($invitationHistory))
            <section style="margin: 0 0 24px; padding: 18px; border-radius: 14px; background: #fff1f2; color: #9d174d; font-size: 13px; line-height: 1.7;">
                <p style="margin: 0 0 8px; font-weight: 600;">Riwayat undanganmu:</p>
                <ul style="margin: 0; padding-left: 18px;">
                    @foreach ($invitationHistory as $history)
                        <li style="margin-bottom: 6px;">
                            <span style="font-weight: 600; color: #be123c;">{{ $history['status_label'] }}</span>
                            — dikirim {{ $history['sent_at'] ?? 'waktu tidak diketahui' }}
                            @if (!empty($history['responded_at']))
                                <br><span style="font-size: 12px; color: #be123c;">Respon: {{ $history['responded_at'] }}</span>
                            @endif
                        </li>
                    @endforeach
                </ul>
            </section>
        @endif

        <p style="margin: 0 0 28px;">
            <a href="{{ $spacesUrl }}" style="display: inline-block; padding: 12px 28px; background-color: #ec4899; color: #ffffff; border-radius: 9999px; text-decoration: none; font-weight: 600; letter-spacing: 0.02em;">
                Buka MySpaceLove
            </a>
        </p>

        <p style="margin: 0 0 18px; font-size: 14px; color: #475569;">
            Jika butuh bantuan, balas email ini atau hubungi {{ $supportEmail }}.
        </p>

        <footer style="font-size: 13px; line-height: 1.6; color: #94a3b8;">
            Dikirim otomatis oleh {{ $appName }}. Tetap terhubung dan saling menyayangi.
        </footer>
    </div>
</body>
</html>
