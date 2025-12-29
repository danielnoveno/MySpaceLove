import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { router } from '@inertiajs/react';
window.axios = axios;

const readXsrfToken = (): string | null => {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
};

const readMetaCsrfToken = (): string | null => {
    const meta = document.head.querySelector('meta[name="csrf-token"]');
    return meta ? meta.getAttribute('content') : null;
};

const applyXsrfHeader = () => {
    const xsrf = readXsrfToken();
    if (xsrf) {
        window.axios.defaults.headers.common['X-XSRF-TOKEN'] = xsrf;
    }
};

const attachInertiaCsrfHeaders = () => {
    router.on('before', ({ detail }) => {
        const headers = detail.visit.headers;
        const xsrf = readXsrfToken();
        const csrfMeta = readMetaCsrfToken();

        if (xsrf) {
            headers['X-XSRF-TOKEN'] = xsrf;
        }

        if (csrfMeta) {
            headers['X-CSRF-TOKEN'] = csrfMeta;
        }
    });
};

const ensureCsrfCookie = async () => {
    if (readXsrfToken()) {
        return;
    }

    try {
        await window.axios.get('/sanctum/csrf-cookie', { withCredentials: true });
        applyXsrfHeader();
    } catch (error) {
        console.error('Unable to fetch CSRF cookie during bootstrap.', error);
    }
};

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.withCredentials = true; // Ensure cookies are sent
const csrfToken = document.head.querySelector('meta[name="csrf-token"]');

if (csrfToken) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken.getAttribute('content');
} else {
    console.error('CSRF token not found: Ensure @csrf directive is used in your main Blade template.');
}

applyXsrfHeader();
if (typeof window !== 'undefined') {
    attachInertiaCsrfHeaders();
}

declare module 'axios' {
    export interface AxiosRequestConfig {
        _retried?: boolean;
    }
}

if (typeof window !== 'undefined') {
    void ensureCsrfCookie();

    window.axios.interceptors.request.use(
        async (config) => {
            // Ensure CSRF token is always present before making requests
            const xsrf = readXsrfToken();
            const csrfMeta = readMetaCsrfToken();
            
            if (xsrf) {
                config.headers['X-XSRF-TOKEN'] = xsrf;
            }
            
            if (csrfMeta) {
                config.headers['X-CSRF-TOKEN'] = csrfMeta;
            }
            
            return config;
        },
        (error) => Promise.reject(error)
    );

    window.axios.interceptors.response.use(
        (response) => response,
        async (error: AxiosError) => {
            const { response, config } = error;

            if (response?.status === 419 && config && !config._retried) {
                console.warn('CSRF token mismatch (419). Attempting to refresh token and retry...');
                
                try {
                    // Fetch a fresh CSRF cookie
                    await window.axios.get('/sanctum/csrf-cookie', { 
                        withCredentials: true,
                        _retried: true // Prevent infinite loops
                    } as any);
                    
                    // Wait a bit for the cookie to be set
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                    // Re-read tokens after refresh
                    const newXsrf = readXsrfToken();
                    const newCsrfMeta = readMetaCsrfToken();
                    
                    if (newXsrf) {
                        window.axios.defaults.headers.common['X-XSRF-TOKEN'] = newXsrf;
                        config.headers = config.headers || {};
                        config.headers['X-XSRF-TOKEN'] = newXsrf;
                    }
                    
                    if (newCsrfMeta) {
                        window.axios.defaults.headers.common['X-CSRF-TOKEN'] = newCsrfMeta;
                        config.headers = config.headers || {};
                        config.headers['X-CSRF-TOKEN'] = newCsrfMeta;
                    }
                    
                    config._retried = true;
                    console.log('CSRF token refreshed. Retrying request...');
                    return window.axios(config as AxiosRequestConfig);
                } catch (csrfError) {
                    console.error('Unable to refresh CSRF token after 419 response.', csrfError);
                    console.error('Original request config:', config);
                }
            }

            return Promise.reject(error);
        }
    );
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
