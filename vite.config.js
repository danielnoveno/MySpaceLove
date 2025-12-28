import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const basePath = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
    resolve: {
        alias: {
            '@': resolve(basePath, 'resources/js'),
        },
        dedupe: ['react', 'react-dom'],
    },
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            refresh: true,
        }),
        react({
            // Enable Fast Refresh
            fastRefresh: true,
            // Optimize JSX runtime
            jsxRuntime: 'automatic',
        }),
    ],
    build: {
        // Optimize chunk size
        chunkSizeWarningLimit: 600,
        // Enable CSS code splitting
        cssCodeSplit: true,
        rollupOptions: {
            output: {
                // Manual chunk splitting for better caching and lazy loading
                manualChunks: (id) => {
                    // CRITICAL: React core must be detected first and loaded before everything else
                    // Use flexible matching to catch ALL React-related modules
                    if (id.includes('node_modules')) {
                        // Match any React or React-DOM module (including subdirectories)
                        if (
                            id.includes('/react/') || 
                            id.includes('/react-dom/') || 
                            id.includes('/scheduler/') ||
                            id.match(/\/react\//) ||
                            id.match(/\/react-dom\//) ||
                            id.match(/node_modules\/react$/) ||
                            id.match(/node_modules\/react-dom$/)
                        ) {
                            return 'react-core';
                        }
                        
                        // Inertia.js
                        if (id.includes('/@inertiajs/')) {
                            return 'inertia';
                        }
                        
                        // UI libraries (lazy loaded)
                        if (id.includes('/@headlessui/') || id.includes('/lucide-react/')) {
                            return 'ui-libs';
                        }
                        
                        // Heavy feature chunks (lazy loaded)
                        if (id.includes('/leaflet/') || id.includes('/react-leaflet/')) {
                            return 'maps';
                        }
                        if (id.includes('/react-pdf/')) {
                            return 'pdf';
                        }
                        if (id.includes('/react-spring/') || id.includes('/react-use-gesture/')) {
                            return 'animation';
                        }
                        if (id.includes('/@jitsi/')) {
                            return 'video';
                        }
                        if (id.includes('/react-pageflip/')) {
                            return 'flipbook';
                        }
                        if (id.includes('/react-beautiful-dnd/')) {
                            return 'dnd';
                        }
                        if (id.includes('/@gsap/')) {
                            return 'animation';
                        }
                        if (id.includes('/gsap/')) {
                            return 'animation';
                        }
                        if (id.includes('/framer-motion/')) {
                            return 'animation';
                        }
                        
                        // Other vendor code
                        return 'vendor';
                    }
                    
                    // Game components (lazy loaded)
                    if (id.includes('Pages/Games/')) {
                        return 'games';
                    }
                },
                // Optimize chunk naming
                chunkFileNames: 'js/[name]-[hash].js',
                entryFileNames: 'js/[name]-[hash].js',
                assetFileNames: (assetInfo) => {
                    const info = assetInfo.name.split('.');
                    const ext = info[info.length - 1];
                    if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico|webp)$/i.test(assetInfo.name)) {
                        return `images/[name]-[hash].${ext}`;
                    }
                    if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
                        return `fonts/[name]-[hash].${ext}`;
                    }
                    if (/\.css$/i.test(assetInfo.name)) {
                        return `css/[name]-[hash].${ext}`;
                    }
                    return `assets/[name]-[hash].${ext}`;
                },
            },
        },
        // Enable minification
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true, // Remove console.log in production
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info', 'console.debug'], // Remove specific console methods
                passes: 2, // Multiple passes for better compression
            },
            mangle: {
                safari10: true, // Fix Safari 10 issues
            },
            format: {
                comments: false, // Remove all comments
            },
        },
        // Disable source maps for production (smaller bundle)
        sourcemap: false,
        // Target modern browsers for smaller output
        target: 'es2020',
        // Optimize CSS
        cssMinify: true,
        // Optimize assets
        assetsInlineLimit: 4096, // Inline assets smaller than 4kb
        // Report compressed size
        reportCompressedSize: true,
    },
    // Optimize dependencies
    optimizeDeps: {
        include: [
            'react',
            'react-dom',
            '@inertiajs/react',
            '@headlessui/react',
            'lucide-react',
            'react-spring',
            'react-use-gesture',
            'framer-motion',
            'gsap',
            '@gsap/react',
        ],
        exclude: [
            // Exclude heavy dependencies from pre-bundling
            'leaflet',
            'react-pdf',
            '@jitsi/react-sdk',
        ],
        force: true,
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        hmr: {
            host: '127.0.0.1',
        },
        // Optimize dev server
        watch: {
            usePolling: false,
            ignored: ['**/node_modules/**', '**/storage/**', '**/vendor/**'],
        },
        proxy: {
            '/storage': {
                target: 'http://127.0.0.1:8081',
                changeOrigin: true,
            },
            '/sanctum': {
                target: 'http://127.0.0.1:8081',
                changeOrigin: true,
                secure: false,
            },
            '/spaces': {
                target: 'http://127.0.0.1:8081',
                changeOrigin: true,
                secure: false,
            },
        },
    },
});
