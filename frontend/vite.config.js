import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

/**
 * Build-time logger for Vite configuration
 * Only logs during development builds
 */
const buildLogger = {
  log: (...args) => {
    if (process.env.NODE_ENV !== "production") {
      console.log("[VITE-CONFIG]", ...args);
    }
  },
  info: (...args) => {
    if (process.env.NODE_ENV !== "production") {
      console.info("[VITE-CONFIG]", ...args);
    }
  },
};

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load environment variables from the root directory (not the frontend directory)
  const env = loadEnv(mode, path.resolve(process.cwd(), ".."), "");

  const base = "/";

  buildLogger.log("base URL set to:", base);
  buildLogger.info(
    "Mapbox Token loaded:",
    env.VITE_MAPBOX_TOKEN ? "✓ Found" : "✗ Missing"
  );
  buildLogger.info(
    "API Configuration loaded:",
    env.VITE_GITHUB_PAGES_CUSTOM_DOMAIN ? "✓ Custom" : "✗ Custom",
    env.VITE_LOCALHOST ? "✓ localhost" : "✗ localhost",
    env.VITE_API_BASE_URL_LOCAL ? "✓ localAPI" : "✗ localAPI",
    env.VITE_API_BASE_URL_ONLINE ? "✓ OnlineAPI" : "✗ OnlineAPI",
    env.VITE_API_TIMEOUT ? "✓ APITimeout" : "✗ APITimeout"
  );

  return {
    plugins: [
      react(),
      // Copy 404.html to build output and ensure SPA routing works properly
      {
        name: "spa-fallback",
        enforce: "post",
        apply: "build",
        generateBundle() {
          // This runs after the build process and ensures all routes redirect to index.html
          if (command === "build") {
            // Ensure the copy of the 404.html happens in the right order
            buildLogger.log("Adding SPA fallback for client-side routing...");
          }
        },
      },
    ],
    base: base, // Dynamic base path for different deployment scenarios
    server: {
      port: 5000,
      https: false,
      host: false,
      proxy: {
        "/api": {
          target: "http://localhost:8000",
          changeOrigin: true,
          secure: false,
        },
      },
      // Configure history API fallback for SPA routing during development
      historyApiFallback: {
        disableDotRule: true,
        rewrites: [
          // Send all routes back to index.html
          { from: /^\/dashboard.*$/, to: "/index.html" },
          { from: /^\/attendance.*$/, to: "/index.html" },
          { from: /^\/management.*$/, to: "/index.html" },
          { from: /^\/reports.*$/, to: "/index.html" },
          { from: /^\/profile.*$/, to: "/index.html" },
          { from: /^\/events.*$/, to: "/index.html" },
        ],
      },
    },
    // Define environment variables to be exposed to the client
    define: {
      __VITE_MAPBOX_TOKEN__: JSON.stringify(env.VITE_MAPBOX_TOKEN),
    },
    // Make sure environment variables are available
    envDir: path.resolve(process.cwd(), ".."), // Look for .env files in the root directory
    build: {
      outDir: "dist",
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
      // Copy 404.html to the build directory
      emptyOutDir: true,
    },
    resolve: {
      alias: {
        "@": "/src",
      },
    },
    // Test configuration
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./src/test/setup.js"],
      css: true,
    },
  };
});
