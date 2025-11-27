import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    //It proxies requests from /api to http://localhost:5000 during Vite development so the frontend can call the backend without CORS and using same-origin URLs.
    proxy: {
      "/api": {
        target: "http://localhost:5000",
      },
    },
  },
});
