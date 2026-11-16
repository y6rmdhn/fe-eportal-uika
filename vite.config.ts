import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    // Aplikasi sekarang di-serve dari root domain (eportal.uika-bogor.ac.id/),
    // bukan lagi di path /eportal/ seperti sebelum migrasi domain.
    base: "/",
    // Build produksi: tanpa source map & tanpa console.log/debug/info (log API/token
    // tidak boleh terbaca di DevTools pengunjung).
    build: { sourcemap: false },
    esbuild: {
      pure: ["console.log", "console.debug", "console.info"],
      drop: ["debugger"],
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});