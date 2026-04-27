import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const nm = (pkg) => path.resolve(__dirname, "node_modules", pkg);

// The deployed URL is adib.ihsan.build/research, so all assets are
// served under /research/. We also write the build into dist/research/
// so Vercel (serving viewer/dist as the static root) finds files at
// the matching path.
export default defineConfig({
  plugins: [react()],
  base: "/research/",
  build: {
    outDir: "dist/research",
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
    fs: {
      allow: [path.resolve(__dirname, ".."), path.resolve(__dirname)],
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "recharts"],
  },
});
