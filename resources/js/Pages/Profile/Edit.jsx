import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-2 text-slate-900">
                    <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.32em] text-pink-500">
                        Pengaturan Akun
                    </span>
                    <h2 className="text-2xl font-semibold">Profil &amp; Keamanan</h2>
                    <p className="text-sm text-slate-500">
                        Personalisasi informasi kamu dan jaga space MySpaceLove tetap aman bersama pasanganmu.
                    </p>
                </div>
            }
        >
            <Head title="Profile" />

            <div className="py-12">
                <div className="mx-auto max-w-6xl space-y-10 px-4 sm:px-6 lg:px-8">
                    <div className="relative overflow-hidden rounded-3xl border border-pink-100/60 bg-white/90 shadow-xl shadow-pink-100/50 backdrop-blur">
                        <div className="pointer-events-none absolute inset-0 opacity-80">
                            <div className="absolute -top-32 -left-24 h-72 w-72 rounded-full bg-pink-200/60 blur-3xl" aria-hidden="true" />
                            <div className="absolute -bottom-24 -right-32 h-80 w-80 rounded-full bg-purple-200/60 blur-3xl" aria-hidden="true" />
                        </div>
                        <div className="relative grid gap-10 p-8 sm:p-10 lg:grid-cols-2 lg:gap-12">
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                                className="flex flex-col gap-8"
                            />

                            <div className="rounded-3xl border border-purple-100/70 bg-white/70 p-6 shadow-lg shadow-purple-100/60 backdrop-blur">
                                <UpdatePasswordForm className="space-y-6" />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-rose-200/80 bg-rose-50/80 p-8 shadow-lg shadow-rose-100/60">
                        <DeleteUserForm className="max-w-2xl" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
