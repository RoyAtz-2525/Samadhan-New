import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");

  if (mode === "production") {
    if (!env.VITE_API_URL) {
      throw new Error("VITE_API_URL must be configured for production builds.");
    }

    let apiUrl;
    try {
      apiUrl = new URL(env.VITE_API_URL);
    } catch {
      throw new Error("VITE_API_URL must be an absolute HTTP(S) URL.");
    }

    if (
      apiUrl.protocol !== "https:" ||
      ["localhost", "127.0.0.1", "0.0.0.0"].includes(apiUrl.hostname)
    ) {
      throw new Error("VITE_API_URL must use a deployed HTTPS API host.");
    }
  }

  return {
    plugins: [react(), tailwindcss()],
  };
});
