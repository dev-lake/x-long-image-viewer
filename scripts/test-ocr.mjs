import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { test } from "node:test";

const source = await readFile(new URL("../public/background.js", import.meta.url), "utf8");
function setup({ failCreation = false } = {}) {
  let listener;
  let created = 0;
  let forwarded = 0;
  let exists = false;
  const chrome = {
    runtime: {
      id: "self",
      onMessage: { addListener: fn => { listener = fn; } },
      sendMessage: async message => { forwarded++; assert.equal(message.target, "ocr-offscreen"); return { result: { text: "hello" } }; }
    },
    offscreen: {
      hasDocument: async () => exists,
      createDocument: async options => {
        created++;
        assert.deepEqual(Array.from(options.reasons), ["WORKERS"]);
        if (failCreation) { failCreation = false; throw new Error("Creation failed"); }
        exists = true;
      }
    }
  };
  vm.runInNewContext(source, { chrome, URL });
  return {
    request: (url, sender = { id: "self", tab: { id: 1 } }) => new Promise(resolve => {
      if (listener({ target: "ocr-background", url }, sender, resolve) !== true) resolve(undefined);
    }),
    counts: () => ({ created, forwarded })
  };
}

test("concurrent image requests share one offscreen document", async () => {
  const app = setup();
  const responses = await Promise.all([app.request("https://pbs.twimg.com/media/a"), app.request("https://pbs.twimg.com/media/b")]);
  assert.equal(responses[0].result.text, "hello");
  assert.deepEqual(app.counts(), { created: 1, forwarded: 2 });
});

test("rejects arbitrary URLs and untrusted senders before fetching", async () => {
  const app = setup();
  for (const url of ["https://example.com/media/a", "http://pbs.twimg.com/media/a", "https://pbs.twimg.com/profile_images/a", "invalid"]) {
    assert.equal((await app.request(url)).error, "OCR failed");
  }
  assert.equal(await app.request("https://pbs.twimg.com/media/a", { id: "other" }), undefined);
  assert.deepEqual(app.counts(), { created: 0, forwarded: 0 });
});

test("can retry after offscreen creation failure", async () => {
  const app = setup({ failCreation: true });
  assert.equal((await app.request("https://pbs.twimg.com/media/a")).error, "OCR failed");
  assert.equal((await app.request("https://pbs.twimg.com/media/a")).result.text, "hello");
  assert.deepEqual(app.counts(), { created: 2, forwarded: 1 });
});

const normalizationSource = await readFile(new URL("../public/ocr/text-normalization.js", import.meta.url), "utf8");
const normalizationContext = vm.createContext({});
vm.runInContext(normalizationSource, normalizationContext);
const normalize = normalizationContext.normalizeOcrText;

test("removes OCR spaces between Simplified and Traditional Chinese characters", () => {
  assert.equal(normalize("图 片 文 字 识 别 测 试"), "图片文字识别测试");
  assert.equal(normalize("繁 體 中 文"), "繁體中文");
  assert.equal(normalize("中\u3000文\u00a0识\t别"), "中文识别");
});

test("cleans Chinese punctuation spacing", () => {
  assert.equal(normalize("你 好 ， 世 界 ！ （ 图 片 ）"), "你好，世界！（图片）");
});

test("keeps English word spacing and mixed-language boundaries", () => {
  assert.equal(normalize("  Hello   world\t2026  "), "Hello world 2026");
  assert.equal(normalize("使 用 React 构 建 OCR 工 具"), "使用 React 构建 OCR 工具");
  assert.equal(normalize("version 1.2 / hello@example.com"), "version 1.2 / hello@example.com");
});

test("preserves line and paragraph breaks", () => {
  assert.equal(normalize(" 第 一 行 \r\n\r\n 第 二 行 \r\n Hello world "), "第一行\n\n第二行\nHello world");
  assert.equal(normalize(" \n \t "), "");
});

test("OCR worker filters only known routine diagnostics", async () => {
  const source = await readFile(new URL("../public/ocr/worker.js", import.meta.url), "utf8");
  const logged = [];
  const imported = [];
  vm.runInNewContext(source, {
    console: { error: (...args) => logged.push(args) },
    importScripts: path => imported.push(path)
  });
  assert.deepEqual(imported, ["worker.min.js"]);
  // Simulate Emscripten binding console.error after the wrapper loads.
  const context = { console: { error: (...args) => logged.push(args) }, importScripts() {} };
  vm.runInNewContext(source, context);
  context.console.error("Warning: Parameter not found: language_model_ngram_on");
  context.console.error("Estimating resolution as 596");
  context.console.error("Warning: Parameter not found: unexpected_parameter");
  context.console.error("Error loading language model");
  assert.deepEqual(logged, [["Warning: Parameter not found: unexpected_parameter"], ["Error loading language model"]]);
});
