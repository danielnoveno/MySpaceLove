import { PropsWithChildren, useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import { Check, Globe, Lock } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import LoveCursorCanvas from "@/Components/LoveCursorCanvas";

type LoveCursorConfig = {
    color?: string;
    heartCount?: number;
    className?: string;
    trailColor?: string;
};

export default function Authenticated({
    header,
    children,
    loveCursor,
}: PropsWithChildren<{
    header?: React.ReactNode;
    loveCursor?: LoveCursorConfig | false;
}>) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);
    const { props }: any = usePage();
    const user = props.auth?.user;
    const spaces =
        (props.spaces as Array<{
            id: number;
            slug: string;
            title: string;
            has_partner?: boolean;
        }>) ??
        [];
    const currentSpace =
        (props.currentSpace as
            | {
                  id: number;
                  slug: string;
                  title: string;
                  has_partner?: boolean;
                  is_owner?: boolean;
              }
            | null
            | undefined) ?? null;

    const { translations: layoutTranslations } =
        useTranslation<{
            navigation?: Record<string, string>;
            user?: { fallback_name?: string };
            language?: { label?: string; options?: Record<string, string> };
        }>("layout");

    const navigation = layoutTranslations.navigation ?? {};
    const userStrings = layoutTranslations.user ?? {};
    const languageStrings = layoutTranslations.language ?? {};

    const availableLocales =
        (props.availableLocales as string[] | undefined) ?? [];
    const activeLocale = (props.locale as string | undefined) ?? "en";
    const languageOptions = languageStrings.options ?? {};
    const languageLabel = languageStrings.label ?? "Language";
    const activeLanguageLabel =
        languageOptions[activeLocale] ?? activeLocale.toUpperCase();

    const fallbackHref = route("spaces.index");

    const dashboardHref = currentSpace
        ? route("spaces.dashboard", { space: currentSpace.slug })
        : fallbackHref;
    const timelineHref = currentSpace
        ? route("timeline.index", { space: currentSpace.slug })
        : fallbackHref;
    const dailyHref = currentSpace
        ? route("daily.index", { space: currentSpace.slug })
        : fallbackHref;
    const galleryHref = currentSpace
        ? route("gallery.index", { space: currentSpace.slug })
        : fallbackHref;
    const spotifyHref = currentSpace
        ? route("spotify.companion", { space: currentSpace.slug })
        : fallbackHref;
    const memoryLaneManageHref = currentSpace
        ? route("memory-lane.edit", { space: currentSpace.slug })
        : fallbackHref;
    const isSpaceOwner = currentSpace?.is_owner ?? false;
    const partnerFeaturesLocked =
        currentSpace !== null && currentSpace.has_partner === false;
    const lockedTooltip =
        navigation.locked_tooltip ??
        "Fitur couple akan aktif setelah pasanganmu bergabung.";
    const ownerOnlyTooltip =
        navigation.owner_only_tooltip ??
        "Hanya pemilik space yang dapat mengakses menu ini.";

    const navClass = (locked: boolean) =>
        `inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium leading-5 transition duration-150 ease-in-out ${
            locked
                ? "cursor-not-allowed text-gray-300 pointer-events-none"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:text-gray-700 focus:border-gray-300"
        }`;
    const currentYear = new Date().getFullYear();
    const baseLoveCursor: LoveCursorConfig = {
        color: "#f472b6",
        heartCount: 30,
        className: "opacity-45",
    };
    const loveCursorConfig: LoveCursorConfig =
        loveCursor === undefined || loveCursor === false
            ? baseLoveCursor
            : loveCursor;
    const showLoveCursor = loveCursor !== false;

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex flex-col">
            {showLoveCursor && <LoveCursorCanvas {...loveCursorConfig} />}
            <nav className="bg-white border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="shrink-0 flex items-center">
                                <Link href="/dashboard">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-pink-600" />
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex">
                                <Link
                                    href={dashboardHref}
                                    className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 text-gray-900 focus:outline-none focus:border-pink-700 transition duration-150 ease-in-out"
                                >
                                    {navigation.dashboard ?? "Dashboard"}
                                </Link>
                                <Link
                                    href={timelineHref}
                                    className={navClass(partnerFeaturesLocked)}
                                    title={partnerFeaturesLocked ? lockedTooltip : undefined}
                                >
                                    <span className="flex items-center gap-1">
                                        {partnerFeaturesLocked && (
                                            <Lock className="h-3 w-3 text-gray-400" aria-hidden="true" />
                                        )}
                                        {navigation.timeline ?? "Timeline"}
                                    </span>
                                </Link>
                                <Link
                                    href={dailyHref}
                                    className={navClass(partnerFeaturesLocked)}
                                    title={partnerFeaturesLocked ? lockedTooltip : undefined}
                                >
                                    <span className="flex items-center gap-1">
                                        {partnerFeaturesLocked && (
                                            <Lock className="h-3 w-3 text-gray-400" aria-hidden="true" />
                                        )}
                                        {navigation.daily_messages ?? "Daily Message"}
                                    </span>
                                </Link>
                                <Link
                                    href={galleryHref}
                                    className={navClass(partnerFeaturesLocked)}
                                    title={partnerFeaturesLocked ? lockedTooltip : undefined}
                                >
                                    <span className="flex items-center gap-1">
                                        {partnerFeaturesLocked && (
                                            <Lock className="h-3 w-3 text-gray-400" aria-hidden="true" />
                                        )}
                                        {navigation.gallery ?? "Gallery"}
                                    </span>
                                </Link>
                                <Link
                                    href={memoryLaneManageHref}
                                    className={navClass(!isSpaceOwner)}
                                    title={!isSpaceOwner ? ownerOnlyTooltip : undefined}
                                >
                                    <span className="flex items-center gap-1">
                                        {!isSpaceOwner && (
                                            <Lock className="h-3 w-3 text-gray-400" aria-hidden="true" />
                                        )}
                                        {navigation.memory_lane ?? "Memory Lane"}
                                    </span>
                                </Link>
                                <Link
                                    href={spotifyHref}
                                    className={navClass(partnerFeaturesLocked)}
                                    title={partnerFeaturesLocked ? lockedTooltip : undefined}
                                >
                                    <span className="flex items-center gap-1">
                                        {partnerFeaturesLocked && (
                                            <Lock className="h-3 w-3 text-gray-400" aria-hidden="true" />
                                        )}
                                        {navigation.spotify ?? "Spotify Kit"}
                                    </span>
                                </Link>
                            </div>
                        </div>

                        <div className="hidden sm:flex sm:items-center sm:ml-6">
                            {spaces.length > 0 && (
                                <div className="mr-4">
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <span className="inline-flex rounded-md">
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-purple-600 bg-purple-50 hover:bg-purple-100 focus:outline-none transition ease-in-out duration-150"
                                                >
                                                    {currentSpace
                                                        ? currentSpace.title
                                                        : navigation.choose_space ?? "Pilih Space"}
                                                    <svg
                                                        className="ml-2 -mr-0.5 h-4 w-4"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </button>
                                            </span>
                                        </Dropdown.Trigger>

                                        <Dropdown.Content align="right">
                                            {spaces.map((space) => (
                                                <Dropdown.Link
                                                    key={space.id}
                                                    href={route(
                                                        "spaces.dashboard",
                                                        { space: space.slug },
                                                    )}
                                                >
                                                    {space.title}
                                                </Dropdown.Link>
                                            ))}
                                            <Dropdown.Link
                                                href={route("spaces.index")}
                                            >
                                                + {navigation.manage_spaces ?? "Kelola Spaces"}
                                            </Dropdown.Link>
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>
                            )}
                            {availableLocales.length > 0 && (
                                <div className="mr-4">
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <span className="inline-flex rounded-md">
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center gap-2 px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-600 bg-white hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-200 transition ease-in-out duration-150"
                                                    aria-label={languageLabel}
                                                >
                                                    <Globe
                                                        className="h-4 w-4 text-purple-500"
                                                        aria-hidden="true"
                                                    />
                                                    <span>{activeLanguageLabel}</span>
                                                    <svg
                                                        className="ml-1 -mr-1 h-4 w-4 text-gray-400"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </button>
                                            </span>
                                        </Dropdown.Trigger>

                                        <Dropdown.Content align="right">
                                            {availableLocales.map((locale) => {
                                                const isActive = locale === activeLocale;
                                                return (
                                                    <Dropdown.Link
                                                        key={locale}
                                                        href={route("locale.switch")}
                                                        method="post"
                                                        as="button"
                                                        data={{ locale }}
                                                        className={
                                                            isActive
                                                                ? "bg-purple-50 text-purple-600"
                                                                : ""
                                                        }
                                                    >
                                                        <span className="flex items-center justify-between gap-2">
                                                            <span>
                                                                {languageOptions[locale] ??
                                                                    locale.toUpperCase()}
                                                            </span>
                                                            {isActive && (
                                                                <Check
                                                                    className="h-3 w-3"
                                                                    aria-hidden="true"
                                                                />
                                                            )}
                                                        </span>
                                                    </Dropdown.Link>
                                                );
                                            })}
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>
                            )}
                            <div className="ml-3 relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none transition ease-in-out duration-150"
                                            >
                                                {`${
                                                    props.auth?.user?.name ||
                                                    userStrings.fallback_name ||
                                                    "User"
                                                }`}
                                                <svg
                                                    className="ml-2 -mr-0.5 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link
                                            href={route("profile.edit")}
                                        >
                                            {navigation.profile ?? "Profile"}
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route("logout")}
                                            method="post"
                                            as="button"
                                        >
                                            {navigation.logout ?? "Log Out"}
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-mr-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState
                                    )
                                }
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? "block"
                                                : "hidden"
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? "block"
                                                : "hidden"
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? "block" : "hidden") +
                        " sm:hidden"
                    }
                >
                    <div className="pt-2 pb-3 space-y-1">
                        <ResponsiveNavLink
                            href={dashboardHref}
                            active={route().current("spaces.dashboard")}
                        >
                            {navigation.dashboard ?? "Dashboard"}
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={timelineHref}
                            active={route().current("timeline.index")}
                            className={partnerFeaturesLocked ? "opacity-40 pointer-events-none" : ""}
                            title={partnerFeaturesLocked ? lockedTooltip : undefined}
                        >
                            <span className="flex items-center gap-2">
                                {partnerFeaturesLocked && (
                                    <Lock className="h-4 w-4 text-gray-400" aria-hidden="true" />
                                )}
                                {navigation.timeline ?? "Timeline"}
                            </span>
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={dailyHref}
                            active={route().current("daily.index")}
                            className={partnerFeaturesLocked ? "opacity-40 pointer-events-none" : ""}
                            title={partnerFeaturesLocked ? lockedTooltip : undefined}
                        >
                            <span className="flex items-center gap-2">
                                {partnerFeaturesLocked && (
                                    <Lock className="h-4 w-4 text-gray-400" aria-hidden="true" />
                                )}
                                {navigation.daily_messages ?? "Daily Message"}
                            </span>
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={galleryHref}
                            active={route().current("gallery.index")}
                            className={partnerFeaturesLocked ? "opacity-40 pointer-events-none" : ""}
                            title={partnerFeaturesLocked ? lockedTooltip : undefined}
                        >
                            <span className="flex items-center gap-2">
                                {partnerFeaturesLocked && (
                                    <Lock className="h-4 w-4 text-gray-400" aria-hidden="true" />
                                )}
                                {navigation.gallery ?? "Gallery"}
                            </span>
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={memoryLaneManageHref}
                            active={route().current("memory-lane.edit")}
                            className={!isSpaceOwner ? "opacity-40 pointer-events-none" : ""}
                            title={!isSpaceOwner ? ownerOnlyTooltip : undefined}
                        >
                            <span className="flex items-center gap-2">
                                {!isSpaceOwner && (
                                    <Lock className="h-4 w-4 text-gray-400" aria-hidden="true" />
                                )}
                                {navigation.memory_lane ?? "Memory Lane"}
                            </span>
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={spotifyHref}
                            active={route().current("spotify.companion")}
                            className={partnerFeaturesLocked ? "opacity-40 pointer-events-none" : ""}
                            title={partnerFeaturesLocked ? lockedTooltip : undefined}
                        >
                            <span className="flex items-center gap-2">
                                {partnerFeaturesLocked && (
                                    <Lock className="h-4 w-4 text-gray-400" aria-hidden="true" />
                                )}
                                {navigation.spotify ?? "Spotify Kit"}
                            </span>
                        </ResponsiveNavLink>
                    </div>

                    <div className="pt-4 pb-1 border-t border-gray-200">
                        <div className="px-4">
                            <div className="font-medium text-base text-gray-800">
                                {user?.name}
                            </div>
                            <div className="font-medium text-sm text-gray-500">
                                {user?.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route("profile.edit")}>
                                {navigation.profile ?? "Profile"}
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route("logout")}
                                as="button"
                            >
                                {navigation.logout ?? "Log Out"}
                            </ResponsiveNavLink>
                        </div>
                        {availableLocales.length > 0 && (
                            <div className="mt-6 border-t border-gray-200 pt-4">
                                <div className="px-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    {languageLabel}
                                </div>
                                <div className="mt-2 space-y-1">
                                    {availableLocales.map((locale) => {
                                        const isActive = locale === activeLocale;
                                        return (
                                            <ResponsiveNavLink
                                                key={locale}
                                                href={route("locale.switch")}
                                                method="post"
                                                as="button"
                                                data={{ locale }}
                                                active={isActive}
                                            >
                                                <span className="flex w-full items-center justify-between gap-2">
                                                    {languageOptions[locale] ??
                                                        locale.toUpperCase()}
                                                    {isActive && (
                                                        <Check
                                                            className="h-4 w-4"
                                                            aria-hidden="true"
                                                        />
                                                    )}
                                                </span>
                                            </ResponsiveNavLink>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <div className="flex-1 flex flex-col">
                {header && (
                    <header className="bg-white shadow">
                        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </header>
                )}

                <main className="flex-1 pt-8 pb-6">{children}</main>
            </div>

            <footer className="mt-auto w-full border-t border-pink-100 bg-white/90 py-3 text-center text-sm text-gray-600">
                <span className="font-medium text-pink-500">MySpaceLove</span> © {currentYear} • Made with ❤️ by Peng for Winnie
            </footer>
        </div>
    );
}
