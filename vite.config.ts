import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: process.env.NODE_ENV === "production" ? "/Mirrormind/" : "/",
  plugins: [
    tsconfigPaths(),
    tailwindcss(),
    tanstackStart({
      server: { entry: "src/server.ts" },
      prerender: {
        enabled: true,
        routes: ["/"],
      }
    }),
    react(),
  ],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
