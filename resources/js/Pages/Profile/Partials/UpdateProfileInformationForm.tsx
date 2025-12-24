import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useTranslation } from '@/hooks/useTranslation';
import { PageProps } from '@/types';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

type ProfileInformationStrings = {
    profile?: {
        sections?: {
            information?: {
                title?: string;
                description?: string;
                fields?: {
                    name?: string;
                    email?: string;
                };
                verification?: {
                    notice?: string;
                    action?: string;
                    sent?: string;
                };
                actions?: {
                    save?: string;
                    saved?: string;
                };
            };
        };
    };
};

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = "",
}: {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
}) {
    const { props } = usePage<PageProps>();
    const user = props.auth?.user;
    const { translations } = useTranslation<ProfileInformationStrings>('auth');
    const infoStrings = translations.profile?.sections?.information ?? {};
    const fieldStrings = infoStrings.fields ?? {};
    const verificationStrings = infoStrings.verification ?? {};
    const actionStrings = infoStrings.actions ?? {};

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user?.name ?? "",
            email: user?.email ?? "",
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header className="space-y-3">
                <h2 className="text-2xl font-semibold text-gray-900">
                    {infoStrings.title ?? 'Profile information'}
                </h2>

                <p className="text-sm leading-relaxed text-gray-600">
                    {infoStrings.description ??
                        "Refresh how your name and email appear across your shared experiences."}
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel
                        htmlFor="name"
                        value={fieldStrings.name ?? 'Name'}
                    />

                    <TextInput
                        id="name"
                        className="mt-1 w-full rounded-xl border-2 border-violet-200 bg-gradient-to-r from-white/90 to-violet-50/50 px-4 py-3 text-sm text-gray-900 shadow-sm transition-all duration-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-300"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />

                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel
                        htmlFor="email"
                        value={fieldStrings.email ?? 'Email'}
                    />

                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 w-full rounded-xl border-2 border-violet-200 bg-gradient-to-r from-white/90 to-violet-50/50 px-4 py-3 text-sm text-gray-900 shadow-sm transition-all duration-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-300"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />

                    <InputError className="mt-2" message={errors.email} />
                </div>

                {mustVerifyEmail && user?.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-700">
                            {verificationStrings.notice ??
                                'Your email address is unverified.'}
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="ml-1 rounded-md text-sm font-semibold text-violet-600 underline decoration-dotted underline-offset-4 transition-colors hover:text-fuchsia-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2"
                            >
                                {verificationStrings.action ??
                                    'Resend verification email.'}
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 rounded-lg border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-violet-50 px-3 py-2 text-sm font-medium text-emerald-700">
                                {verificationStrings.sent ??
                                    'We sent a new verification link to your inbox.'}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>
                        {actionStrings.save ?? 'Save changes'}
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">
                            {actionStrings.saved ?? 'Saved!'}
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
