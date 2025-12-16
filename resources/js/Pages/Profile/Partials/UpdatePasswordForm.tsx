import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useTranslation } from '@/hooks/useTranslation';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';

type PasswordStrings = {
    profile?: {
        sections?: {
            password?: {
                title?: string;
                description?: string;
                fields?: {
                    current?: string;
                    new?: string;
                    confirm?: string;
                };
                actions?: {
                    save?: string;
                    saved?: string;
                };
            };
        };
    };
};

export default function UpdatePasswordForm({
    className = '',
}: {
    className?: string;
}) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const { translations } = useTranslation<PasswordStrings>('auth');
    const passwordStrings = translations.profile?.sections?.password ?? {};
    const fieldStrings = passwordStrings.fields ?? {};
    const actionStrings = passwordStrings.actions ?? {};

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <header className="space-y-3">
                <h2 className="text-2xl font-semibold text-gray-900">
                    {passwordStrings.title ?? 'Update password'}
                </h2>

                <p className="text-sm leading-relaxed text-gray-600">
                    {passwordStrings.description ??
                        'Keep your shared space safe with a strong, unique password.'}
                </p>
            </header>

            <form onSubmit={updatePassword} className="mt-6 space-y-6">
                <div>
                    <InputLabel
                        htmlFor="current_password"
                        value={fieldStrings.current ?? 'Current password'}
                    />

                    <TextInput
                        id="current_password"
                        ref={currentPasswordInput}
                        value={data.current_password}
                        onChange={(e) =>
                            setData('current_password', e.target.value)
                        }
                        type="password"
                        className="mt-1 w-full rounded-xl border border-rose-100 bg-white/70 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-pink-400 focus:ring-pink-400"
                        autoComplete="current-password"
                    />

                    <InputError
                        message={errors.current_password}
                        className="mt-2"
                    />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password"
                        value={fieldStrings.new ?? 'New password'}
                    />

                    <TextInput
                        id="password"
                        ref={passwordInput}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        type="password"
                        className="mt-1 w-full rounded-xl border border-rose-100 bg-white/70 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-pink-400 focus:ring-pink-400"
                        autoComplete="new-password"
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value={fieldStrings.confirm ?? 'Confirm password'}
                    />

                    <TextInput
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        type="password"
                        className="mt-1 w-full rounded-xl border border-rose-100 bg-white/70 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-pink-400 focus:ring-pink-400"
                        autoComplete="new-password"
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>
                        {actionStrings.save ?? 'Update password'}
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-pink-500">
                            {actionStrings.saved ?? 'Password updated!'}
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
