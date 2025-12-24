import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useTranslation } from '@/hooks/useTranslation';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';

type DeleteAccountStrings = {
    profile?: {
        sections?: {
            delete?: {
                title?: string;
                description?: string;
                cta?: string;
                modal?: {
                    title?: string;
                    description?: string;
                    password_placeholder?: string;
                    cancel?: string;
                    confirm?: string;
                };
            };
        };
    };
};

export default function DeleteUserForm({
    className = '',
}: {
    className?: string;
}) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);
    const { translations } = useTranslation<DeleteAccountStrings>('auth');
    const deleteStrings = translations.profile?.sections?.delete ?? {};
    const modalStrings = deleteStrings.modal ?? {};

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header className="space-y-3">
                <h2 className="text-2xl font-semibold text-gray-900">
                    {deleteStrings.title ?? 'Delete account'}
                </h2>

                <p className="text-sm leading-relaxed text-gray-600">
                    {deleteStrings.description ??
                        'This action permanently removes your data from MySpaceLove. Consider downloading anything you want to keep first.'}
                </p>
            </header>

            <DangerButton onClick={confirmUserDeletion}>
                {deleteStrings.cta ?? 'Delete account'}
            </DangerButton>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="space-y-6 p-6">
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold text-gray-900">
                            {modalStrings.title ??
                                'Are you sure you want to delete your account?'}
                        </h2>

                        <p className="text-sm leading-relaxed text-gray-600">
                            {modalStrings.description ??
                                'This action cannot be undone. Enter your password to confirm and permanently remove your account.'}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <InputLabel
                            htmlFor="password"
                            value="Password"
                            className="sr-only"
                        />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            className="mt-1 w-full rounded-xl border-2 border-violet-200 bg-gradient-to-r from-white/90 to-violet-50/50 px-4 py-3 text-sm text-gray-900 shadow-sm transition-all duration-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-300"
                            isFocused
                            placeholder={
                                modalStrings.password_placeholder ?? 'Password'
                            }
                        />

                        <InputError
                            message={errors.password}
                            className="text-sm"
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <SecondaryButton onClick={closeModal}>
                            {modalStrings.cancel ?? 'Cancel'}
                        </SecondaryButton>

                        <DangerButton disabled={processing}>
                            {modalStrings.confirm ?? 'Yes, delete account'}
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
