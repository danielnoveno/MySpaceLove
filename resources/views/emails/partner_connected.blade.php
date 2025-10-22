<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Pasangan Bergabung</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 24px; color: #1f2937;">
    <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 24px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);">
        <h1 style="font-size: 20px; margin-bottom: 16px; color: #2563eb;">Pasanganmu sudah bergabung!</h1>
        <p style="margin-bottom: 16px;">
            {{ $partner->name }} sekarang sudah terhubung di Space <strong>"{{ $space->title }}"</strong>.
        </p>
        <p style="margin-bottom: 16px;">
            Kamu bisa mulai mengisi timeline, membuat pesan harian, atau menyiapkan kejutan dari dashboard Space kalian.
        </p>
        <p style="margin-bottom: 24px;">
            <a href="{{ $spacesUrl }}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #3b82f6, #6366f1); color: #fff; border-radius: 9999px; text-decoration: none; font-weight: bold;">Buka Space</a>
        </p>
        <p style="margin: 0; font-size: 12px; color: #9ca3af;">
            Dikirim oleh {{ $appName }} untuk membantu kalian tetap sinkron.
        </p>
    </div>
</body>
</html>
