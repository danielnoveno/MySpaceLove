import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    const currentYear = new Date().getFullYear();

    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-pink-100/80 via-white to-purple-100/70">
            <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-md">
                    <div className="flex justify-center">
                        <Link href="/" aria-label="Kembali ke halaman utama MySpaceLove">
                            <ApplicationLogo className="h-16 w-auto text-pink-500" />
                        </Link>
                    </div>

                    <div className="mt-8 overflow-hidden rounded-3xl bg-white/90 p-8 shadow-xl ring-1 ring-white/40 backdrop-blur">
                        {children}
                    </div>
                </div>
            </div>

            <footer className="py-6 text-center text-sm text-purple-500/80">
                Made with ❤️ by Peng for Winnie &copy; {currentYear}
            </footer>
        </div>
    );
}
