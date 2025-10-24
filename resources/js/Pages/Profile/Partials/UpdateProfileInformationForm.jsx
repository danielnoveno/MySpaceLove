import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
        });

    const submit = (event) => {
        event.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <section className={`space-y-8 ${className}`}>
            <header className="flex flex-col gap-2">
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-pink-500">
                    Identitas Kamu
                </span>
                <h3 className="text-2xl font-semibold text-slate-900">
                    Informasi Profil
                </h3>
                <p className="text-sm text-slate-500">
                    Nama dan email ini akan tampil di seluruh space MySpaceLove. Pastikan datanya sudah paling update ya! 💖
                </p>
            </header>

            <form onSubmit={submit} className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <InputLabel htmlFor="name" value="Nama Lengkap" />

                        <TextInput
                            id="name"
                            className="mt-2 block w-full rounded-2xl border-gray-200 bg-white/80 text-slate-700 focus:border-pink-300 focus:ring-pink-200"
                            value={data.name}
                            onChange={(event) => setData('name', event.target.value)}
                            required
                            isFocused
                            autoComplete="name"
                        />

                        <InputError className="mt-2" message={errors.name} />
                    </div>

                    <div>
                        <InputLabel htmlFor="email" value="Email" />

                        <TextInput
                            id="email"
                            type="email"
                            className="mt-2 block w-full rounded-2xl border-gray-200 bg-white/80 text-slate-700 focus:border-pink-300 focus:ring-pink-200"
                            value={data.email}
                            onChange={(event) => setData('email', event.target.value)}
                            required
                            autoComplete="username"
                        />

                        <InputError className="mt-2" message={errors.email} />
                    </div>
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="rounded-2xl border border-amber-200/70 bg-amber-50/80 px-4 py-3 text-sm text-amber-700">
                        <p className="font-medium">Email kamu belum terverifikasi.</p>
                        <p className="mt-2 leading-relaxed">
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="font-semibold text-pink-600 underline-offset-4 transition hover:text-pink-500 hover:underline"
                            >
                                Klik di sini untuk mengirim ulang email verifikasi.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                                Link verifikasi baru sudah dikirim ke inbox kamu ✨
                            </div>
                        )}
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-4">
                    <PrimaryButton
                        className="rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-3 text-sm font-semibold shadow-lg shadow-pink-200/60 transition hover:from-pink-400 hover:to-purple-400"
                        disabled={processing}
                    >
                        Simpan perubahan
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm font-medium text-emerald-600">
                            Profil kamu sudah diperbarui 💫
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
