<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="UTF-8">
    <title>{{ trans('app.emails.daily_message.subject', ['sender' => $senderName, 'partner' => $partnerName, 'date' => $formattedDate, 'space' => $space->title]) }}</title>
</head>
<body style="font-family: 'Inter', Arial, sans-serif; background-color: #f8fafc; padding: 32px; color: #1f2937;">
    <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 32px; box-shadow: 0 15px 45px rgba(79, 70, 229, 0.12); border: 1px solid rgba(236, 72, 153, 0.12);">
        <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 12px; color: #db2777;">
            {{ trans('app.emails.daily_message.heading') }}
        </h1>
        <p style="margin: 0 0 16px; font-size: 16px;">
            {{ trans('app.emails.daily_message.greeting', ['partner' => $partnerName]) }}
        </p>
        <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6;">
            {{ trans('app.emails.daily_message.intro', ['sender' => $senderName, 'space' => $space->title]) }}
        </p>

        <div style="background: linear-gradient(135deg, rgba(236, 72, 153, 0.08), rgba(14, 165, 233, 0.08)); padding: 24px; border-radius: 16px; margin-bottom: 24px;">
            <p style="margin: 0 0 12px; font-size: 14px; color: #475569;">
                <strong>{{ trans('app.emails.daily_message.date_label') }}:</strong>
                <span style="margin-left: 4px; color: #1d4ed8;">{{ $formattedDate }}</span>
            </p>
            <p style="margin: 0 0 12px; font-size: 14px; color: #475569; font-weight: 600;">
                {{ trans('app.emails.daily_message.message_label') }}
            </p>
            <div style="background: #ffffff; border-radius: 12px; padding: 16px; border: 1px solid rgba(59, 130, 246, 0.15); font-size: 15px; line-height: 1.7; color: #1f2937;">
                {!! nl2br(e($dailyMessage->message)) !!}
            </div>
        </div>

        <p style="margin: 0 0 12px; font-size: 15px; line-height: 1.6; color: #334155;">
            {{ trans('app.emails.daily_message.signature', ['sender' => $senderName]) }}
        </p>
        <p style="margin: 0; font-size: 13px; color: #94a3b8;">
            {{ trans('app.emails.daily_message.outro', ['appName' => $appName]) }}
        </p>
    </div>
</body>
</html>
