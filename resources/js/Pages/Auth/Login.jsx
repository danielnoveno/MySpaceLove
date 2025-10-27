import Checkbox from '@/Components/Checkbox';
import GoogleIcon from '@/Components/Icons/GoogleIcon';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword, canUseGoogleAuth }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

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
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            {errors.google && (
                <InputError
                    message={errors.google}
                    className="mb-4 text-center"
                />
            )}

            {canUseGoogleAuth && (
                <>
                    <a
                        href={route('login.google')}
                        className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    >
                        <GoogleIcon className="h-5 w-5" />
                        Masuk dengan Google
                    </a>
                    <div className="my-6 flex items-center gap-4 text-gray-400">
                        <span className="h-px flex-1 bg-gray-200" aria-hidden="true" />
                        <span className="text-xs uppercase tracking-[0.3em]">
                            atau
                        </span>
                        <span className="h-px flex-1 bg-gray-200" aria-hidden="true" />
                    </div>
                </>
            )}

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
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
                        className="mt-1 block w-full"
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

                <div className="mt-4 flex items-center justify-end">
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Forgot your password?
                        </Link>
                    )}

                    <PrimaryButton className="ms-4" disabled={processing}>
                        Log in
                    </PrimaryButton>
                </div>

                <div className="mt-6 text-center text-sm text-gray-600">
                    Belum punya akun?{' '}
                    <Link
                        href={route('register')}
                        className="font-semibold text-indigo-600 underline hover:text-indigo-500"
                    >
                        Daftar sekarang
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
