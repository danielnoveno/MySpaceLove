<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Berbagi Lokasi</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #fdf2f8; padding: 24px; color: #1f2937;">
    <div style="max-width: 540px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 24px; box-shadow: 0 10px 30px rgba(236, 72, 153, 0.15);">
        <h1 style="font-size: 20px; margin-bottom: 16px; color: #db2777;">Hai {{ $recipient->name }} 💕</h1>
        <p style="margin-bottom: 16px;">{{ $sender->name }} baru saja membagikan lokasi terbarunya denganmu.</p>
        <p style="margin-bottom: 16px;">
            <strong>Koordinat:</strong><br>
            Latitude: {{ $latitude }}<br>
            Longitude: {{ $longitude }}
        </p>
        <p style="margin-bottom: 24px;">Klik tombol di bawah ini untuk melihatnya di peta:</p>
        <p>
            <a href="{{ $shareUrl }}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #ec4899, #f97316); color: #fff; border-radius: 9999px; text-decoration: none; font-weight: bold;">Lihat Lokasi 💖</a>
        </p>
        <p style="margin-top: 24px; font-size: 12px; color: #6b7280;">Dikirim dari MySpaceLove. Tetap terhubung dan saling menjaga ya! 🌸</p>
    </div>
</body>
</html>
