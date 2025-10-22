<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Permintaan Pembubaran Space</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 24px; color: #1f2937;">
    <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 24px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);">
        <h1 style="font-size: 20px; margin-bottom: 16px; color: #b91c1c;">Permintaan pembubaran Space</h1>
        <p style="margin-bottom: 16px;">
            {{ $initiator->name }} mengajukan permintaan untuk mengakhiri Space <strong>"{{ $space->title }}"</strong>.
        </p>
        @if ($reason)
            <p style="margin-bottom: 16px; padding: 12px 16px; border-left: 4px solid #f87171; background-color: #fee2e2; color: #7f1d1d;">
                Pesan dari {{ $initiator->name }}:<br>{{ $reason }}
            </p>
        @endif
        <p style="margin-bottom: 16px;">
            Buka LoveSpace sesegera mungkin untuk menyetujui atau menolak permintaan ini. Tanpa keputusanmu, Space tetap dalam status menunggu.
        </p>
        <p style="margin-bottom: 24px;">
            <a href="{{ $spacesUrl }}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #f97316, #ef4444); color: #fff; border-radius: 9999px; text-decoration: none; font-weight: bold;">Kelola Permintaan</a>
        </p>
        <p style="margin: 0; font-size: 12px; color: #9ca3af;">
            Pesan otomatis dari {{ $appName }}. Kami harap kalian menemukan keputusan terbaik.
        </p>
    </div>
</body>
</html>
