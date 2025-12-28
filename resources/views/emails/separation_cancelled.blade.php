@php
    $appName = config('app.name');
    $title = __('Permintaan pembubaran dibatalkan');
    $subtitle = __('Space :space tetap berjalan', ['space' => $space->title]);
    $subject = __('Pembubaran Space Dibatalkan');
    $preheader = __(':name membatalkan permintaan pembubaran Space :space.', ['name' => $initiator->name, 'space' => $space->title]);
@endphp

@extends('emails.layouts.base', compact('appName', 'title', 'subtitle', 'subject', 'preheader'))

@section('content')
    <p style="margin:0 0 18px; color:#1f2937;">
        {{ __('Hai, :initiator membatalkan permintaan pembubaran Space kalian.', ['initiator' => $initiator->name]) }}
    </p>
    <p style="margin:0 0 24px; color:#1f2937;">
        {{ __('Space ":space" tetap aktif. Gunakan momentum ini untuk berdiskusi dan menyusun langkah terbaik bersama.', ['space' => $space->title]) }}
    </p>

    <p style="margin:0 0 28px;">
        <a href="{{ $spacesUrl }}" style="display:inline-block; padding:12px 22px; border-radius:999px; background-color:#10b981; color:#ffffff; text-decoration:none; font-weight:600; letter-spacing:0.02em;">
            {{ __('Buka Space') }}
        </a>
    </p>

    <p style="margin:0; color:#64748b;">
        {{ __('Kalau butuh bantuan, kamu bisa menghubungi kami kapan saja.') }}
    </p>
@endsection
