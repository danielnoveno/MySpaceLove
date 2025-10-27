@php
    $appName = config('app.name');
    $title = __('Pasanganmu sudah bergabung!');
    $subtitle = __('Space :space sekarang lengkap', ['space' => $space->title]);
    $subject = __('Pasangan Bergabung ke :space', ['space' => $space->title]);
    $preheader = __(':partner kini bergabung di Space :space.', ['partner' => $partner->name, 'space' => $space->title]);
@endphp

@extends('emails.layouts.base', compact('appName', 'title', 'subtitle', 'subject', 'preheader'))

@section('content')
    <p style="margin:0 0 18px; color:#1f2937;">
        {{ __('Hai! :partner sekarang resmi terhubung di Space ":space".', ['partner' => $partner->name, 'space' => $space->title]) }}
    </p>
    <p style="margin:0 0 24px; color:#1f2937;">
        {{ __('Kalian bisa mulai mengisi timeline, mengirim pesan harian, atau menjadwalkan nobar langsung dari dashboard.') }}
    </p>

    <p style="margin:0 0 28px;">
        <a href="{{ $spacesUrl }}" style="display:inline-block; padding:12px 22px; border-radius:999px; background-color:#f43f5e; color:#ffffff; text-decoration:none; font-weight:600; letter-spacing:0.02em;">
            {{ __('Buka Dashboard') }}
        </a>
    </p>

    <p style="margin:0; color:#64748b;">
        {{ __('Selamat bersenang-senang dan ciptakan cerita baru bersama ya!') }}
    </p>
@endsection
