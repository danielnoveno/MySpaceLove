<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="UTF-8">
    <title>{{ trans('app.emails.daily_message.subject', ['sender' => $senderName, 'partner' => $partnerName, 'date' => $formattedDate, 'space' => $space->title]) }}</title>
</head>
<body style="margin: 0; font-family: 'Figtree', 'Inter', Arial, sans-serif; background-color: #f9fafb; color: #0f172a;">
    <div style="max-width: 640px; margin: 0 auto; padding: 40px 24px;">
        <header style="margin-bottom: 24px;">
            <p style="margin: 0; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; color: #ec4899;">
                {{ $space->title }} • {{ $formattedDate }}
            </p>
            <h1 style="margin: 8px 0 0; font-size: 26px; font-weight: 700; color: #be185d;">
                {{ trans('app.emails.daily_message.heading') }}
            </h1>
        </header>

        <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6;">
            {{ trans('app.emails.daily_message.greeting', ['partner' => $partnerName]) }}
        </p>
        <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.7; color: #1f2937;">
            {{ trans('app.emails.daily_message.intro', ['sender' => $senderName, 'space' => $space->title]) }}
        </p>

        <h2 style="margin: 0 0 12px; font-size: 15px; font-weight: 600; letter-spacing: 0.02em; color: #0ea5e9;">
            {{ trans('app.emails.daily_message.message_label') }}
        </h2>
        <p style="margin: 0 0 24px; padding: 16px 18px; border-left: 3px solid #ec4899; background: #ffffff; border-radius: 14px; font-size: 15px; line-height: 1.75; color: #0f172a; box-shadow: 0 10px 30px rgba(236, 72, 153, 0.08);">
            {!! nl2br(e($dailyMessage->message)) !!}
        </p>

        <footer style="font-size: 14px; line-height: 1.7; color: #475569;">
            <p style="margin: 0 0 12px;">
                {{ trans('app.emails.daily_message.signature', ['sender' => $senderName]) }}
            </p>
            <p style="margin: 0; color: #94a3b8;">
                {{ trans('app.emails.daily_message.outro', ['appName' => $appName]) }}
            </p>
        </footer>
    </div>
</body>
</html>
