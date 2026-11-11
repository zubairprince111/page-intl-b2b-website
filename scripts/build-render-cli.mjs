import * as fs from "node:fs";
import * as path from "node:path";
import { build } from "esbuild";

const rootDir = process.cwd();
const outDir = path.resolve(rootDir, ".output", "cli");

const STATIC_ASSET_RE = /\.(jpe?g|png|webp|gif|svg|avif|mp4|webm|woff2?)$/i;
const TS_EXTENSIONS = [".ts", ".tsx", ".mts", ".cts", ".js", ".jsx", ".mjs", ".cjs"];

function resolveInternalFile(candidatePath) {
  if (fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile()) {
    return candidatePath;
  }
  for (const ext of TS_EXTENSIONS) {
    const withExt = `${candidatePath}${ext}`;
    if (fs.existsSync(withExt) && fs.statSync(withExt).isFile()) {
      return withExt;
    }
  }
  for (const ext of TS_EXTENSIONS) {
    const indexFile = path.join(candidatePath, `index${ext}`);
    if (fs.existsSync(indexFile) && fs.statSync(indexFile).isFile()) {
      return indexFile;
    }
  }
  return candidatePath;
}

/**
 * Lightweight esbuild plugin so Node CLI scripts (`migrate.ts`, `seed.ts`) can resolve `@/*`
 * TypeScript path aliases and static image imports without loading Vite (~300 MB) at runtime.
 */
const cliResolverPlugin = {
  name: "page-cli-resolver",
  setup(pluginBuild) {
    pluginBuild.onResolve({ filter: /^@\// }, (args) => {
      const target = path.resolve(rootDir, "src", args.path.slice(2));
      const resolved = resolveInternalFile(target);
      if (STATIC_ASSET_RE.test(resolved)) {
        return { path: resolved, namespace: "page-asset-url" };
      }
      return { path: resolved };
    });

    pluginBuild.onResolve({ filter: STATIC_ASSET_RE }, (args) => {
      const resolved = path.resolve(args.resolveDir || rootDir, args.path);
      return { path: resolved, namespace: "page-asset-url" };
    });

    pluginBuild.onLoad({ filter: /.*/, namespace: "page-asset-url" }, (args) => {
      const basename = path.basename(args.path);
      return {
        contents: `export default ${JSON.stringify(`/src/assets/${basename}`)};`,
        loader: "js",
      };
    });
  },
};

async function bundleEntry(entryRelativePath, outfileName) {
  const entryPoint = path.resolve(rootDir, entryRelativePath);
  const outfile = path.resolve(outDir, outfileName);

  await build({
    entryPoints: [entryPoint],
    outfile,
    bundle: true,
    platform: "node",
    format: "esm",
    target: "node20",
    packages: "external",
    tsconfig: path.resolve(rootDir, "tsconfig.json"),
    plugins: [cliResolverPlugin],
    logLevel: "warning",
  });

  console.log(`[build:cli] Bundled ${entryRelativePath} -> ${path.relative(rootDir, outfile)}`);
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  await bundleEntry("src/db/migrate.ts", "migrate.mjs");
  await bundleEntry("src/db/seed.ts", "seed.mjs");
}

main().catch((err) => {
  console.error("[build:cli] Failed to bundle production CLI scripts:", err);
  process.exit(1);
});

