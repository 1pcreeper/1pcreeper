import tailwindcss from '@tailwindcss/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ }) => {
    // In AI Studio / Cloud Run container environment, SSL is terminated externally
    // and internal traffic to the dev server must be HTTP on port 3000.
    const isAiStudio = Boolean(process.env.APPLET_ID || process.env.DEFAULT_APP_PORT);
    const useSsl = !isAiStudio && process.env.HTTPS === 'true';

    return {
        plugins: [
            react(),
            tailwindcss(),
            ...(useSsl ? [basicSsl()] : []),
        ],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        server: {
            port: 3000,
            // HMR is disabled in AI Studio via DISABLE_HMR env var.
            // Do not modify this setting.
            hmr: process.env.DISABLE_HMR !== 'true',
            // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
            watch: process.env.DISABLE_HMR === 'true' ? null : {},

            host: true,
        },
    };
});
