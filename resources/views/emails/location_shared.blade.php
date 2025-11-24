@php
    $appName = config('app.name');
    $title = __('Lokasi terbaru dari :name', ['name' => $sender->name]);
    $subtitle = __('Dikirim untuk :name', ['name' => $recipient->name]);
    $subject = __('Lokasi Terbaru dari :name', ['name' => $sender->name]);
    $preheader = __('Lihat koordinat yang baru saja dibagikan oleh :name.', ['name' => $sender->name]);
@endphp

@extends('emails.layouts.base', compact('appName', 'title', 'subtitle', 'subject', 'preheader'))

@section('content')
    <p style="margin:0 0 18px; color:#1f2937;">
        {{ __('Hai :name, :sender baru saja membagikan lokasinya untukmu.', ['name' => $recipient->name, 'sender' => $sender->name]) }}
    </p>

    <div style="margin:0 0 28px; padding:16px 0 16px 16px; border-left:3px solid #f97316;">
        <div style="font-size:12px; letter-spacing:0.14em; text-transform:uppercase; color:#f97316; margin-bottom:6px;">
            {{ __('Koordinat saat ini') }}
        </div>
        <div style="font-size:15px; line-height:1.7; color:#0f172a;">
            Latitude: {{ $latitude }}<br>
            Longitude: {{ $longitude }}
        </div>
    </div>

    <p style="margin:0 0 28px;">
        <a href="{{ $shareUrl }}" style="display:inline-block; padding:12px 20px; background-color:#0ea5e9; color:#ffffff; text-decoration:none; border-radius:999px; font-weight:600; letter-spacing:0.02em;">
            {{ __('Lihat di Peta') }}
        </a>
    </p>

    <p style="margin:0; color:#64748b;">
        {{ __('Tetap saling jaga dan kabari bila kamu sudah menerima lokasi ini.') }}
    </p>
@endsection
