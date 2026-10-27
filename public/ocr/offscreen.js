// Each job owns its worker; jobs are serialized to bound memory use.
let queue = Promise.resolve();
async function recognize(url) {
  let worker;
  let bitmap;
  const controller = new AbortController();
  // Offscreen messages keep the routing service worker alive during long OCR jobs.
  const heartbeat = setInterval(() => {
    chrome.runtime.sendMessage({ target: "ocr-progress" }).catch(() => {});
  }, 20_000);
  let expired = false;
  let timeout;
  const deadline = new Promise((_, reject) => {
    timeout = setTimeout(() => {
      expired = true;
      controller.abort();
      if (worker) void worker.terminate();
      reject(new Error("Recognition timed out"));
    }, 150_000);
  });
  const work = async () => {
    const response = await fetch(url, { signal: controller.signal, credentials: "omit" });
    if (!response.ok) throw new Error("Image download failed");
    const blob = await response.blob();
    bitmap = await createImageBitmap(blob);
    // Prevent oversized long images exhausting the worker's memory.
    if (bitmap.width * bitmap.height > 40_000_000) throw new Error("Image too large");
    worker = await Tesseract.createWorker(["eng", "chi_sim"], 1, {
      workerPath: chrome.runtime.getURL("ocr/worker.js"),
      corePath: chrome.runtime.getURL("ocr/core"),
      langPath: chrome.runtime.getURL("ocr/lang"),
      workerBlobURL: false,
      cacheMethod: "none",
      errorHandler: () => {}
    });
    if (expired) { await worker.terminate(); throw new Error("Recognition timed out"); }
    await worker.setParameters({ tessedit_pageseg_mode: "3" });
    const { data } = await worker.recognize(blob, {}, { text: true, blocks: true });
    const lines = (data.blocks || []).flatMap(block => block.paragraphs.flatMap(paragraph =>
      paragraph.lines.map(line => ({ text: normalizeOcrText(line.text), bbox: line.bbox }))
    )).filter(line => line.text);
    return { result: { text: normalizeOcrText(data.text), lines, width: bitmap.width, height: bitmap.height } };
  };
  try {
    return await Promise.race([work(), deadline]);
  } finally {
    clearTimeout(timeout);
    clearInterval(heartbeat);
    bitmap?.close();
    if (worker) await worker.terminate();
  }
}
chrome.runtime.onMessage.addListener((message, sender, respond) => {
  if (message?.target !== "ocr-offscreen" || sender.id !== chrome.runtime.id || sender.tab) return;
  const job = queue.then(() => recognize(message.url));
  queue = job.catch(() => {});
  job.then(respond, () => respond({ error: "OCR failed" }));
  return true;
});
