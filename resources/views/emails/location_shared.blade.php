<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Berbagi Lokasi</title>
</head>
<body style="margin: 0; font-family: 'Figtree', 'Inter', Arial, sans-serif; background-color: #f9fafb; color: #0f172a;">
    <div style="max-width: 600px; margin: 0 auto; padding: 36px 24px;">
        <header style="margin-bottom: 20px;">
            <p style="margin: 0; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; color: #fb7185;">
                Update lokasi terbaru
            </p>
            <h1 style="margin: 8px 0 0; font-size: 24px; font-weight: 700; color: #ec4899;">Hai {{ $recipient->name }} 💕</h1>
        </header>

        <p style="margin: 0 0 18px; font-size: 15px; line-height: 1.7;">
            {{ $sender->name }} baru saja membagikan lokasinya denganmu.
        </p>

        <div style="margin: 0 0 24px; padding: 18px; border: 1px solid #fbcfe8; border-radius: 14px; background: #fff;">
            <p style="margin: 0; font-size: 14px; line-height: 1.7;">
                <strong style="display: block; margin-bottom: 6px; color: #db2777;">Koordinat saat ini</strong>
                Latitude: {{ $latitude }}<br>
                Longitude: {{ $longitude }}
            </p>
        </div>

        <p style="margin: 0 0 26px;">
            <a href="{{ $shareUrl }}" style="display: inline-block; padding: 12px 26px; background-color: #ec4899; color: #ffffff; border-radius: 9999px; text-decoration: none; font-weight: 600; letter-spacing: 0.02em;">
                Buka di Peta
            </a>
        </p>

        <footer style="font-size: 13px; line-height: 1.6; color: #94a3b8;">
            Dikirim dari {{ $appName }}. Tetap terhubung dan saling jaga ya! 🌸
        </footer>
    </div>
</body>
</html>
