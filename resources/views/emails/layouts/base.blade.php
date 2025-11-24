<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="UTF-8">
    <title>{{ $subject ?? ($title ?? ($appName ?? config('app.name'))) }}</title>
</head>
<body style="margin:0; padding:0; background-color:#ffffff; color:#0f172a; font-family:'Inter','Figtree','Segoe UI',Arial,sans-serif; line-height:1.6;">
@isset($preheader)
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; visibility:hidden;">{{ $preheader }}</div>
@endisset
    <div style="max-width:640px; margin:0 auto; padding:40px 24px;">
        <header style="margin-bottom:28px; border-bottom:1px solid #e2e8f0; padding-bottom:16px;">
            <div style="font-size:11px; letter-spacing:0.32em; text-transform:uppercase; color:#f43f5e; font-weight:600;">
                {{ $appName ?? config('app.name') }}
            </div>
            @isset($title)
                <h1 style="margin:10px 0 0; font-size:24px; font-weight:600; color:#0f172a;">{{ $title }}</h1>
            @endisset
            @isset($subtitle)
                <p style="margin:8px 0 0; font-size:14px; color:#475569;">{{ $subtitle }}</p>
            @endisset
        </header>

        <main style="font-size:15px;">
            @yield('content')
        </main>

        <footer style="margin-top:36px; padding-top:16px; border-top:1px solid #e2e8f0; font-size:13px; color:#64748b;">
            {{ $footerNote ?? __('Terima kasih telah menggunakan :app.', ['app' => $appName ?? config('app.name')]) }}
        </footer>
    </div>
</body>
</html>
