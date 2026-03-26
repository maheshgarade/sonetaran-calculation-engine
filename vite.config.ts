import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path"; // You might need to install @types/node if this errors

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // This tells Vite that @/ is an alias for the src/ directory
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
