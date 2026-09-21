import axios from 'axios';
import { router } from '@inertiajs/react';

window.axios = axios;

// Inertia v1 automatically reads <meta name="csrf-token"> and sends
// X-CSRF-TOKEN header on all Inertia requests. No extra setup needed.

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.withCredentials = true;

const csrfToken = document.head.querySelector('meta[name="csrf-token"]');

if (csrfToken) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken.getAttribute('content');
} else {
    console.error('CSRF token not found: Ensure @csrf directive is used in your main Blade template.');
}

// Synchronize Ziggy URL with current page origin so route() works correctly
if (typeof window !== 'undefined' && window.Ziggy) {
    try {
        const currentUrl = new URL(window.location.href);

        if (currentUrl.origin !== window.Ziggy.url) {
            window.Ziggy = {
                ...window.Ziggy,
                url: currentUrl.origin,
                port: currentUrl.port ? Number(currentUrl.port) : null,
            };
        }
    } catch (error) {
        console.warn('Unable to synchronize Ziggy base URL.', error);
    }
}
