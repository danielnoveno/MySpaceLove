<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Undangan Space Baru</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 24px; color: #1f2937;">
    <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 24px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);">
        <h1 style="font-size: 20px; margin-bottom: 16px; color: #db2777;">Hai {{ $invitee->name ?? 'LoveSpace Partner' }},</h1>
        <p style="margin-bottom: 16px;">
            {{ $inviter->name }} mengundangmu untuk bergabung ke Space <strong>"{{ $space->title }}"</strong> di {{ $appName }}.
        </p>
        <p style="margin-bottom: 12px;">Langkah singkat untuk bergabung:</p>
        <ol style="margin: 0 0 16px 20px; padding: 0; color: #4b5563;">
            <li style="margin-bottom: 8px;">Masuk ke LoveSpace melalui tombol di bawah ini.</li>
            <li style="margin-bottom: 8px;">Gunakan email <strong>{{ $invitee->email }}</strong> saat login.</li>
            <li style="margin-bottom: 8px;">Buka menu Space dan terima undangan yang muncul.</li>
        </ol>
        @if ($temporaryPassword)
            <p style="margin-bottom: 16px; padding: 12px 16px; border-radius: 12px; background-color: #fee2e2; color: #991b1b;">
                Akunmu baru saja dibuat otomatis. Gunakan kata sandi sementara berikut saat pertama kali login:
                <br><strong style="font-size: 18px; letter-spacing: 0.08em;">{{ $temporaryPassword }}</strong>
                <br>Setelah berhasil masuk, segera ubah kata sandimu dari menu profil.
            </p>
        @endif
        <p style="margin-bottom: 16px;">
            Kode undangan: <strong>{{ $invitation->token }}</strong> (simpan untuk referensi jika diperlukan).
        </p>
        <div style="margin-bottom: 20px; padding: 12px 16px; border-radius: 12px; background-color: #f8fafc; color: #1f2937;">
            <strong>Status undangan terbaru:</strong> {{ $currentStatusLabel }}
        </div>
        @if (!empty($invitationHistory))
            <div style="margin-bottom: 24px; padding: 16px; border-radius: 12px; background-color: #fdf2f8; color: #831843;">
                <p style="margin: 0 0 8px;"><strong>Riwayat undanganmu sebelumnya:</strong></p>
                <ul style="margin: 0; padding-left: 20px; color: #9d174d;">
                    @foreach ($invitationHistory as $history)
                        <li style="margin-bottom: 8px;">
                            <span style="font-weight: 600; color: #be123c;">{{ $history['status_label'] }}</span>
                            <span>— dikirim {{ $history['sent_at'] ?? 'waktu tidak diketahui' }}</span>
                            @if (!empty($history['responded_at']))
                                <br><span style="font-size: 12px; color: #be123c;">Respon: {{ $history['responded_at'] }}</span>
                            @endif
                        </li>
                    @endforeach
                </ul>
            </div>
        @endif
        <p style="margin-bottom: 24px;">
            <a href="{{ $spacesUrl }}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #ec4899, #f97316); color: #fff; border-radius: 9999px; text-decoration: none; font-weight: bold;">Buka LoveSpace</a>
        </p>
        <p style="margin-bottom: 16px; color: #4b5563;">
            Jika kamu butuh bantuan, balas email ini atau hubungi {{ $supportEmail }}.
        </p>
        <p style="margin: 0; font-size: 12px; color: #9ca3af;">
            Dikirim otomatis oleh {{ $appName }}. Tetap terhubung dan saling menyayangi.
        </p>
    </div>
</body>
</html>
