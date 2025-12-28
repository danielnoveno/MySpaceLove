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
    @if(isset($activityData) && !empty($activityData['event']))
        @php
            $actorName = $activityData['meta']['actor_name'] ?? 'Seseorang';
            $event = $activityData['event'];
            $meta = $activityData['meta'];
            if (is_string($meta)) {
                $meta = json_decode($meta, true) ?? [];
            }
            $messageBody = '';

            // Re-assign actorName just in case it was inside the JSON meta
            $actorName = $meta['actor_name'] ?? $actorName;

            switch ($event) {
                case 'Countdown.Created':
                case 'countdown.created':
                    $countdownTitle = $meta['countdown_title'] ?? 'tanpa judul';
                    $countdownDate = isset($meta['countdown_date']) ? \Carbon\Carbon::parse($meta['countdown_date'])->translatedFormat('d F Y') : 'tanggal tidak ditentukan';
                    $messageBody = "<p style=\"margin:0 0 10px; color:#1f2937; line-height:1.7;\"><strong>{$actorName}</strong> merencanakan event baru yang akan datang.</p>" .
                                   "<p style=\"margin:0; color:#4b5563; line-height:1.7;\">Countdown \"{$countdownTitle}\" dijadwalkan pada <strong>{$countdownDate}</strong>. Bersiaplah untuk kejutan!</p>";
                    break;

                case 'timeline.created':
                    $timelineTitle = $meta['timeline_title'] ?? 'tanpa judul';
                    $timelineDate = isset($meta['timeline_date']) ? \Carbon\Carbon::parse($meta['timeline_date'])->translatedFormat('d F Y') : 'tanggal tidak ditentukan';
                    $messageBody = "<p style=\"margin:0 0 10px; color:#1f2937; line-height:1.7;\"><strong>{$actorName}</strong> menambahkan momen baru di timeline.</p>" .
                                   "<p style=\"margin:0; color:#4b5563; line-height:1.7;\">Momen \"{$timelineTitle}\" telah ditambahkan untuk tanggal <strong>{$timelineDate}</strong>.</p>";
                    break;

                default:
                    $messageBody = "<p style=\"margin:0; color:#1f2937; line-height:1.7;\">Ada aktivitas baru di Space kamu: <strong>{$event}</strong>.</p>";
                    break;
            }
        @endphp

        <p style="margin:0 0 20px; color:#1f2937; line-height:1.7;">
            Halo {{ $activityData['meta']['actor_name'] ?? 'Pengguna' }},
        </p>

        <div style="background-color:#f8fafc; padding:20px; border-radius:8px; margin-bottom:20px;">
            {!! $messageBody !!}
        </div>
    @else
        <p style="margin:0 0 20px; color:#1f2937; line-height:1.7;">
            {{ $message ?? 'Ada aktivitas terbaru pada Space kamu.' }}
        </p>
    @endif

    @php
        $actionUrl = $cta['url'] ?? (optional($activityData['meta'])['action_url'] ?? null);
        $actionLabel = $cta['label'] ?? (optional($activityData['meta'])['action_label'] ?? 'Lihat Selengkapnya');
    @endphp

    @if(!empty($actionUrl))
        <p style="margin:30px 0;">
            <a href="{{ $actionUrl }}" style="display:inline-block; padding:12px 26px; border-radius:999px; background-color:#f43f5e; color:#ffffff; text-decoration:none; font-weight:600; letter-spacing:0.02em;">
                {{ $actionLabel }}
            </a>
        </p>
    @endif

    <p style="margin:0; color:#64748b; font-size:13px;">
        Tetap saling kabari ya. ❤️
    </p>
@endsection
