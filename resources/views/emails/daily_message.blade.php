@php
    $appName = config('app.name');
    $title = trans('app.emails.daily_message.heading');
    $subtitle = "{$space->title} • {$formattedDate}";
    $subject = trans('app.emails.daily_message.subject', [
        'sender' => $senderName,
        'partner' => $partnerName,
        'date' => $formattedDate,
        'space' => $space->title,
    ]);
    $preheader = \Illuminate\Support\Str::limit(strip_tags($dailyMessage->message), 120, '…');
@endphp

@extends('emails.layouts.base', [
    'appName' => $appName,
    'title' => $title,
    'subtitle' => $subtitle,
    'subject' => $subject,
    'preheader' => $preheader,
])

@section('content')
    <p style="margin:0 0 18px; color:#1f2937;">
        {{ trans('app.emails.daily_message.greeting', ['partner' => $partnerName]) }}
    </p>
    <p style="margin:0 0 24px; color:#1f2937;">
        {{ trans('app.emails.daily_message.intro', ['sender' => $senderName, 'space' => $space->title]) }}
    </p>
    <div style="margin:0 0 28px; padding-left:16px; border-left:3px solid #f43f5e; color:#0f172a;">
        <div style="font-size:12px; text-transform:uppercase; letter-spacing:0.16em; color:#f43f5e; margin-bottom:8px;">
            {{ trans('app.emails.daily_message.message_label') }}
        </div>
        <div style="font-size:15px; line-height:1.75;">
            {!! nl2br(e($dailyMessage->message)) !!}
        </div>
    </div>
    <p style="margin:0 0 12px; color:#1f2937;">
        {{ trans('app.emails.daily_message.signature', ['sender' => $senderName]) }}
    </p>
    <p style="margin:0; color:#64748b;">
        {{ trans('app.emails.daily_message.outro', ['appName' => $appName]) }}
    </p>
@endsection
