<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Pembubaran Space Dibatalkan</title>
</head>
<body style="margin: 0; font-family: 'Figtree', 'Inter', Arial, sans-serif; background-color: #f9fafb; color: #0f172a;">
    <div style="max-width: 600px; margin: 0 auto; padding: 36px 24px;">
        <header style="margin-bottom: 20px;">
            <p style="margin: 0; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; color: #10b981;">
                Pembubaran dibatalkan
            </p>
            <h1 style="margin: 8px 0 0; font-size: 24px; font-weight: 700; color: #059669;">Space {{ $space->title }}</h1>
        </header>

        <p style="margin: 0 0 18px; font-size: 15px; line-height: 1.7;">
            {{ $initiator->name }} membatalkan permintaan pembubaran. Space kalian tetap aktif.
        </p>

        <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.7; color: #1f2937;">
            Gunakan momen ini untuk berdiskusi dan menyepakati langkah terbaik berikutnya.
        </p>

        <p style="margin: 0 0 28px;">
            <a href="{{ $spacesUrl }}" style="display: inline-block; padding: 12px 28px; background-color: #10b981; color: #ffffff; border-radius: 9999px; text-decoration: none; font-weight: 600; letter-spacing: 0.02em;">
                Buka Space
            </a>
        </p>

        <footer style="font-size: 13px; line-height: 1.6; color: #94a3b8;">
            Dikirim otomatis oleh {{ $appName }} untuk memastikan kalian tetap sinkron.
        </footer>
    </div>
</body>
</html>
