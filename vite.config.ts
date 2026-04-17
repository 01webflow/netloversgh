import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Group lazy-loaded route chunks so admin/agent code never lands in the main bundle.
        manualChunks(id) {
          if (id.includes("/src/pages/admin/")) return "admin";
          if (id.includes("/src/pages/agent/")) return "agent";
          // Heavy 3D libs already loaded only with Hero3D, but isolate them too.
          if (
            id.includes("node_modules/three") ||
            id.includes("node_modules/@react-three")
          ) {
            return "three";
          }
        },
      },
    },
  },
}));
