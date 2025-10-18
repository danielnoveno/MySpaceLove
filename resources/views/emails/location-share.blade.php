<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Berbagi Lokasi</title>
</head>
<body style="font-family: Arial, sans-serif; background-color:#f9f0ff; padding:24px; color:#1f2937;">
    <div style="max-width:520px; margin:0 auto; background:white; border-radius:16px; padding:32px; box-shadow:0 20px 45px rgba(236,72,153,0.15);">
        <h1 style="font-size:24px; color:#db2777; margin-bottom:16px;">{{ $sender->name ?? 'Pasanganmu' }} baru saja mengirim lokasinya! 💌</h1>
        <p style="line-height:1.6; margin-bottom:16px;">
            Hai sayang,
        </p>
        <p style="line-height:1.6; margin-bottom:16px;">
            Klik tombol di bawah ini untuk melihat posisi terbarunya di peta. Semoga jarak terasa semakin dekat! 💖
        </p>
        <p style="text-align:center; margin:32px 0;">
            <a href="{{ $shareUrl }}" style="background:#ec4899; color:white; padding:12px 24px; border-radius:999px; text-decoration:none; font-weight:bold;">
                Lihat Lokasi
            </a>
        </p>
        <p style="font-size:14px; color:#6b7280;">
            Link ini dibuat otomatis oleh MySpaceLove dan dapat dibuka tanpa login.
        </p>
        <p style="font-size:12px; color:#9ca3af; margin-top:24px;">Dikirim dengan penuh cinta dari MySpaceLove 💕</p>
    </div>
</body>
</html>
