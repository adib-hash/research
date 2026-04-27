import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const nm = (pkg) => path.resolve(__dirname, "node_modules", pkg);

// Deployed via Vercel rewrite as adib.ihsan.build/research/aetheria.
// Build output mirrors the URL path so assets resolve cleanly.
export default defineConfig({
  plugins: [react()],
  base: "/research/aetheria/",
  build: {
    outDir: "dist/research/aetheria",
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      recharts: nm("recharts"),
      react: nm("react"),
      "react-dom": nm("react-dom"),
      "react-dom/client": nm("react-dom/client.js"),
    },
    dedupe: ["react", "react-dom"],
  },
  server: {
    port: 5173,
    strictPort: false,
    open: false,
    fs: { allow: [path.resolve(__dirname, ".."), path.resolve(__dirname)] },
  },
  optimizeDeps: { include: ["react", "react-dom", "recharts"] },
});
