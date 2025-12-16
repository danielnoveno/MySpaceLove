import ApplicationLogo from '@/Components/ApplicationLogo';
import { useTranslation } from '@/hooks/useTranslation';
import { Link } from '@inertiajs/react';
import { Heart, Sparkles } from 'lucide-react';
import { PropsWithChildren } from 'react';

type GuestLayoutProps = PropsWithChildren<{
    hero?: {
        badge?: string;
        title?: string;
        subtitle?: string;
        features?: string[];
        footer?: string;
    };
}>;

type AuthLayoutStrings = {
    layout?: {
        badge?: string;
        title?: string;
        subtitle?: string;
        features?: string[];
        footer?: string;
    };
};

export default function GuestLayout({ children, hero }: GuestLayoutProps) {
    const { translations } = useTranslation<AuthLayoutStrings>('auth');
    const layoutStrings = translations.layout ?? {};

    const heroContent = {
        badge: hero?.badge ?? layoutStrings.badge ?? 'MySpaceLove',
        title:
            hero?.title ??
            layoutStrings.title ??
            'MySpaceLove helps you nurture a beautiful shared space.',
        subtitle:
            hero?.subtitle ??
            layoutStrings.subtitle ??
            'Craft rituals, share memories, and surprise each other from anywhere.',
        features:
            hero?.features ??
            layoutStrings.features ?? [
                'Collect milestones, journals, and galleries in one private space.',
                'Coordinate surprises with guided kits and daily prompts.',
                'Stay close with shared countdowns, playlists, and more.',
            ],
        footer: hero?.footer ?? layoutStrings.footer ?? null,
    };

    const hasFeatures = Array.isArray(heroContent.features) && heroContent.features.length > 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-purple-100">
            <div className="flex min-h-screen flex-col lg:flex-row">
                <div className="relative hidden flex-1 overflow-hidden px-12 py-16 text-rose-900 lg:flex">
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-pink-200/60 blur-3xl" aria-hidden />
                        <div className="absolute bottom-10 right-0 h-80 w-80 rounded-full bg-purple-200/60 blur-3xl" aria-hidden />
                        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40 blur-3xl" aria-hidden />
                    </div>

                    <div className="relative z-10 mx-auto flex max-w-xl flex-col justify-center gap-8">
                        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-rose-600 shadow-sm backdrop-blur">
                            <Sparkles className="h-4 w-4" aria-hidden="true" />
                            {heroContent.badge}
                        </span>
                        <h1 className="text-4xl font-bold tracking-tight text-rose-900 sm:text-5xl">
                            {heroContent.title}
                        </h1>
                        <p className="text-lg leading-relaxed text-rose-900/80">
                            {heroContent.subtitle}
                        </p>
                        {hasFeatures && (
                            <ul className="space-y-4 text-base text-rose-900/80">
                                {heroContent.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3">
                                        <Heart className="mt-1 h-5 w-5 text-rose-400" aria-hidden="true" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {heroContent.footer && (
                            <p className="text-sm text-rose-900/70">{heroContent.footer}</p>
                        )}
                    </div>
                </div>

                <div className="flex w-full flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-12">
                    <div className="relative w-full max-w-md">
                        <div className="absolute inset-0 rounded-3xl bg-white/50 blur-2xl" aria-hidden />
                        <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-8 shadow-xl backdrop-blur">
                            <div className="mb-8 flex flex-col items-center gap-3 text-center">
                                <Link href="/" className="inline-flex items-center justify-center">
                                    <ApplicationLogo className="h-14 w-auto fill-current text-pink-500" />
                                </Link>
                                <div className="space-y-2 lg:hidden">
                                    <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">
                                        {heroContent.badge}
                                    </span>
                                    <h2 className="text-2xl font-semibold text-gray-900">
                                        {heroContent.title}
                                    </h2>
                                    <p className="text-sm text-gray-600">{heroContent.subtitle}</p>
                                </div>
                            </div>

                            <div className="space-y-8">{children}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
