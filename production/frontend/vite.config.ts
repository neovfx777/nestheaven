import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    host: "0.0.0.0", // 🔥 tashqaridan ochilishi uchun
    port: 5173,
    strictPort: true,

    proxy: {
      "/api": {
        target: "http://45.92.173.175:3000", // ✅ BACKEND IP
        changeOrigin: true,
        secure: false,
      },
      "/uploads": {
        target: "http://45.92.173.175:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },

  preview: {
    host: "0.0.0.0",
    port: 4173,
    strictPort: true,
  },

  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
