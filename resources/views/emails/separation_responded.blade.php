<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Tanggapan Pembubaran Space</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 24px; color: #1f2937;">
    <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 24px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);">
        @php($approved = $decision === 'approved')
        <h1 style="font-size: 20px; margin-bottom: 16px; color: {{ $approved ? '#b91c1c' : '#2563eb' }};">
            {{ $responder->name }} {{ $approved ? 'menyetujui' : 'menolak' }} permintaan pembubaran Space
        </h1>
        <p style="margin-bottom: 16px;">
            Permintaan pembubaran untuk Space <strong>"{{ $space->title }}"</strong> kini berstatus <strong>{{ $approved ? 'disetujui' : 'ditolak' }}</strong>.
        </p>
        @if ($reason)
            <p style="margin-bottom: 16px; padding: 12px 16px; border-left: 4px solid {{ $approved ? '#f87171' : '#60a5fa' }}; background-color: {{ $approved ? '#fee2e2' : '#dbeafe' }}; color: {{ $approved ? '#7f1d1d' : '#1d4ed8' }};">
                Pesan dari {{ $responder->name }}:<br>{{ $reason }}
            </p>
        @endif
        @if ($approved)
            <p style="margin-bottom: 24px;">
                Space akan otomatis dinonaktifkan. Jika kamu ingin memulai lembaran baru, kamu bisa membuat Space baru kapan saja.
            </p>
        @else
            <p style="margin-bottom: 24px;">
                Space tetap aktif. Silakan lanjutkan perjalanan kalian atau buat rencana baru bersama.
            </p>
        @endif
        <p style="margin-bottom: 24px;">
            <a href="{{ $spacesUrl }}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #0ea5e9, #6366f1); color: #fff; border-radius: 9999px; text-decoration: none; font-weight: bold;">Buka LoveSpace</a>
        </p>
        <p style="margin: 0; font-size: 12px; color: #9ca3af;">
            Dikirim otomatis oleh {{ $appName }}. Terima kasih sudah memberi keputusan.
        </p>
    </div>
</body>
</html>
