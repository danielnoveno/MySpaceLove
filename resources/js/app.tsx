import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { lazy, Suspense } from 'react';
import { ToastProvider } from '@/Contexts/ToastContext';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Loading fallback component
const PageLoader = () => (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="text-center space-y-4">
            <div className="relative mx-auto h-16 w-16">
                <div className="absolute inset-0 rounded-full border-4 border-pink-200 animate-ping"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-pink-500 animate-spin"></div>
            </div>
            <p className="text-sm font-medium text-gray-600">Loading...</p>
        </div>
    </div>
);

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            [
                `./Pages/${name}.tsx`,
                `./Pages/${name}.ts`,
                `./Pages/${name}.jsx`,
                `./Pages/${name}.js`,
            ],
            import.meta.glob('./Pages/**/*.{js,jsx,ts,tsx}'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        // Wrap App with ToastProvider and Suspense
        root.render(
            <ToastProvider>
                <Suspense fallback={<PageLoader />}>
                    <App {...props} />
                </Suspense>
            </ToastProvider>
        );
    },
    progress: {
        color: '#ec4899',
        showSpinner: true,
    },
});
