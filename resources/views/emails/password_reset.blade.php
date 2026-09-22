@php
    $title = __('Reset Password');
    $subtitle = __(':appName Password Reset Request', ['appName' => $appName]);
    $subject = __('Reset Your Password');
    $preheader = __('We received a request to reset your password for :appName.', ['appName' => $appName]);
@endphp

@extends('emails.layouts.base', compact('appName', 'title', 'subtitle', 'subject', 'preheader'))

@section('content')
    <p style="margin:0 0 18px; color:#1f2937;">
        {{ __('Hai :name, we received a request to reset your password for your :appName account.', [
            'name' => $name,
            'appName' => $appName,
        ]) }}
    </p>

    <p style="margin:0 0 24px; color:#475569; font-size:14px;">
        {{ __('Click the button below to set a new password. This link will expire in 60 minutes.') }}
    </p>

    <p style="margin:0 0 28px;">
        <a href="{{ $resetUrl }}" style="display:inline-block; padding:12px 22px; border-radius:999px; background-color:#f43f5e; color:#ffffff; text-decoration:none; font-weight:600; letter-spacing:0.02em;">
            {{ __('Reset My Password') }}
        </a>
    </p>

    <div style="margin:0 0 24px; padding:14px; border:1px solid #e2e8f0; border-radius:8px; background-color:#f8fafc;">
        <p style="margin:0 0 6px; font-size:12px; text-transform:uppercase; letter-spacing:0.1em; color:#64748b; font-weight:600;">
            {{ __('Direct Link') }}
        </p>
        <p style="margin:0; font-size:13px; color:#3b82f6; word-break:break-all;">
            <a href="{{ $resetUrl }}" style="color:#3b82f6; text-decoration:underline;">{{ $resetUrl }}</a>
        </p>
    </div>

    <p style="margin:0 0 18px; color:#475569; font-size:14px;">
        {{ __('If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.') }}
    </p>

    <p style="margin:0; color:#64748b; font-size:13px;">
        {{ __('If you need help, reply to this email or contact :email.', ['email' => $supportEmail]) }}
    </p>
@endsection
