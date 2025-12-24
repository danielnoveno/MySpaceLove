import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTranslation } from '@/hooks/useTranslation';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

type ProfileStrings = {
    profile?: {
        badge?: string;
        title?: string;
        subtitle?: string;
    };
};

type ProfilePageProps = PageProps & {
    mustVerifyEmail: boolean;
    status?: string;
};

export default function Edit({
    mustVerifyEmail,
    status,
}: ProfilePageProps) {
    const { translations } = useTranslation<ProfileStrings>('auth');
    const profileStrings = translations.profile ?? {};

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">
                        {profileStrings.badge ?? 'Account'}
                    </span>
                    <h1 className="text-3xl font-semibold text-gray-900">
                        {profileStrings.title ?? 'Profile & Security'}
                    </h1>
                    <p className="max-w-2xl text-sm text-gray-600">
                        {profileStrings.subtitle ??
                            'Keep your identity current and guard your shared space with strong security.'}
                    </p>
                </div>
            }
            loveCursor={{ color: '#8b5cf6', heartCount: 24, trailColor: 'rgba(139, 92, 246, 0.35)' }}
        >
            <Head title="Profile" />

            <div className="py-12 sm:py-16">
                <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 sm:px-6 lg:px-0">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg backdrop-blur-lg sm:p-8"
                    />

                    <UpdatePasswordForm className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg backdrop-blur-lg sm:p-8" />

                    <DeleteUserForm className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg backdrop-blur-lg sm:p-8" />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
