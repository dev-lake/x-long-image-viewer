import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";

async function loadModule(path, globals = {}) {
  const source = await readFile(new URL(path, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports = {};
  vm.runInNewContext(compiled, { exports, ...globals });
  return exports;
}

const invalidated = () => { throw new Error("Extension context invalidated."); };

test("invalidated storage access and calls fall back without rejecting", async () => {
  for (const chrome of [
    { get storage() { invalidated(); } },
    { storage: { local: { get: invalidated, set: invalidated } } }
  ]) {
    const { readExtensionStorage, writeExtensionStorage } = await loadModule("../src/extensionStorage.ts", { chrome });
    assert.equal(await readExtensionStorage("key"), undefined);
    await assert.doesNotReject(writeExtensionStorage("key", "value"));
  }
});

test("storage failures in callbacks consume lastError and use defaults", async () => {
  let reads = 0;
  const chrome = {
    runtime: { get lastError() { reads++; return { message: "storage unavailable" }; } },
    storage: { local: { get: (_key, callback) => callback(undefined), set: (_value, callback) => callback() } }
  };
  const { readExtensionStorage, writeExtensionStorage } = await loadModule("../src/extensionStorage.ts", { chrome });
  assert.equal(await readExtensionStorage("key"), undefined);
  await writeExtensionStorage("key", "value");
  assert.equal(reads, 2);
});

test("available storage retains preference data", async () => {
  const saved = {};
  const chrome = { runtime: {}, storage: { local: {
    get: (key, callback) => callback(saved),
    set: (values, callback) => { Object.assign(saved, values); callback(); }
  } } };
  const { readExtensionStorage, writeExtensionStorage } = await loadModule("../src/extensionStorage.ts", { chrome });
  await writeExtensionStorage("key", "top");
  assert.equal(await readExtensionStorage("key"), "top");
});

test("OCR invalidation rejects for the viewer to handle and clears its timeout", async () => {
  let timerCleared = false;
  const chrome = { runtime: { sendMessage: invalidated } };
  const window = { setTimeout: () => 123, clearTimeout: id => { assert.equal(id, 123); timerCleared = true; } };
  const { recognizeImage } = await loadModule("../src/ocr/client.ts", { chrome, window });
  await assert.rejects(recognizeImage("https://pbs.twimg.com/media/example"), /Extension context invalidated/);
  assert.equal(timerCleared, true);
});
