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

type RegisterStrings = {
    common?: {
        name?: string;
        email?: string;
        password?: string;
        confirm_password?: string;
        google?: string;
        separator?: string;
    };
    register?: {
        meta_title?: string;
        title?: string;
        subtitle?: string;
        submit?: string;
        google?: string;
        login_prompt?: {
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

type RegisterProps = {
    canUseGoogleAuth?: boolean;
};

export default function Register({ canUseGoogleAuth = false }: RegisterProps) {
    const { translations } = useTranslation<RegisterStrings>('auth');
    const commonStrings = translations.common ?? {};
    const registerStrings = translations.register ?? {};

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout hero={registerStrings.hero}>
            <Head title={registerStrings.meta_title ?? 'Register'} />

            <div className="space-y-6">
                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-semibold text-gray-900">
                        {registerStrings.title ?? 'Create your space'}
                    </h1>
                    <p className="text-sm text-gray-600">
                        {registerStrings.subtitle ??
                            'Set up your shared home for memories, playlists, and surprises.'}
                    </p>
                </div>

                {canUseGoogleAuth && (
                    <div className="space-y-6">
                        <a
                            href={route('login.google')}
                            className="flex w-full items-center justify-center gap-3 rounded-full border border-rose-200 bg-white/90 px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 focus-visible:ring-offset-2"
                            data-love-hover
                        >
                            <GoogleIcon className="h-5 w-5" />
                            {registerStrings.google ??
                                commonStrings.google ??
                                'Continue with Google'}
                        </a>

                        <div className="relative flex items-center justify-center">
                            <span className="h-px w-full bg-rose-100" aria-hidden="true" />
                            <span className="absolute bg-white px-4 text-xs font-semibold uppercase tracking-[0.3em] text-rose-300">
                                {commonStrings.separator ?? 'Email sign up'}
                            </span>
                        </div>
                    </div>
                )}

                <form onSubmit={submit} className="space-y-5">
                    <div className="space-y-2 text-left">
                        <InputLabel htmlFor="name" value={commonStrings.name ?? 'Full name'} />

                        <TextInput
                            id="name"
                            name="name"
                            value={data.name}
                            className="mt-1 w-full rounded-xl border border-rose-100 bg-white/70 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-pink-400 focus:ring-pink-400"
                            autoComplete="name"
                            isFocused={true}
                            onChange={(event) => setData('name', event.target.value)}
                            required
                        />

                        <InputError message={errors.name} className="text-sm" />
                    </div>

                    <div className="space-y-2 text-left">
                        <InputLabel htmlFor="email" value={commonStrings.email ?? 'Email'} />

                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 w-full rounded-xl border border-rose-100 bg-white/70 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-pink-400 focus:ring-pink-400"
                            autoComplete="username"
                            onChange={(event) => setData('email', event.target.value)}
                            required
                        />

                        <InputError message={errors.email} className="text-sm" />
                    </div>

                    <div className="space-y-2 text-left">
                        <InputLabel htmlFor="password" value={commonStrings.password ?? 'Password'} />

                        <PasswordInput
                            id="password"
                            name="password"
                            value={data.password}
                            className="mt-1 w-full rounded-xl border border-rose-100 bg-white/70 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-pink-400 focus:ring-pink-400"
                            autoComplete="new-password"
                            onChange={(event) => setData('password', event.target.value)}
                            required
                        />

                        <InputError message={errors.password} className="text-sm" />
                    </div>

                    <div className="space-y-2 text-left">
                        <InputLabel
                            htmlFor="password_confirmation"
                            value={commonStrings.confirm_password ?? 'Confirm password'}
                        />

                        <PasswordInput
                            id="password_confirmation"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="mt-1 w-full rounded-xl border border-rose-100 bg-white/70 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-pink-400 focus:ring-pink-400"
                            autoComplete="new-password"
                            onChange={(event) =>
                                setData('password_confirmation', event.target.value)
                            }
                            required
                        />

                        <InputError
                            message={errors.password_confirmation}
                            className="text-sm"
                        />
                    </div>

                    <PrimaryButton
                        className="mt-2 w-full justify-center text-sm"
                        disabled={processing}
                    >
                        {registerStrings.submit ?? 'Create account'}
                    </PrimaryButton>
                </form>

                <p className="text-center text-sm text-gray-600">
                    {registerStrings.login_prompt?.text ?? 'Already have an account?'}{' '}
                    <Link
                        href={route('login')}
                        className="font-semibold text-pink-500 transition hover:text-pink-400"
                    >
                        {registerStrings.login_prompt?.cta ?? 'Sign in'}
                    </Link>
                </p>
            </div>
        </GuestLayout>
    );
}
