import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// Cambia esto si tu repo tiene otro nombre exacto
const repoName = "Video-Prompt-Help";

export default defineConfig({
  base: `/${repoName}/`,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "AI Video Director",
        short_name: "AVD",
        start_url: ".",
        display: "standalone",
        background_color: "#0f172a",
        theme_color: "#4f46e5",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "icons/icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
});