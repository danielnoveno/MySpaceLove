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

    // EXTRA FIX → buat mencegah CSS validation error
@endphp

@extends('emails.layouts.base', compact('appName', 'title', 'subtitle', 'subject', 'preheader'))

@section('content')
    <style>
        :root {
            --accent-color: {{ $accentColor }};
        }
        .dynamic-div-style {
            margin: 0 0 24px;
            padding: 16px 0 0 16px;
            border-left: 3px solid var(--accent-color);
            color: #0f172a;
        }
        .dynamic-link-style {
            display: inline-block;
            padding: 12px 22px;
            border-radius: 999px;
            background-color: var(--accent-color);
            color: #ffffff;
            text-decoration: none;
            font-weight: 600;
            letter-spacing: 0.02em;
        }
        .dynamic-text-color {
            color: var(--accent-color);
        }
    </style>
    <p style="margin: 0 0 18px; color:#1f2937;">
        {{ __('Permintaan pembubaran untuk Space ":space" kini berstatus :status.', [
            'space' => $space->title,
            'status' => $approved ? __('disetujui') : __('ditolak'),
        ]) }}
    </p>

    @if ($reason)
        <div class="dynamic-div-style">
            <div style="font-size:12px; letter-spacing:0.18em; text-transform:uppercase; margin-bottom:6px;" class="dynamic-text-color">
                {{ __('Pesan dari :name', ['name' => $responder->name]) }}
            </div>
            <div style="font-size:15px; line-height:1.7;">
                {{ $reason }}
            </div>
        </div>
    @endif

    <p style="margin: 0 0 24px; color:#1f2937;">
        @if ($approved)
            {{ __('Space akan otomatis dinonaktifkan. Kamu selalu bisa membuat Space baru kapan pun siap.') }}
        @else
            {{ __('Space tetap aktif. Silakan lanjutkan perjalanan kalian atau susun rencana baru bersama.') }}
        @endif
    </p>

    <p style="margin: 0 0 28px;">
        <a href="{{ $spacesUrl }}" class="dynamic-link-style">
            {{ __('Buka MySpaceLove') }}
        </a>
    </p>

    <p style="margin:0; color:#64748b;">
        {{ __('Terima kasih sudah memberikan keputusan. Kami ikut mendoakan yang terbaik untuk kalian.') }}
    </p>
@endsection
