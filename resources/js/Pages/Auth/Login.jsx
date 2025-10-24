import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const googleLoginUrl = route('oauth.redirect', { provider: 'google' });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {status && (
                <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            {errors.oauth && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {errors.oauth}
                </div>
            )}

            <div className="space-y-6">
                <a
                    href={googleLoginUrl}
                    className="flex w-full items-center justify-center gap-3 rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-pink-200 hover:text-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:ring-offset-2"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 48 48"
                        className="h-5 w-5"
                        aria-hidden="true"
                    >
                        <path
                            fill="#FFC107"
                            d="M43.6 20.5H42V20H24v8h11.3C33.2 32.5 29 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.2 6.3 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"
                        />
                        <path
                            fill="#FF3D00"
                            d="M6.3 14.7l6.6 4.8C14.3 16 18.8 14 24 14c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.2 6.3 29.4 4 24 4 16.4 4 9.7 8.4 6.3 14.7z"
                        />
                        <path
                            fill="#4CAF50"
                            d="M24 44c5 0 9.7-1.9 13.2-5.1l-6.1-5.2C29 35.6 26.6 36 24 36c-5 0-9.2-3.4-10.7-8.1l-6.5 5C9.7 39.6 16.3 44 24 44z"
                        />
                        <path
                            fill="#1976D2"
                            d="M43.6 20.5H42V20H24v8h11.3c-1.3 3.7-4.9 6.5-9.3 6.5-5 0-9.2-3.4-10.7-8.1l-6.5 5C12.1 39.6 17.7 44 24 44c8 0 15-6.5 15-16 0-1.6-.2-3.1-.4-4.5z"
                        />
                    </svg>
                    <span>Masuk dengan Google</span>
                </a>

                <div className="relative flex items-center justify-center">
                    <span className="absolute inset-x-8 border-t border-dashed border-pink-200" aria-hidden="true"></span>
                    <span className="relative bg-white px-3 text-xs font-semibold uppercase tracking-[0.2em] text-pink-400">
                        atau
                    </span>
                </div>
            </div>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full rounded-2xl border-gray-200 bg-white/70 text-gray-700 focus:border-pink-300 focus:ring-pink-200"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full rounded-2xl border-gray-200 bg-white/70 text-gray-700 focus:border-pink-300 focus:ring-pink-200"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4 block">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <span className="ms-2 text-sm text-gray-600">
                            Remember me
                        </span>
                    </label>
                </div>

                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Belum punya akun?{' '}
                        <Link
                            href={route('register')}
                            className="font-semibold text-pink-600 underline-offset-4 transition hover:text-pink-500 hover:underline"
                        >
                            Daftar sekarang
                        </Link>
                    </div>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="rounded-md text-sm font-medium text-pink-600 underline-offset-4 transition hover:text-pink-500 hover:underline focus:outline-none focus:ring-2 focus:ring-pink-200 focus:ring-offset-2"
                        >
                            Forgot your password?
                        </Link>
                    )}
                </div>

                <div className="pt-4">
                    <PrimaryButton className="w-full justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-3 text-base font-semibold shadow-lg shadow-pink-200/60 transition hover:from-pink-400 hover:to-purple-400" disabled={processing}>
                        Log in
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
