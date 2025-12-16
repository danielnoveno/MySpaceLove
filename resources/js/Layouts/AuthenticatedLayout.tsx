import { PropsWithChildren } from "react";

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{
    header?: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex flex-col">
            {header && (
                <header className="bg-white shadow">
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main className="flex-1 pt-8 pb-6">{children}</main>

            <footer className="mt-auto w-full border-t border-pink-100 bg-white/90 py-3 text-center text-sm text-gray-600">
                <span className="font-medium text-pink-500">MySpaceLove</span> ©{" "}
                {new Date().getFullYear()} • Made with ❤️ by Peng for Winnie
            </footer>
        </div>
    );
}
