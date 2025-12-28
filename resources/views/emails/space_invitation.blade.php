@php
    $appName = config('app.name');
    $title = __('Undangan bergabung ke Space');
    $subtitle = __(':inviter mengundangmu ke ":space"', ['inviter' => $inviter->name, 'space' => $space->title]);
    $subject = __('Undangan bergabung ke Space ":space"', ['space' => $space->title]);
    $preheader = __('Terima undangan dari :inviter untuk Space :space.', ['inviter' => $inviter->name, 'space' => $space->title]);
@endphp

@extends('emails.layouts.base', compact('appName', 'title', 'subtitle', 'subject', 'preheader'))

@section('content')
    <p style="margin:0 0 18px; color:#1f2937;">
        {{ __('Hai :name, :inviter mengundangmu untuk bergabung ke Space ":space".', [
            'name' => $invitee->name ?? __('Partner MySpaceLove'),
            'inviter' => $inviter->name,
            'space' => $space->title,
        ]) }}
    </p>

    <p style="margin:0 0 16px; font-size:14px; text-transform:uppercase; letter-spacing:0.14em; color:#0ea5e9;">
        {{ __('Cara bergabung') }}
    </p>
    <ol style="margin:0 0 24px 20px; padding:0; color:#475569; font-size:14px; line-height:1.7;">
        <li>{{ __('Masuk ke MySpaceLove melalui tombol di bawah.') }}</li>
        <li>{{ __('Gunakan email :email saat login.', ['email' => $invitee->email]) }}</li>
        <li>{{ __('Terima undangan yang muncul di daftar Space-mu.') }}</li>
    </ol>

    @if ($temporaryPassword)
        <div style="margin:0 0 24px; padding:16px 0 0 16px; border-left:3px solid #f97316; color:#7c2d12;">
            <div style="font-size:12px; text-transform:uppercase; letter-spacing:0.16em; color:#f97316; margin-bottom:6px;">
                {{ __('Kata sandi sementara') }}
            </div>
            <div style="font-size:16px; font-weight:600; letter-spacing:0.08em;">
                {{ $temporaryPassword }}
            </div>
            <div style="margin-top:6px; font-size:13px; color:#7c2d12;">
                {{ __('Gunakan hanya untuk login pertama lalu ganti dari menu profil.') }}
            </div>
        </div>
    @endif

    <p style="margin:0 0 12px; color:#1f2937;">
        {{ __('Kode undangan: :token', ['token' => $invitation->token]) }}
    </p>
    <p style="margin:0 0 24px; color:#64748b;">
        {{ __('Status saat ini: :status', ['status' => $currentStatusLabel]) }}
    </p>

    @if (!empty($invitationHistory))
        <div style="margin:0 0 28px; padding:16px 0 0 16px; border-left:3px solid #ec4899;">
            <div style="font-size:12px; letter-spacing:0.16em; text-transform:uppercase; color:#ec4899; margin-bottom:8px;">
                {{ __('Riwayat undangan') }}
            </div>
            <ul style="margin:0; padding-left:18px; color:#475569; font-size:13px; line-height:1.7;">
                @foreach ($invitationHistory as $history)
                    <li style="margin-bottom:6px;">
                        <strong style="color:#ec4899;">{{ $history['status_label'] }}</strong>
                        – {{ $history['sent_at'] ?? __('waktu tidak diketahui') }}
                        @if (!empty($history['responded_at']))
                            <br><span style="color:#ec4899;">{{ __('Respon: :time', ['time' => $history['responded_at']]) }}</span>
                        @endif
                    </li>
                @endforeach
            </ul>
        </div>
    @endif

    <p style="margin:0 0 28px;">
        <a href="{{ $spacesUrl }}" style="display:inline-block; padding:12px 22px; border-radius:999px; background-color:#f43f5e; color:#ffffff; text-decoration:none; font-weight:600; letter-spacing:0.02em;">
            {{ __('Buka MySpaceLove') }}
        </a>
    </p>

    <p style="margin:0; color:#64748b;">
        {{ __('Jika butuh bantuan, balas email ini atau hubungi :email.', ['email' => $supportEmail]) }}
    </p>
@endsection
