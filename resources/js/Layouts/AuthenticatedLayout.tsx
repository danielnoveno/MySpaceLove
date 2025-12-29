import { PropsWithChildren, useMemo, useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import ApplicationLogo from "@/Components/ApplicationLogo";
import PillNav, { PillNavItem } from "@/Components/PillNav";
import { Bell, Lock, Globe } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import NotificationPopup from "@/Components/NotificationPopup";
import SplashCursor from "@/Components/SplashCursor";

export default function AuthenticatedLayout({
    header,
    children,
    showSplashCursor = false,
    dimNav = false,
}: PropsWithChildren<{
    header?: React.ReactNode;
    showSplashCursor?: boolean;
    dimNav?: boolean;
}>) {
    const { props } = usePage<any>();
    const { spaces, currentSpace, locale, availableLocales, unreadNotificationsCount = 0 } = props;
    const activeSpace = currentSpace || (spaces && spaces.length > 0 ? spaces[0] : null);

    const { translations: layoutTranslations } = useTranslation("layout");
    const languageStrings = (layoutTranslations as any).language ?? {};
    const languageOptions = languageStrings.options ?? {};
    const activeLocaleCode = locale ?? "en";
    
    // Determine target locale (toggle logic)
    const targetLocaleCode = availableLocales.find((l: string) => l !== activeLocaleCode) || activeLocaleCode;
    
    const activeLabel = languageOptions[activeLocaleCode] ?? activeLocaleCode.toUpperCase();
    const targetLabel = languageOptions[targetLocaleCode] ?? targetLocaleCode.toUpperCase();

    const [isLangHovered, setIsLangHovered] = useState(false);

    const items: PillNavItem[] = useMemo(() => {
        const baseItems: PillNavItem[] = [];

        if (activeSpace) {
            baseItems.push({
                id: "dashboard-menu",
                label: "Dashboard",
                href: route("spaces.dashboard", { space: activeSpace.slug }),
            });
            baseItems.push({
                id: "timeline-menu",
                label: "Timeline",
                href: route("timeline.index", { space: activeSpace.slug }),
            });
            baseItems.push({
                id: "daily-menu",
                label: "Daily",
                href: route("daily.index", { space: activeSpace.slug }),
            });
            baseItems.push({
                id: "gallery-menu",
                label: "Gallery",
                href: route("gallery.index", { space: activeSpace.slug }),
            });
             baseItems.push({
                id: "spotify-menu",
                label: "Spotify",
                href: route("spotify.companion", { space: activeSpace.slug }),
            });
             baseItems.push({
                id: "games-menu",
                label: "Games",
                href: route("games.index", { space: activeSpace.slug }),
            });
             // Notifications with Badge and Popup
             baseItems.push({
                id: "notifications-button",
                label: "Notifications",
                href: route("spaces.notifications.index", { space: activeSpace.slug }),
                badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
                dropdownContent: (
                    <NotificationPopup 
                        spaceSlug={activeSpace.slug} 
                        unreadCount={unreadNotificationsCount}
                        translations={layoutTranslations}
                    />
                )
            });
        }

        baseItems.push({
            id: "spaces-menu",
            label: "Spaces",
            href: route("spaces.index"),
        });

         baseItems.push({
            id: "profile-menu",
            label: "Profile",
            href: route("profile.edit"),
            dropdownContent: (
                <div className="w-48 bg-white rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 py-1 overflow-hidden">
                    <Link
                        href={route('profile.edit')}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                    >
                        Profile
                    </Link>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                        Log Out
                    </Link>
                </div>
            )
        });

        return baseItems;
    }, [activeSpace, unreadNotificationsCount, layoutTranslations]);

    const languageSelector = availableLocales && availableLocales.length > 1 ? (
        <div className="flex items-center h-full px-2">
            <Link
                href={route("locale.switch")}
                method="post"
                as="button"
                data={{ locale: targetLocaleCode }}
                className="inline-flex items-center gap-2 px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-full text-pink-600 hover:text-pink-800 bg-pink-50 hover:bg-pink-100 focus:outline-none transition-all ease-in-out duration-300 min-w-[100px] justify-center"
                onMouseEnter={() => setIsLangHovered(true)}
                onMouseLeave={() => setIsLangHovered(false)}
                preserveScroll
            >
                <Globe className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline transition-opacity duration-300">
                    {isLangHovered ? targetLabel : activeLabel}
                </span>
            </Link>
        </div>
    ) : null;

    // Simple active detection based on window location match
    // We try to match the exact href. logic can be improved if needed.
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

    return (
        <div className="h-screen w-full bg-gradient-to-br from-pink-50 via-white to-purple-50 flex flex-col overflow-hidden relative">
            <PillNav
                logo={<ApplicationLogo className="w-3/4 h-3/4 text-pink-500 fill-current" />}
                items={items}
                activeHref={currentUrl}
                baseColor="#ffffff"
                pillColor="#fdf2f8" // pink-50
                pillTextColor="#db2777" // pink-600
                hoveredPillTextColor="#be185d" // pink-700
                className="shadow-sm z-50"
                rightContent={languageSelector}
                dimmed={dimNav}
            />

            {/* Content Area - Flex column to push footer down */}
            <div className="flex-1 flex flex-col overflow-hidden w-full pt-28">
                {/* Scrollable Container */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth custom-scrollbar">
                    {header && (
                        <header className="bg-white/60 backdrop-blur-md shadow-sm sticky top-0 z-30 transition-all duration-300">
                            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                                {header}
                            </div>
                        </header>
                    )}

                    <main className="py-8 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-12rem)]">
                        {children}
                    </main>
                </div>

                <footer className="flex-none w-full border-t border-pink-100 bg-white/80 backdrop-blur py-4 text-center text-sm text-gray-600 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <span className="font-medium text-pink-500">MySpaceLove</span> ©{" "}
                    {new Date().getFullYear()} • Made with ❤️ by Peng for Winnie
                </footer>
            </div>
        </div>
    );
}
