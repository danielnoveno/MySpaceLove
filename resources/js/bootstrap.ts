import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.withCredentials = true; // Ensure cookies are sent
const csrfToken = document.head.querySelector('meta[name="csrf-token"]');

if (csrfToken) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken.getAttribute('content');
} else {
    console.error('CSRF token not found: Ensure @csrf directive is used in your main Blade template.');
}

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
