import Checkbox from '@/Components/Checkbox';
import GoogleIcon from '@/Components/Icons/GoogleIcon';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import PasswordInput from '@/Components/PasswordInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { useTranslation } from '@/hooks/useTranslation';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

type LoginStrings = {
    common?: {
        email?: string;
        password?: string;
        remember_me?: string;
        or_email?: string;
        google?: string;
        separator?: string;
    };
    login?: {
        meta_title?: string;
        title?: string;
        subtitle?: string;
        submit?: string;
        forgot_password?: string;
        google?: string;
        register_prompt?: {
            text?: string;
            cta?: string;
        };
        hero?: {
            badge?: string;
            title?: string;
            subtitle?: string;
            features?: string[];
            footer?: string;
        };
    };
};

type LoginProps = {
    status?: string;
    canResetPassword: boolean;
    canUseGoogleAuth?: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canUseGoogleAuth = false,
}: LoginProps) {
    const { translations } = useTranslation<LoginStrings>('auth');
    const commonStrings = translations.common ?? {};
    const loginStrings = translations.login ?? {};

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });
    const errorBag = errors as Record<string, string | undefined>;

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const heroContent = loginStrings.hero;

    return (
        <GuestLayout hero={heroContent}>
            <Head title={loginStrings.meta_title ?? 'Log in'} />

            <div className="space-y-6">
                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-semibold text-gray-900">
                        {loginStrings.title ?? 'Welcome back'}
                    </h1>
                    <p className="text-sm text-gray-600">
                        {loginStrings.subtitle ??
                            'Sign in to continue your shared journey together.'}
                    </p>
                </div>

                {status && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        {status}
                    </div>
                )}

                {errorBag.google && (
                    <InputError
                        message={errorBag.google}
                        className="text-center text-sm"
                    />
                )}

                {canUseGoogleAuth && (
                    <div className="space-y-6">
                        <a
                            href={route('login.google')}
                            className="flex w-full items-center justify-center gap-3 rounded-full border border-rose-200 bg-white/90 px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 focus-visible:ring-offset-2"
                            data-love-hover
                        >
                            <GoogleIcon className="h-5 w-5" />
                            {loginStrings.google ??
                                commonStrings.google ??
                                'Sign in with Google'}
                        </a>

                        <div className="relative flex items-center justify-center">
                            <span className="h-px w-full bg-rose-100" aria-hidden="true" />
                            <span className="absolute bg-white px-4 text-xs font-semibold uppercase tracking-[0.3em] text-rose-300">
                                {commonStrings.separator ?? 'Email login'}
                            </span>
                        </div>
                    </div>
                )}

                <form onSubmit={submit} className="space-y-5">
                    <div className="space-y-2 text-left">
                        <InputLabel htmlFor="email" value={commonStrings.email ?? 'Email'} />

                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 w-full rounded-xl border border-rose-100 bg-white/70 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-pink-400 focus:ring-pink-400"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(event) => setData('email', event.target.value)}
                        />

                        <InputError message={errors.email} className="text-sm" />
                    </div>

                    <div className="space-y-2 text-left">
                        <InputLabel
                            htmlFor="password"
                            value={commonStrings.password ?? 'Password'}
                        />

                        <PasswordInput
                            id="password"
                            name="password"
                            value={data.password}
                            className="mt-1 w-full rounded-xl border border-rose-100 bg-white/70 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-pink-400 focus:ring-pink-400"
                            autoComplete="current-password"
                            onChange={(event) => setData('password', event.target.value)}
                        />

                        <InputError message={errors.password} className="text-sm" />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2 text-gray-600">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(event) =>
                                    setData('remember', event.target.checked)
                                }
                            />
                            <span>{commonStrings.remember_me ?? 'Remember me'}</span>
                        </label>

                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="font-semibold text-pink-500 transition hover:text-pink-400"
                            >
                                {loginStrings.forgot_password ?? 'Forgot password?'}
                            </Link>
                        )}
                    </div>

                    <PrimaryButton
                        className="mt-2 w-full justify-center text-sm"
                        disabled={processing}
                    >
                        {loginStrings.submit ?? 'Sign in'}
                    </PrimaryButton>
                </form>

                <p className="text-center text-sm text-gray-600">
                    {loginStrings.register_prompt?.text ??
                        "Don't have an account?"}{' '}
                    <Link
                        href={route('register')}
                        className="font-semibold text-pink-500 transition hover:text-pink-400"
                    >
                        {loginStrings.register_prompt?.cta ?? 'Create one'}
                    </Link>
                </p>
            </div>
        </GuestLayout>
    );
}
