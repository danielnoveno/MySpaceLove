@php
    $subject = $title ?? 'Aktivitas MySpaceLove';
    $subtitle = $space?->title ? ($space->title.' • '.now()->translatedFormat('d F Y')) : now()->translatedFormat('d F Y');
@endphp

@extends('emails.layouts.base', [
    'appName' => $appName ?? config('app.name'),
    'title' => $title ?? 'Ada kabar baru',
    'subtitle' => $subtitle,
    'subject' => $subject,
    'preheader' => strip_tags($message ?? ''),
])

@section('content')
    <p style="margin:0 0 20px; color:#1f2937; line-height:1.7;">
        {{ $message ?? 'Ada aktivitas terbaru pada Space kamu.' }}
    </p>

    @if(!empty($cta))
        <p style="margin:30px 0;">
            <a href="{{ $cta['url'] }}" style="display:inline-block; padding:12px 26px; border-radius:999px; background-color:#f43f5e; color:#ffffff; text-decoration:none; font-weight:600; letter-spacing:0.02em;">
                {{ $cta['label'] ?? 'Lihat Selengkapnya' }}
            </a>
        </p>
    @endif

    <p style="margin:0; color:#64748b; font-size:13px;">
        Tetap saling kabari ya. ❤️
    </p>
@endsection
