import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
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
    async writeBundle() {
      await syncManifestVersion();
      const ocrDir = join(distDir, "ocr");
      await mkdir(join(ocrDir, "core"), { recursive: true });
      await mkdir(join(ocrDir, "lang"), { recursive: true });
      for (const file of ["tesseract.min.js", "worker.min.js"]) {
        await cp(join(rootDir, "node_modules/tesseract.js/dist", file), join(ocrDir, file));
      }
      for (const variant of ["lstm", "simd-lstm", "relaxedsimd-lstm"]) {
        for (const suffix of ["wasm.js", "wasm"]) {
          const file = `tesseract-core-${variant}.${suffix}`;
          await cp(join(rootDir, "node_modules/tesseract.js-core", file), join(ocrDir, "core", file));
        }
      }
      for (const language of ["eng", "chi_sim"]) {
        await cp(join(rootDir, `node_modules/@tesseract.js-data/${language}/4.0.0/${language}.traineddata.gz`),
          join(ocrDir, "lang", `${language}.traineddata.gz`));
      }
      for (const [source, name] of [
        ["tesseract.js/LICENSE.md", "TESSERACT-LICENSE.md"],
        ["tesseract.js-core/LICENSE", "CORE-LICENSE"]
      ]) await cp(join(rootDir, "node_modules", source), join(ocrDir, name));
    }
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
