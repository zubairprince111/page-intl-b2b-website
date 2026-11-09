const fs = require("node:fs");
const path = require("node:path");

const srcDir = path.resolve(__dirname, "..", "node_modules", "@electric-sql", "pglite", "dist");
const targetDir = path.resolve(__dirname, "..", ".output", "server", "_libs");

if (fs.existsSync(srcDir) && fs.existsSync(targetDir)) {
  const files = ["pglite.data", "pglite.wasm"];
  for (const file of files) {
    const srcFile = path.join(srcDir, file);
    const destFile = path.join(targetDir, file);
    if (fs.existsSync(srcFile)) {
      fs.copyFileSync(srcFile, destFile);
      console.log(`[build:post] Copied ${file} to ${path.relative(process.cwd(), destFile)}`);
    }
  }
}
