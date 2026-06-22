import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  return {
    plugins: [react(), tailwindcss()],
    // Kalau di-build (npm run build) = '/eportal/'
    // Kalau di-dev (npm run dev) = '/'
    base: command === "build" ? "/eportal/" : "/",
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});