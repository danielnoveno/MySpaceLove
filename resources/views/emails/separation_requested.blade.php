<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Permintaan Pembubaran Space</title>
</head>
<body style="margin: 0; font-family: 'Figtree', 'Inter', Arial, sans-serif; background-color: #f9fafb; color: #0f172a;">
    <div style="max-width: 600px; margin: 0 auto; padding: 36px 24px;">
        <header style="margin-bottom: 20px;">
            <p style="margin: 0; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; color: #f97316;">
                Permintaan pembubaran Space
            </p>
            <h1 style="margin: 8px 0 0; font-size: 24px; font-weight: 700; color: #ef4444;">{{ $space->title }}</h1>
        </header>

        <p style="margin: 0 0 18px; font-size: 15px; line-height: 1.7;">
            {{ $initiator->name }} mengajukan permintaan untuk mengakhiri Space kalian.
        </p>

        @if ($reason)
            <p style="margin: 0 0 20px; padding: 16px 18px; border-radius: 14px; background-color: #fee2e2; color: #7f1d1d; font-size: 14px; line-height: 1.7;">
                Pesan dari {{ $initiator->name }}:<br>
                <span style="display: inline-block; margin-top: 6px;">{{ $reason }}</span>
            </p>
        @endif

        <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.7; color: #1f2937;">
            Segera buka MySpaceLove untuk menyetujui atau menolak permintaan ini. Tanpa tindakanmu, status akan tetap menunggu.
        </p>

        <p style="margin: 0 0 28px;">
            <a href="{{ $spacesUrl }}" style="display: inline-block; padding: 12px 28px; background-color: #ef4444; color: #ffffff; border-radius: 9999px; text-decoration: none; font-weight: 600; letter-spacing: 0.02em;">
                Kelola Permintaan
            </a>
        </p>

        <footer style="font-size: 13px; line-height: 1.6; color: #94a3b8;">
            Pesan otomatis dari {{ $appName }}. Kami harap kalian menemukan keputusan terbaik.
        </footer>
    </div>
</body>
</html>
