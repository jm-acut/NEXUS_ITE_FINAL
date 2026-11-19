import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt', // Lab Task 4: ReloadPrompt asks before updating
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'NEXUS Store',
        short_name: 'NEXUS',
        description: 'Mobile-first online store with AI-assisted product discovery.',
        theme_color: '#4f46e5',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        // App shell is precached automatically (HTML, JS, CSS, icons)
        navigateFallback: '/index.html',          // deep links work offline
        navigateFallbackDenylist: [/^\/api/],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // GET /api/v1/products and /api/v1/products/:id
            urlPattern: ({ url }) => url.pathname.startsWith('/api/v1/products'),
            handler: 'NetworkFirst', // fresh stock/prices online, cached copy offline
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
        // /auth, /checkout, /cart, /orders, /webhooks match NO rule, so they are never cached.
        // runtimeCaching only handles GET by default, so POST/PATCH/DELETE are never cached.
      },
    }),
  ],
})