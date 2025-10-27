@php
    $approved = $decision === 'approved';
    $appName = config('app.name');
    $title = $approved
        ? __('Permintaan pembubaran disetujui')
        : __('Permintaan pembubaran ditolak');
    $subtitle = __('Space :space', ['space' => $space->title]);
    $subject = $approved
        ? __(':name menyetujui pembubaran Space', ['name' => $responder->name])
        : __(':name menolak pembubaran Space', ['name' => $responder->name]);
    $preheader = $approved
        ? __(':name menyetujui permintaan pembubaran Space :space.', ['name' => $responder->name, 'space' => $space->title])
        : __(':name menolak permintaan pembubaran Space :space.', ['name' => $responder->name, 'space' => $space->title]);
    $accentColor = $approved ? '#f97316' : '#2563eb';
@endphp

@extends('emails.layouts.base', compact('appName', 'title', 'subtitle', 'subject', 'preheader'))

@section('content')
    <p style="margin:0 0 18px; color:#1f2937;">
        {{ __('Permintaan pembubaran untuk Space ":space" kini berstatus :status.', [
            'space' => $space->title,
            'status' => $approved ? __('disetujui') : __('ditolak'),
        ]) }}
    </p>

    @if ($reason)
        <div style="margin:0 0 24px; padding:16px 0 0 16px; border-left:3px solid {{ $accentColor }}; color:#0f172a;">
            <div style="font-size:12px; letter-spacing:0.18em; text-transform:uppercase; color:{{ $accentColor }}; margin-bottom:6px;">
                {{ __('Pesan dari :name', ['name' => $responder->name]) }}
            </div>
            <div style="font-size:15px; line-height:1.7;">
                {{ $reason }}
            </div>
        </div>
    @endif

    <p style="margin:0 0 24px; color:#1f2937;">
        @if ($approved)
            {{ __('Space akan otomatis dinonaktifkan. Kamu selalu bisa membuat Space baru kapan pun siap.') }}
        @else
            {{ __('Space tetap aktif. Silakan lanjutkan perjalanan kalian atau susun rencana baru bersama.') }}
        @endif
    </p>

    <p style="margin:0 0 28px;">
        <a href="{{ $spacesUrl }}" style="display:inline-block; padding:12px 22px; border-radius:999px; background-color:{{ $accentColor }}; color:#ffffff; text-decoration:none; font-weight:600; letter-spacing:0.02em;">
            {{ __('Buka MySpaceLove') }}
        </a>
    </p>

    <p style="margin:0; color:#64748b;">
        {{ __('Terima kasih sudah memberikan keputusan. Kami ikut mendoakan yang terbaik untuk kalian.') }}
    </p>
@endsection
