export type TextLine = {
  text: string;
  bbox: { x0: number; y0: number; x1: number; y1: number };
};
export type OcrResult = { text: string; width: number; height: number; lines: TextLine[] };

const cache = new Map<string, OcrResult>();

const pending = new Map<string, Promise<OcrResult>>();

export function recognizeImage(url: string): Promise<OcrResult> {
  const existing = pending.get(url);
  if (existing) return existing;
  const job = recognize(url).finally(() => pending.delete(url));
  pending.set(url, job);
  return job;
}

async function recognize(url: string): Promise<OcrResult> {
  const cached = cache.get(url);
  if (cached) return cached;
  const result = await new Promise<OcrResult>((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error("OCR timeout")), 180_000);
    try {
      const runtime = typeof chrome === "undefined" ? undefined : chrome?.runtime;
      if (!runtime?.sendMessage) throw new Error("Extension unavailable");
      runtime.sendMessage({ target: "ocr-background", url }, (response: { result?: OcrResult; error?: string } | undefined) => {
        window.clearTimeout(timeout);
        try {
          const error = runtime.lastError;
          if (error || !response?.result) reject(new Error(error?.message || response?.error || "OCR failed"));
          else resolve(response.result);
        } catch (error) {
          reject(error);
        }
      });
    } catch (error) {
      window.clearTimeout(timeout);
      reject(error);
    }
  });
  if (cache.size >= 8) cache.delete(cache.keys().next().value!);
  cache.set(url, result);
  return result;
}
