<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Pasangan Bergabung</title>
</head>
<body style="margin: 0; font-family: 'Figtree', 'Inter', Arial, sans-serif; background-color: #f9fafb; color: #0f172a;">
    <div style="max-width: 600px; margin: 0 auto; padding: 36px 24px;">
        <header style="margin-bottom: 20px;">
            <p style="margin: 0; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; color: #0ea5e9;">
                Space {{ $space->title }}
            </p>
            <h1 style="margin: 8px 0 0; font-size: 24px; font-weight: 700; color: #ec4899;">Pasanganmu sudah bergabung!</h1>
        </header>

        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7;">
            {{ $partner->name }} sekarang resmi terhubung di Space <strong>“{{ $space->title }}”</strong>.
        </p>
        <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.7; color: #1f2937;">
            Mulai isi timeline, kirim pesan harian, atau rencanakan kejutan bareng dari dashboard Space kalian.
        </p>

        <p style="margin: 0 0 28px;">
            <a href="{{ $spacesUrl }}" style="display: inline-block; padding: 12px 28px; background-color: #ec4899; color: #ffffff; border-radius: 9999px; text-decoration: none; font-weight: 600; letter-spacing: 0.02em;">
                Buka Dashboard
            </a>
        </p>

        <footer style="font-size: 13px; line-height: 1.6; color: #94a3b8;">
            Dikirim oleh {{ $appName }} untuk membantu kalian tetap sinkron.
        </footer>
    </div>
</body>
</html>
