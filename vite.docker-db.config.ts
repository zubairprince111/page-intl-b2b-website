import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

// Database scripts import catalog assets but do not need the web app plugins.
export default defineConfig({
  plugins: [tsConfigPaths({ projects: ["./tsconfig.json"] })],
});
