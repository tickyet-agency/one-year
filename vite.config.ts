import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// One React app for web and phone. The PWA plugin makes it installable
// ("Add to Home Screen") and caches it so it opens even with a weak connection.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/apple-touch-icon.png", "images/*.webp"],
      manifest: {
        name: "365 Days of Us",
        short_name: "Us",
        description: "A year of us, in one little app.",
        start_url: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#2a0e18",
        theme_color: "#2a0e18",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      },
      workbox: {
        // content.json and uploaded media are precached too, so her installed app works offline
        globPatterns: ["**/*.{js,css,html,webp,png,svg,woff2,json,mp3}"],
        maximumFileSizeToCacheInBytes: 12 * 1024 * 1024
      }
    })
  ]
});
