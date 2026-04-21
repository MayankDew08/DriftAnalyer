import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/analyze": {
        target: "https://driftanalyer.onrender.com",
        changeOrigin: true,
      },
      "/feedback": {
        target: "https://driftanalyer.onrender.com",
        changeOrigin: true,
      },
      "/history": {
        target: "https://driftanalyer.onrender.com",
        changeOrigin: true,
      },
      "/health": {
        target: "https://driftanalyer.onrender.com",
        changeOrigin: true,
      },
    },
  },
});
