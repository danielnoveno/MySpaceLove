import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';

type UpdatePasswordProps = {
    className?: string;
};

type PasswordForm = {
    current_password: string;
    password: string;
    password_confirmation: string;
};

export default function UpdatePasswordForm({ className = '' }: UpdatePasswordProps) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const { data, setData, errors, put, reset, processing, recentlySuccessful } =
        useForm<PasswordForm>({
            current_password: '',
            password: '',
            password_confirmation: '',
        });

    const updatePassword: FormEventHandler = (event) => {
        event.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (submissionErrors) => {
                if (submissionErrors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (submissionErrors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <section className={`space-y-8 ${className}`}>
            <header className="flex flex-col gap-2">
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-purple-500">
                    Keamanan Space
                </span>
                <h3 className="text-xl font-semibold text-slate-900">
                    Perbarui Kata Sandi
                </h3>
                <p className="text-sm text-slate-500">
                    Gunakan kombinasi unik dan sulit ditebak supaya space kalian tetap aman 💪
                </p>
            </header>

            <form onSubmit={updatePassword} className="space-y-6">
                <div className="space-y-2">
                    <InputLabel htmlFor="current_password" value="Password Saat Ini" />

                    <TextInput
                        id="current_password"
                        ref={currentPasswordInput}
                        value={data.current_password}
                        onChange={(event) => setData('current_password', event.target.value)}
                        type="password"
                        className="mt-2 block w-full rounded-2xl border-gray-200 bg-white/80 text-slate-700 focus:border-purple-300 focus:ring-purple-200"
                        autoComplete="current-password"
                    />

                    <InputError message={errors.current_password} className="mt-2" />
                </div>

                <div className="space-y-2">
                    <InputLabel htmlFor="password" value="Password Baru" />

                    <TextInput
                        id="password"
                        ref={passwordInput}
                        value={data.password}
                        onChange={(event) => setData('password', event.target.value)}
                        type="password"
                        className="mt-2 block w-full rounded-2xl border-gray-200 bg-white/80 text-slate-700 focus:border-purple-300 focus:ring-purple-200"
                        autoComplete="new-password"
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="space-y-2">
                    <InputLabel htmlFor="password_confirmation" value="Konfirmasi Password" />

                    <TextInput
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(event) => setData('password_confirmation', event.target.value)}
                        type="password"
                        className="mt-2 block w-full rounded-2xl border-gray-200 bg-white/80 text-slate-700 focus:border-purple-300 focus:ring-purple-200"
                        autoComplete="new-password"
                    />

                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <PrimaryButton
                        className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-sm font-semibold shadow-lg shadow-purple-200/60 transition hover:from-purple-400 hover:to-pink-400"
                        disabled={processing}
                    >
                        Simpan password
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm font-medium text-emerald-600">
                            Password berhasil diupdate 🌟
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
