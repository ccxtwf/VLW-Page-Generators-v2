import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  server: {
    proxy: {
      '/yt-image-host': {
        target: 'https://i.ytimg.com',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/yt-image-host/, '')
      },
      '/bb-image-host': {
        target: 'http://i0.hdslb.com',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/bb-image-host/, '')
      }
    }
    // cors: {
    //   "origin": "*",
    //   "methods": ['GET', 'HEAD', 'OPTIONS'],
    //   "preflightContinue": true,
    //   "optionsSuccessStatus": 204
    // }
  },
  plugins: [
    wasm(),
    topLevelAwait(),
    react(),
  ],
})
