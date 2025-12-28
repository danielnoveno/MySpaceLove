@php
    $appName = config('app.name');
    $title = __('Permintaan pembubaran Space');
    $subtitle = __('Space :space', ['space' => $space->title]);
    $subject = __('Permintaan Pembubaran Space :space', ['space' => $space->title]);
    $preheader = __(':initiator mengajukan pembubaran Space :space.', ['initiator' => $initiator->name, 'space' => $space->title]);
@endphp

@extends('emails.layouts.base', compact('appName', 'title', 'subtitle', 'subject', 'preheader'))

@section('content')
    <p style="margin:0 0 18px; color:#1f2937;">
        {{ __('Hai, :initiator mengajukan permintaan untuk mengakhiri Space kalian.', ['initiator' => $initiator->name]) }}
    </p>

    @if ($reason)
        <div style="margin:0 0 24px; padding:16px 0 0 16px; border-left:3px solid #ef4444; color:#7f1d1d;">
            <div style="font-size:12px; letter-spacing:0.16em; text-transform:uppercase; margin-bottom:6px;">
                {{ __('Pesan dari :name', ['name' => $initiator->name]) }}
            </div>
            <div style="font-size:15px; line-height:1.7; color:#7f1d1d;">
                {{ $reason }}
            </div>
        </div>
    @endif

    <p style="margin:0 0 24px; color:#1f2937;">
        {{ __('Silakan buka MySpaceLove untuk menyetujui atau menolak permintaan ini. Tanpa tindakanmu, status akan tetap menunggu respon.') }}
    </p>

    <p style="margin:0 0 28px;">
        <a href="{{ $spacesUrl }}" style="display:inline-block; padding:12px 22px; border-radius:999px; background-color:#ef4444; color:#ffffff; text-decoration:none; font-weight:600; letter-spacing:0.02em;">
            {{ __('Kelola Permintaan') }}
        </a>
    </p>

    <p style="margin:0; color:#64748b;">
        {{ __('Kami berharap kalian menemukan keputusan terbaik bersama.') }}
    </p>
@endsection
