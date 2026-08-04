import { existsSync, mkdirSync, rmSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const distDir = join(rootDir, "dist");
const releaseDir = join(rootDir, "release");
const storeExtensionIdEnvName = "VITE_CHROME_WEB_STORE_EXTENSION_ID";
const chromeExtensionIdPattern = /^[a-p]{32}$/u;

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    stdio: "inherit",
    shell: false,
    ...options
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with exit code ${result.status}`);
  }
}

async function readManifest() {
  const manifestPath = join(distDir, "manifest.json");
  if (!existsSync(manifestPath)) {
    throw new Error("Missing dist/manifest.json. Run the build before packaging.");
  }

  return JSON.parse(await readFile(manifestPath, "utf8"));
}

async function readPackageJson() {
  return JSON.parse(await readFile(join(rootDir, "package.json"), "utf8"));
}

function requireFile(relativePath) {
  const filePath = join(distDir, relativePath);
  if (!existsSync(filePath)) {
    throw new Error(`Missing required packaged file: ${relativePath}`);
  }
}

function getStoreExtensionId() {
  return (process.env[storeExtensionIdEnvName] || "").trim();
}

function validateStoreExtensionId(storeExtensionId) {
  if (!storeExtensionId) {
    console.warn(`Rating prompt disabled: ${storeExtensionIdEnvName} is not set.`);
    return;
  }

  if (!chromeExtensionIdPattern.test(storeExtensionId)) {
    throw new Error(`${storeExtensionIdEnvName} must be a 32-character Chrome Web Store extension ID using letters a-p.`);
  }

  console.log(`Rating prompt enabled for Chrome Web Store extension ID: ${storeExtensionId}`);
}

async function validateContentBundle(storeExtensionId) {
  const content = await readFile(join(distDir, "assets/content.js"), "utf8");

  if (content.includes("REPLACE_WITH_EXTENSION_ID")) {
    throw new Error("Packaged content still contains REPLACE_WITH_EXTENSION_ID.");
  }

  if (storeExtensionId && !content.includes(storeExtensionId)) {
    throw new Error(`Packaged content does not contain ${storeExtensionIdEnvName}. Confirm the Vite env variable is passed to the build.`);
  }
}

async function removeSourceMaps() {
  const contentScriptPath = join(distDir, "assets/content.js");
  const sourceMapPath = join(distDir, "assets/content.js.map");

  rmSync(sourceMapPath, { force: true });

  if (existsSync(contentScriptPath)) {
    const content = await readFile(contentScriptPath, "utf8");
    await writeFile(contentScriptPath, content.replace(/\n?\/\/# sourceMappingURL=content\.js\.map\s*$/u, ""), "utf8");
  }
}

function zipDist(outputPath) {
  const zipCheck = spawnSync("zip", ["-v"], { stdio: "ignore" });
  if (zipCheck.error || zipCheck.status !== 0) {
    throw new Error("The system `zip` command is required to create the store package.");
  }

  run("zip", ["-qr", outputPath, "."], { cwd: distDir });
}

async function main() {
  const storeExtensionId = getStoreExtensionId();
  validateStoreExtensionId(storeExtensionId);

  rmSync(releaseDir, { recursive: true, force: true });
  mkdirSync(releaseDir, { recursive: true });

  run("npm", ["run", "build"]);
  await removeSourceMaps();

  const manifest = await readManifest();
  const packageJson = await readPackageJson();
  if (manifest.version !== packageJson.version) {
    throw new Error(`dist/manifest.json version ${manifest.version} does not match package.json version ${packageJson.version}.`);
  }

  const packageName = `${packageJson.name || manifest.name || "extension"}-${manifest.version || packageJson.version || "0.0.0"}`
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-|-$/g, "");
  const outputPath = join(releaseDir, `${packageName}.zip`);

  requireFile("manifest.json");
  requireFile("assets/content.js");
  requireFile("assets/content.css");
  await validateContentBundle(storeExtensionId);

  for (const locale of ["en", "ja", "pt_BR", "zh_CN"]) {
    requireFile(`_locales/${locale}/messages.json`);
  }

  for (const size of ["16", "32", "48", "128"]) {
    requireFile(manifest.icons?.[size] ?? `icons/icon-${size}.png`);
  }

  zipDist(outputPath);
  console.log(`Created ${join(basename(releaseDir), basename(outputPath))}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
