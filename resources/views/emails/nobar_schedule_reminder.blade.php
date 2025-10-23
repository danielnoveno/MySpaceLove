<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="UTF-8">
    <title>{{ trans('app.emails.nobar_schedule.subject', ['title' => $schedule->title]) }}</title>
</head>
<body style="margin: 0; font-family: 'Figtree', 'Inter', Arial, sans-serif; background-color: #f9fafb; color: #0f172a;">
    <div style="max-width: 640px; margin: 0 auto; padding: 40px 24px;">
        <header style="margin-bottom: 24px;">
            <p style="margin: 0; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; color: #ec4899;">
                {{ $space->title }} • {{ $schedule->title }}
            </p>
            <h1 style="margin: 8px 0 0; font-size: 26px; font-weight: 700; color: #be185d;">
                {{ trans('app.emails.nobar_schedule.heading') }}
            </h1>
        </header>

        <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6;">
            {{ trans('app.emails.nobar_schedule.greeting', ['recipient' => $recipientName]) }}
        </p>
        <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.7; color: #1f2937;">
            {{ trans('app.emails.nobar_schedule.intro', ['creator' => $creatorName, 'space' => $space->title]) }}
        </p>

        <div style="margin: 0 0 24px; padding: 20px 22px; border-radius: 16px; background: #ffffff; box-shadow: 0 14px 40px rgba(236, 72, 153, 0.08);">
            <p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: #ec4899;">
                {{ trans('app.emails.nobar_schedule.schedule_label') }}
            </p>
            <p style="margin: 0 0 18px; font-size: 18px; font-weight: 600; color: #0f172a;">
                {{ $formattedDate }}
            </p>

            @if($schedule->description)
                <p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: #ec4899;">
                    {{ trans('app.emails.nobar_schedule.details_label') }}
                </p>
                <p style="margin: 0; font-size: 15px; line-height: 1.7; color: #334155; white-space: pre-line;">
                    {{ $schedule->description }}
                </p>
            @endif
        </div>

        <div style="text-align: center; margin: 0 0 32px;">
            <a href="{{ route('space.nobar', ['space' => $space->slug]) }}" style="display: inline-block; padding: 14px 28px; border-radius: 999px; background: linear-gradient(135deg, #ec4899, #f472b6); color: #ffffff; font-size: 15px; font-weight: 600; letter-spacing: 0.05em; text-decoration: none;">
                {{ trans('app.emails.nobar_schedule.cta') }}
            </a>
        </div>

        <footer style="font-size: 14px; line-height: 1.7; color: #475569;">
            <p style="margin: 0; color: #94a3b8;">
                {{ trans('app.emails.nobar_schedule.footer', ['appName' => $appName]) }}
            </p>
        </footer>
    </div>
</body>
</html>
