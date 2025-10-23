<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Tanggapan Pembubaran Space</title>
    <style>
        .body { margin: 0; font-family: 'Figtree', 'Inter', Arial, sans-serif; background-color: #f9fafb; color: #0f172a; }
        .container { max-width: 640px; margin: 0 auto; padding: 40px 24px; }
        .header { margin-bottom: 20px; }
        .header p { margin: 0; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; }
        .header h1 { margin: 8px 0 0; font-size: 24px; font-weight: 700; }
        .paragraph { margin: 0 0 18px; font-size: 15px; line-height: 1.7; }
        .reason { margin: 0 0 20px; padding: 16px 18px; border-radius: 14px; font-size: 14px; line-height: 1.7; }
        .reason span { display: inline-block; margin-top: 6px; }
        .paragraph-alt { margin: 0 0 24px; font-size: 15px; line-height: 1.7; color: #1f2937; }
        .button-container { margin: 0 0 28px; }
        .button { display: inline-block; padding: 12px 28px; background-color: #6366f1; color: #ffffff; border-radius: 9999px; text-decoration: none; font-weight: 600; letter-spacing: 0.02em; }
        .footer { font-size: 13px; line-height: 1.6; color: #94a3b8; }

        /* Approved State Colors */
        .text-approved { color: #f97316; }
        .header-approved { color: #dc2626; }
        .reason-approved { background-color: #fee2e2; color: #7f1d1d; }

        /* Rejected State Colors */
        .text-rejected { color: #2563eb; }
        .header-rejected { color: #2563eb; }
        .reason-rejected { background-color: #dbeafe; color: #1d4ed8; }
    </style>
</head>
<body class="body">
    @php($approved = $decision === 'approved')
    <div class="container">
        <header class="header">
            <p class="{{ $approved ? 'text-approved' : 'text-rejected' }}">
                Tanggapan permintaan pembubaran
            </p>
            <h1 class="{{ $approved ? 'header-approved' : 'header-rejected' }}">
                {{ $responder->name }} {{ $approved ? 'menyetujui' : 'menolak' }} permintaan
            </h1>
        </header>

        <p class="paragraph">
            Permintaan pembubaran untuk Space <strong>“{{ $space->title }}”</strong> kini berstatus <strong>{{ $approved ? 'disetujui' : 'ditolak' }}</strong>.
        </p>

        @if ($reason)
            <p class="reason {{ $approved ? 'reason-approved' : 'reason-rejected' }}">
                Pesan dari {{ $responder->name }}:<br>
                <span>{{ $reason }}</span>
            </p>
        @endif

        <p class="paragraph-alt">
            @if ($approved)
                Space akan otomatis dinonaktifkan. Kamu selalu bisa membuat Space baru kapan pun siap.
            @else
                Space tetap aktif. Lanjutkan perjalanan kalian atau susun rencana baru bersama.
            @endif
        </p>

        <p class="button-container">
            <a href="{{ $spacesUrl }}" class="button">
                Buka MySpaceLove
            </a>
        </p>

        <footer class="footer">
            Dikirim otomatis oleh {{ $appName }}. Terima kasih sudah memberi keputusan.
        </footer>
    </div>
</body>
</html>
