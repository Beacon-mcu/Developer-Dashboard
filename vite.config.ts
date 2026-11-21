import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5173, strictPort: true },
  build: {
    rollupOptions: {
      output: {
        // The Stellar library is large and only the Playground needs it. Keeping it in its own file stops it from
        // inflating the Playground's code, and browsers cache it separately.
        manualChunks(id) {
          if (id.includes("commonjsHelpers")) return "helpers"; // tiny; keeps the main page from pulling in the Stellar file
          if (id.includes("node_modules/@stellar/")) return "stellar";
        },
      },
    },
  },
});
