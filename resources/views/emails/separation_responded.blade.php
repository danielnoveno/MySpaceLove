<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Tanggapan Pembubaran Space</title>
</head>
<body style="margin: 0; font-family: 'Figtree', 'Inter', Arial, sans-serif; background-color: #f9fafb; color: #0f172a;">
    <div style="max-width: 640px; margin: 0 auto; padding: 40px 24px;">
        @php($approved = $decision === 'approved')
        <header style="margin-bottom: 20px;">
            <p style="margin: 0; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; color: {{ $approved ? '#f97316' : '#2563eb' }};">
                Tanggapan permintaan pembubaran
            </p>
            <h1 style="margin: 8px 0 0; font-size: 24px; font-weight: 700; color: {{ $approved ? '#dc2626' : '#2563eb' }};">
                {{ $responder->name }} {{ $approved ? 'menyetujui' : 'menolak' }} permintaan
            </h1>
        </header>

        <p style="margin: 0 0 18px; font-size: 15px; line-height: 1.7;">
            Permintaan pembubaran untuk Space <strong>“{{ $space->title }}”</strong> kini berstatus <strong>{{ $approved ? 'disetujui' : 'ditolak' }}</strong>.
        </p>

        @if ($reason)
            <p style="margin: 0 0 20px; padding: 16px 18px; border-radius: 14px; background-color: {{ $approved ? '#fee2e2' : '#dbeafe' }}; color: {{ $approved ? '#7f1d1d' : '#1d4ed8' }}; font-size: 14px; line-height: 1.7;">
                Pesan dari {{ $responder->name }}:<br>
                <span style="display: inline-block; margin-top: 6px;">{{ $reason }}</span>
            </p>
        @endif

        <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.7; color: #1f2937;">
            @if ($approved)
                Space akan otomatis dinonaktifkan. Kamu selalu bisa membuat Space baru kapan pun siap.
            @else
                Space tetap aktif. Lanjutkan perjalanan kalian atau susun rencana baru bersama.
            @endif
        </p>

        <p style="margin: 0 0 28px;">
            <a href="{{ $spacesUrl }}" style="display: inline-block; padding: 12px 28px; background-color: #6366f1; color: #ffffff; border-radius: 9999px; text-decoration: none; font-weight: 600; letter-spacing: 0.02em;">
                Buka MySpaceLove
            </a>
        </p>

        <footer style="font-size: 13px; line-height: 1.6; color: #94a3b8;">
            Dikirim otomatis oleh {{ $appName }}. Terima kasih sudah memberi keputusan.
        </footer>
    </div>
</body>
</html>
