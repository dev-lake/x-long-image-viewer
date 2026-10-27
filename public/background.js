let offscreenCreation;
async function ensureOffscreen() {
  if (!offscreenCreation) {
    offscreenCreation = (async () => {
      if (await chrome.offscreen.hasDocument()) return;
      await chrome.offscreen.createDocument({
        url: "ocr/offscreen.html",
        reasons: ["WORKERS"],
        justification: "Recognize image text locally using a packaged OCR worker."
      });
    })().finally(() => { offscreenCreation = undefined; });
  }
  await offscreenCreation;
}
chrome.runtime.onMessage.addListener((message, sender, respond) => {
  if (message?.target === "ocr-progress" && sender.id === chrome.runtime.id && !sender.tab) {
    respond({ ok: true });
    return;
  }
  if (message?.target !== "ocr-background" || sender.id !== chrome.runtime.id) return;
  (async () => {
    const url = new URL(message.url);
    if (url.protocol !== "https:" || url.hostname !== "pbs.twimg.com" || !url.pathname.startsWith("/media/")) {
      throw new Error("Unsupported image URL");
    }
    await ensureOffscreen();
    return await chrome.runtime.sendMessage({ target: "ocr-offscreen", url: url.href });
  })().then(respond, () => respond({ error: "OCR failed" }));
  return true;
});
