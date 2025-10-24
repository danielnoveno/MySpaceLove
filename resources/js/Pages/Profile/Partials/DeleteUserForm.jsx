import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

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

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
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
            <header className="flex flex-col gap-2">
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-rose-500">
                    Tindakan Permanen
                </span>
                <h3 className="text-xl font-semibold text-rose-700">
                    Hapus Akun & Space
                </h3>
                <p className="text-sm leading-relaxed text-rose-600">
                    Semua kenangan dan data kamu akan hilang selamanya. Pastikan sudah men-download hal penting sebelum melanjutkan ya. 💔
                </p>
            </header>

            <DangerButton
                onClick={confirmUserDeletion}
                className="rounded-full border border-rose-200 bg-gradient-to-r from-rose-500 to-red-500 px-5 py-3 text-sm font-semibold uppercase tracking-wide shadow-lg shadow-rose-200/60 transition hover:from-rose-400 hover:to-red-400"
            >
                Hapus Akun Saya
            </DangerButton>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="space-y-6 p-6">
                    <div className="space-y-2 text-rose-700">
                        <h2 className="text-lg font-semibold">
                            Yakin mau menghapus akun ini?
                        </h2>
                        <p className="text-sm leading-relaxed text-rose-500">
                            Setelah dihapus, kamu dan pasangan tidak akan bisa mengakses space ini lagi. Masukkan password untuk mengonfirmasi.
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
                            onChange={(event) =>
                                setData('password', event.target.value)
                            }
                            className="mt-2 block w-full rounded-2xl border-rose-200 bg-white/90 text-rose-700 focus:border-rose-400 focus:ring-rose-200"
                            isFocused
                            placeholder="Masukkan password"
                        />

                        <InputError
                            message={errors.password}
                            className="mt-2"
                        />
                    </div>

                    <div className="flex flex-wrap justify-end gap-3">
                        <SecondaryButton
                            onClick={closeModal}
                            className="rounded-full border border-rose-200 px-5 py-2 text-sm font-semibold text-rose-500 transition hover:border-rose-300 hover:text-rose-600"
                        >
                            Batal
                        </SecondaryButton>

                        <DangerButton
                            className="rounded-full bg-gradient-to-r from-rose-600 to-red-500 px-5 py-2 text-sm font-semibold shadow-lg shadow-rose-300/50 hover:from-rose-500 hover:to-red-400"
                            disabled={processing}
                        >
                            Ya, hapus akun
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
