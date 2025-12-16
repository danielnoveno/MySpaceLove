@php
    $appName = config('app.name');
    $title = trans('app.emails.nobar_schedule.heading');
    $subtitle = "{$space->title} • {$schedule->title}";
    $subject = trans('app.emails.nobar_schedule.subject', ['title' => $schedule->title]);
    $preheader = \Illuminate\Support\Str::limit(
        trans('app.emails.nobar_schedule.intro', ['creator' => $creatorName, 'space' => $space->title]),
        120,
        '…'
    );
@endphp

@extends('emails.layouts.base', compact('appName', 'title', 'subtitle', 'subject', 'preheader'))

@section('content')
    <p style="margin:0 0 18px; color:#1f2937;">
        {{ trans('app.emails.nobar_schedule.greeting', ['recipient' => $recipientName]) }}
    </p>
    <p style="margin:0 0 24px; color:#1f2937;">
        {{ trans('app.emails.nobar_schedule.intro', ['creator' => $creatorName, 'space' => $space->title]) }}
    </p>

    <div style="margin:0 0 28px; padding:16px 0 16px 16px; border-left:3px solid #f43f5e;">
        <div style="font-size:12px; letter-spacing:0.14em; text-transform:uppercase; color:#f43f5e; margin-bottom:4px;">
            {{ trans('app.emails.nobar_schedule.schedule_label') }}
        </div>
        <div style="font-size:16px; font-weight:600; color:#0f172a;">
            {{ $formattedDate }}
        </div>
        @if ($schedule->description)
            <div style="margin-top:14px; font-size:12px; letter-spacing:0.18em; text-transform:uppercase; color:#f43f5e;">
                {{ trans('app.emails.nobar_schedule.details_label') }}
            </div>
            <div style="font-size:15px; line-height:1.75; color:#334155; white-space:pre-line;">
                {{ $schedule->description }}
            </div>
        @endif
    </div>

    <p style="margin:0 0 28px;">
        <a href="{{ route('space.nobar', ['space' => $space->slug]) }}" style="display:inline-block; padding:12px 22px; border-radius:999px; background-color:#0ea5e9; color:#ffffff; text-decoration:none; font-weight:600; letter-spacing:0.02em;">
            {{ trans('app.emails.nobar_schedule.cta') }}
        </a>
    </p>

    <p style="margin:0; color:#64748b;">
        {{ trans('app.emails.nobar_schedule.footer', ['appName' => $appName]) }}
    </p>
@endsection
