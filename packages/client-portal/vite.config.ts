import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        // If the backend API doesn't start with /api, you can use rewrite to remove the /api prefix
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
