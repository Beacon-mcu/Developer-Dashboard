import path from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { buildPrompt } from "./src/lib/prompt";

// The docs page is a web app, so an AI agent that opens its address gets no text. This publishes the same
// "Build with AI" prompt as a plain text file at /llms.txt that any agent can read from a link.
function llmsText(): string {
  return buildPrompt({ clientId: "bcn_app_YOUR_CLIENT_ID", network: "testnet" })
    .replace(/## What I want to build[\s\S]*?(?=## My Beacon app)/, "## What to build\nThe user will tell you what to build.\n\n")
    .replace("- Client ID: bcn_app_YOUR_CLIENT_ID", "- Client ID: ask the user for it (it looks like bcn_app_xxxxxxxxxxxxxxxxxxxxxxxx)");
}

function llmsTxt(): Plugin {
  return {
    name: "beacon-llms-txt",
    configureServer(server) {
      server.middlewares.use("/llms.txt", (_req, res) => {
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.end(llmsText());
      });
    },
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "llms.txt", source: llmsText() });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), llmsTxt()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } }, // shadcn components import from "@/..."
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
