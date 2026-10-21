import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { meshMockPlugin } from "../mesh-shop-shared/dev/mockPlugin";

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        meshMockPlugin(),
        VitePWA({
            registerType: "prompt",
            includeAssets: ["icon.svg", "icon-192.png", "icon-512.png"],
            manifest: {
                name: "Mesh Studio",
                short_name: "Mesh Studio",
                description: "Independent design, in a new dimension.",
                theme_color: "#161719",
                background_color: "#161719",
                display: "standalone",
                start_url: "/",
                icons: [
                    { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
                    { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
                ],
            },
            workbox: {
                maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
                navigateFallbackDenylist: [/^\/api/, /^\/__mesh_mock/],
                globPatterns: ["**/*.{js,css,html,svg,png}"],
            },
        }),
    ],
    define: { global: "globalThis" },
    resolve: { dedupe: ["react", "react-dom", "three", "@react-three/fiber"] },
    server: { strictPort: true, proxy: { "/api": { target: "http://localhost:8080", ws: true } } },
    preview: { strictPort: true },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (!id.includes("node_modules")) return;
                    if (id.includes("firebase")) return "firebase";
                    if (id.includes("three") || id.includes("@react-three")) return "scene-engine";
                    if (id.includes("react") || id.includes("scheduler")) return "react-vendor";
                },
            },
        },
        chunkSizeWarningLimit: 1400,
    },
});
