// vite.config.js
import { defineConfig } from "file:///D:/PROJECT%202026/MySpaceLove/node_modules/vite/dist/node/index.js";
import laravel from "file:///D:/PROJECT%202026/MySpaceLove/node_modules/laravel-vite-plugin/dist/index.js";
import react from "file:///D:/PROJECT%202026/MySpaceLove/node_modules/@vitejs/plugin-react/dist/index.js";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
var __vite_injected_original_import_meta_url = "file:///D:/PROJECT%202026/MySpaceLove/vite.config.js";
var basePath = fileURLToPath(new URL(".", __vite_injected_original_import_meta_url));
var vite_config_default = defineConfig({
  resolve: {
    alias: {
      "@": resolve(basePath, "resources/js"),
      // Force all React imports to use the same instance
      "react": resolve(basePath, "node_modules/react"),
      "react-dom": resolve(basePath, "node_modules/react-dom")
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "scheduler"
    ]
  },
  plugins: [
    laravel({
      input: "resources/js/app.tsx",
      refresh: true
    }),
    react({
      // Enable Fast Refresh
      fastRefresh: true,
      // Optimize JSX runtime
      jsxRuntime: "automatic"
    })
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
          if (id.includes("node_modules")) {
            if (id.includes("/@inertiajs/")) {
              return "inertia";
            }
            if (id.includes("/@headlessui/") || id.includes("/lucide-react/")) {
              return "ui-libs";
            }
            if (id.includes("/react-pdf/")) {
              return "pdf";
            }
            if (id.includes("/react-spring/") || id.includes("/react-use-gesture/")) {
              return "animation";
            }
            if (id.includes("/@jitsi/")) {
              return "video";
            }
            if (id.includes("/react-pageflip/")) {
              return "flipbook";
            }
            if (id.includes("/react-beautiful-dnd/")) {
              return "dnd";
            }
            if (id.includes("/@gsap/")) {
              return "animation";
            }
            if (id.includes("/gsap/")) {
              return "animation";
            }
            if (id.includes("/framer-motion/")) {
              return "animation";
            }
            return "vendor";
          }
          if (id.includes("Pages/Games/")) {
            return "games";
          }
        },
        // Optimize chunk naming
        chunkFileNames: "js/[name]-[hash].js",
        entryFileNames: "js/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split(".");
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
        }
      }
    },
    // Enable minification
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info", "console.debug"],
        // Remove specific console methods
        passes: 2
        // Multiple passes for better compression
      },
      mangle: {
        safari10: true
        // Fix Safari 10 issues
      },
      format: {
        comments: false
        // Remove all comments
      }
    },
    // Disable source maps for production (smaller bundle)
    sourcemap: false,
    // Target modern browsers for smaller output
    target: "es2020",
    // Optimize CSS
    cssMinify: true,
    // Optimize assets
    assetsInlineLimit: 4096,
    // Inline assets smaller than 4kb
    // Report compressed size
    reportCompressedSize: true
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "scheduler",
      "@inertiajs/react",
      "@headlessui/react",
      "lucide-react",
      "react-spring",
      "react-use-gesture",
      "framer-motion",
      "gsap",
      "@gsap/react"
    ],
    exclude: [
      // Exclude heavy dependencies from pre-bundling
      "leaflet",
      "react-pdf",
      "@jitsi/react-sdk"
    ],
    // Force re-optimization to clear any cached issues
    force: true,
    esbuildOptions: {
      // Ensure React is treated as external in optimized deps
      mainFields: ["module", "main"]
    }
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    hmr: {
      host: "127.0.0.1"
    },
    // Optimize dev server
    watch: {
      usePolling: false,
      ignored: ["**/node_modules/**", "**/storage/**", "**/vendor/**"]
    },
    proxy: {
      "/storage": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true
      },
      "/sanctum": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        secure: false
      },
      "/spaces": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        secure: false
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxQUk9KRUNUIDIwMjZcXFxcTXlTcGFjZUxvdmVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXFBST0pFQ1QgMjAyNlxcXFxNeVNwYWNlTG92ZVxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovUFJPSkVDVCUyMDIwMjYvTXlTcGFjZUxvdmUvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcclxuaW1wb3J0IGxhcmF2ZWwgZnJvbSAnbGFyYXZlbC12aXRlLXBsdWdpbic7XHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XHJcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGggfSBmcm9tICdub2RlOnVybCc7XHJcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdub2RlOnBhdGgnO1xyXG5cclxuY29uc3QgYmFzZVBhdGggPSBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4nLCBpbXBvcnQubWV0YS51cmwpKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgYWxpYXM6IHtcclxuICAgICAgICAgICAgJ0AnOiByZXNvbHZlKGJhc2VQYXRoLCAncmVzb3VyY2VzL2pzJyksXHJcbiAgICAgICAgICAgIC8vIEZvcmNlIGFsbCBSZWFjdCBpbXBvcnRzIHRvIHVzZSB0aGUgc2FtZSBpbnN0YW5jZVxyXG4gICAgICAgICAgICAncmVhY3QnOiByZXNvbHZlKGJhc2VQYXRoLCAnbm9kZV9tb2R1bGVzL3JlYWN0JyksXHJcbiAgICAgICAgICAgICdyZWFjdC1kb20nOiByZXNvbHZlKGJhc2VQYXRoLCAnbm9kZV9tb2R1bGVzL3JlYWN0LWRvbScpLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGVkdXBlOiBbXHJcbiAgICAgICAgICAgICdyZWFjdCcsIFxyXG4gICAgICAgICAgICAncmVhY3QtZG9tJyxcclxuICAgICAgICAgICAgJ3JlYWN0L2pzeC1ydW50aW1lJyxcclxuICAgICAgICAgICAgJ3JlYWN0L2pzeC1kZXYtcnVudGltZScsXHJcbiAgICAgICAgICAgICdzY2hlZHVsZXInLFxyXG4gICAgICAgIF0sXHJcbiAgICB9LFxyXG4gICAgcGx1Z2luczogW1xyXG4gICAgICAgIGxhcmF2ZWwoe1xyXG4gICAgICAgICAgICBpbnB1dDogJ3Jlc291cmNlcy9qcy9hcHAudHN4JyxcclxuICAgICAgICAgICAgcmVmcmVzaDogdHJ1ZSxcclxuICAgICAgICB9KSxcclxuICAgICAgICByZWFjdCh7XHJcbiAgICAgICAgICAgIC8vIEVuYWJsZSBGYXN0IFJlZnJlc2hcclxuICAgICAgICAgICAgZmFzdFJlZnJlc2g6IHRydWUsXHJcbiAgICAgICAgICAgIC8vIE9wdGltaXplIEpTWCBydW50aW1lXHJcbiAgICAgICAgICAgIGpzeFJ1bnRpbWU6ICdhdXRvbWF0aWMnLFxyXG4gICAgICAgIH0pLFxyXG4gICAgXSxcclxuICAgIGJ1aWxkOiB7XHJcbiAgICAgICAgLy8gT3B0aW1pemUgY2h1bmsgc2l6ZVxyXG4gICAgICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogNjAwLFxyXG4gICAgICAgIC8vIEVuYWJsZSBDU1MgY29kZSBzcGxpdHRpbmdcclxuICAgICAgICBjc3NDb2RlU3BsaXQ6IHRydWUsXHJcbiAgICAgICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICAgICAgICBvdXRwdXQ6IHtcclxuICAgICAgICAgICAgICAgIC8vIE1hbnVhbCBjaHVuayBzcGxpdHRpbmcgZm9yIGJldHRlciBjYWNoaW5nIGFuZCBsYXp5IGxvYWRpbmdcclxuICAgICAgICAgICAgICAgIG1hbnVhbENodW5rczogKGlkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJbmVydGlhLmpzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnL0BpbmVydGlhanMvJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnaW5lcnRpYSc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFVJIGxpYnJhcmllcyAobGF6eSBsb2FkZWQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnL0BoZWFkbGVzc3VpLycpIHx8IGlkLmluY2x1ZGVzKCcvbHVjaWRlLXJlYWN0LycpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ3VpLWxpYnMnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBIZWF2eSBmZWF0dXJlIGNodW5rcyAobGF6eSBsb2FkZWQpXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJy9yZWFjdC1wZGYvJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAncGRmJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJy9yZWFjdC1zcHJpbmcvJykgfHwgaWQuaW5jbHVkZXMoJy9yZWFjdC11c2UtZ2VzdHVyZS8nKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdhbmltYXRpb24nO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnL0BqaXRzaS8nKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICd2aWRlbyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCcvcmVhY3QtcGFnZWZsaXAvJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnZmxpcGJvb2snO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnL3JlYWN0LWJlYXV0aWZ1bC1kbmQvJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnZG5kJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJy9AZ3NhcC8nKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdhbmltYXRpb24nO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnL2dzYXAvJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnYW5pbWF0aW9uJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJy9mcmFtZXItbW90aW9uLycpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ2FuaW1hdGlvbic7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE90aGVyIHZlbmRvciBjb2RlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAndmVuZG9yJztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gR2FtZSBjb21wb25lbnRzIChsYXp5IGxvYWRlZClcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ1BhZ2VzL0dhbWVzLycpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnZ2FtZXMnO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAvLyBPcHRpbWl6ZSBjaHVuayBuYW1pbmdcclxuICAgICAgICAgICAgICAgIGNodW5rRmlsZU5hbWVzOiAnanMvW25hbWVdLVtoYXNoXS5qcycsXHJcbiAgICAgICAgICAgICAgICBlbnRyeUZpbGVOYW1lczogJ2pzL1tuYW1lXS1baGFzaF0uanMnLFxyXG4gICAgICAgICAgICAgICAgYXNzZXRGaWxlTmFtZXM6IChhc3NldEluZm8pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBpbmZvID0gYXNzZXRJbmZvLm5hbWUuc3BsaXQoJy4nKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBleHQgPSBpbmZvW2luZm8ubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKC9cXC4ocG5nfGpwZT9nfHN2Z3xnaWZ8dGlmZnxibXB8aWNvfHdlYnApJC9pLnRlc3QoYXNzZXRJbmZvLm5hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBgaW1hZ2VzL1tuYW1lXS1baGFzaF0uJHtleHR9YDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKC9cXC4od29mZjI/fGVvdHx0dGZ8b3RmKSQvaS50ZXN0KGFzc2V0SW5mby5uYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYGZvbnRzL1tuYW1lXS1baGFzaF0uJHtleHR9YDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKC9cXC5jc3MkL2kudGVzdChhc3NldEluZm8ubmFtZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGBjc3MvW25hbWVdLVtoYXNoXS4ke2V4dH1gO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYGFzc2V0cy9bbmFtZV0tW2hhc2hdLiR7ZXh0fWA7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8gRW5hYmxlIG1pbmlmaWNhdGlvblxyXG4gICAgICAgIG1pbmlmeTogJ3RlcnNlcicsXHJcbiAgICAgICAgdGVyc2VyT3B0aW9uczoge1xyXG4gICAgICAgICAgICBjb21wcmVzczoge1xyXG4gICAgICAgICAgICAgICAgZHJvcF9jb25zb2xlOiB0cnVlLCAvLyBSZW1vdmUgY29uc29sZS5sb2cgaW4gcHJvZHVjdGlvblxyXG4gICAgICAgICAgICAgICAgZHJvcF9kZWJ1Z2dlcjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHB1cmVfZnVuY3M6IFsnY29uc29sZS5sb2cnLCAnY29uc29sZS5pbmZvJywgJ2NvbnNvbGUuZGVidWcnXSwgLy8gUmVtb3ZlIHNwZWNpZmljIGNvbnNvbGUgbWV0aG9kc1xyXG4gICAgICAgICAgICAgICAgcGFzc2VzOiAyLCAvLyBNdWx0aXBsZSBwYXNzZXMgZm9yIGJldHRlciBjb21wcmVzc2lvblxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBtYW5nbGU6IHtcclxuICAgICAgICAgICAgICAgIHNhZmFyaTEwOiB0cnVlLCAvLyBGaXggU2FmYXJpIDEwIGlzc3Vlc1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBmb3JtYXQ6IHtcclxuICAgICAgICAgICAgICAgIGNvbW1lbnRzOiBmYWxzZSwgLy8gUmVtb3ZlIGFsbCBjb21tZW50c1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8gRGlzYWJsZSBzb3VyY2UgbWFwcyBmb3IgcHJvZHVjdGlvbiAoc21hbGxlciBidW5kbGUpXHJcbiAgICAgICAgc291cmNlbWFwOiBmYWxzZSxcclxuICAgICAgICAvLyBUYXJnZXQgbW9kZXJuIGJyb3dzZXJzIGZvciBzbWFsbGVyIG91dHB1dFxyXG4gICAgICAgIHRhcmdldDogJ2VzMjAyMCcsXHJcbiAgICAgICAgLy8gT3B0aW1pemUgQ1NTXHJcbiAgICAgICAgY3NzTWluaWZ5OiB0cnVlLFxyXG4gICAgICAgIC8vIE9wdGltaXplIGFzc2V0c1xyXG4gICAgICAgIGFzc2V0c0lubGluZUxpbWl0OiA0MDk2LCAvLyBJbmxpbmUgYXNzZXRzIHNtYWxsZXIgdGhhbiA0a2JcclxuICAgICAgICAvLyBSZXBvcnQgY29tcHJlc3NlZCBzaXplXHJcbiAgICAgICAgcmVwb3J0Q29tcHJlc3NlZFNpemU6IHRydWUsXHJcbiAgICB9LFxyXG4gICAgLy8gT3B0aW1pemUgZGVwZW5kZW5jaWVzXHJcbiAgICBvcHRpbWl6ZURlcHM6IHtcclxuICAgICAgICBpbmNsdWRlOiBbXHJcbiAgICAgICAgICAgICdyZWFjdCcsXHJcbiAgICAgICAgICAgICdyZWFjdC1kb20nLFxyXG4gICAgICAgICAgICAncmVhY3QvanN4LXJ1bnRpbWUnLFxyXG4gICAgICAgICAgICAncmVhY3QvanN4LWRldi1ydW50aW1lJyxcclxuICAgICAgICAgICAgJ3NjaGVkdWxlcicsXHJcbiAgICAgICAgICAgICdAaW5lcnRpYWpzL3JlYWN0JyxcclxuICAgICAgICAgICAgJ0BoZWFkbGVzc3VpL3JlYWN0JyxcclxuICAgICAgICAgICAgJ2x1Y2lkZS1yZWFjdCcsXHJcbiAgICAgICAgICAgICdyZWFjdC1zcHJpbmcnLFxyXG4gICAgICAgICAgICAncmVhY3QtdXNlLWdlc3R1cmUnLFxyXG4gICAgICAgICAgICAnZnJhbWVyLW1vdGlvbicsXHJcbiAgICAgICAgICAgICdnc2FwJyxcclxuICAgICAgICAgICAgJ0Bnc2FwL3JlYWN0JyxcclxuICAgICAgICBdLFxyXG4gICAgICAgIGV4Y2x1ZGU6IFtcclxuICAgICAgICAgICAgLy8gRXhjbHVkZSBoZWF2eSBkZXBlbmRlbmNpZXMgZnJvbSBwcmUtYnVuZGxpbmdcclxuICAgICAgICAgICAgJ2xlYWZsZXQnLFxyXG4gICAgICAgICAgICAncmVhY3QtcGRmJyxcclxuICAgICAgICAgICAgJ0BqaXRzaS9yZWFjdC1zZGsnLFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgLy8gRm9yY2UgcmUtb3B0aW1pemF0aW9uIHRvIGNsZWFyIGFueSBjYWNoZWQgaXNzdWVzXHJcbiAgICAgICAgZm9yY2U6IHRydWUsXHJcbiAgICAgICAgZXNidWlsZE9wdGlvbnM6IHtcclxuICAgICAgICAgICAgLy8gRW5zdXJlIFJlYWN0IGlzIHRyZWF0ZWQgYXMgZXh0ZXJuYWwgaW4gb3B0aW1pemVkIGRlcHNcclxuICAgICAgICAgICAgbWFpbkZpZWxkczogWydtb2R1bGUnLCAnbWFpbiddLFxyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgc2VydmVyOiB7XHJcbiAgICAgICAgaG9zdDogJzAuMC4wLjAnLFxyXG4gICAgICAgIHBvcnQ6IDUxNzMsXHJcbiAgICAgICAgaG1yOiB7XHJcbiAgICAgICAgICAgIGhvc3Q6ICcxMjcuMC4wLjEnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8gT3B0aW1pemUgZGV2IHNlcnZlclxyXG4gICAgICAgIHdhdGNoOiB7XHJcbiAgICAgICAgICAgIHVzZVBvbGxpbmc6IGZhbHNlLFxyXG4gICAgICAgICAgICBpZ25vcmVkOiBbJyoqL25vZGVfbW9kdWxlcy8qKicsICcqKi9zdG9yYWdlLyoqJywgJyoqL3ZlbmRvci8qKiddLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcHJveHk6IHtcclxuICAgICAgICAgICAgJy9zdG9yYWdlJzoge1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0OiAnaHR0cDovLzEyNy4wLjAuMTo4MDAwJyxcclxuICAgICAgICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgJy9zYW5jdHVtJzoge1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0OiAnaHR0cDovLzEyNy4wLjAuMTo4MDAwJyxcclxuICAgICAgICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHNlY3VyZTogZmFsc2UsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICcvc3BhY2VzJzoge1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0OiAnaHR0cDovLzEyNy4wLjAuMTo4MDAwJyxcclxuICAgICAgICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHNlY3VyZTogZmFsc2UsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTJRLFNBQVMsb0JBQW9CO0FBQ3hTLE9BQU8sYUFBYTtBQUNwQixPQUFPLFdBQVc7QUFDbEIsU0FBUyxxQkFBcUI7QUFDOUIsU0FBUyxlQUFlO0FBSjJJLElBQU0sMkNBQTJDO0FBTXBOLElBQU0sV0FBVyxjQUFjLElBQUksSUFBSSxLQUFLLHdDQUFlLENBQUM7QUFFNUQsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDeEIsU0FBUztBQUFBLElBQ0wsT0FBTztBQUFBLE1BQ0gsS0FBSyxRQUFRLFVBQVUsY0FBYztBQUFBO0FBQUEsTUFFckMsU0FBUyxRQUFRLFVBQVUsb0JBQW9CO0FB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
