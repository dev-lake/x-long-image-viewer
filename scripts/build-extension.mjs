import { readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { build } from "vite";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const distDir = join(rootDir, "dist");
const isWatch = process.argv.includes("--watch");

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    stdio: "inherit",
    shell: false
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with exit code ${result.status}`);
  }
}

async function readPackageVersion() {
  const packageJson = JSON.parse(await readFile(join(rootDir, "package.json"), "utf8"));
  return String(packageJson.version || "").trim();
}

async function syncManifestVersion() {
  const packageVersion = await readPackageVersion();
  if (!packageVersion) {
    throw new Error("Missing package.json version.");
  }

  const manifestPath = join(distDir, "manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  manifest.version = packageVersion;
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

function manifestVersionPlugin() {
  return {
    name: "xpe-manifest-version",
    writeBundle: syncManifestVersion
  };
}

run("tsc", ["--noEmit"]);

await build({
  configFile: join(rootDir, "vite.config.ts"),
  plugins: [manifestVersionPlugin()],
  build: {
    watch: isWatch ? {} : null
  }
});
