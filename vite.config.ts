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
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});