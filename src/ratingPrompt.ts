const STORAGE_KEY = "xpeRatingPrompt";
const MIN_OPEN_COUNT_FOR_PROMPT = 5;
const LATER_COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000;
const STORE_EXTENSION_ID = import.meta.env.VITE_CHROME_WEB_STORE_EXTENSION_ID?.trim() ?? "";

export const STORE_REVIEW_URL = STORE_EXTENSION_ID ? `https://chromewebstore.google.com/detail/${STORE_EXTENSION_ID}/reviews` : "";

type RatingPromptStorage = {
  declined?: boolean;
  firstOpenedAt?: number;
  lastPromptedAt?: number;
  nextPromptAt?: number;
  openCount?: number;
  rated?: boolean;
};

export type RatingPromptState = {
  shouldShow: boolean;
  storeUrl: string;
};

function getChromeApi(): typeof chrome | undefined {
  return typeof chrome === "undefined" ? undefined : chrome;
}

function isStorageAvailable(): boolean {
  const chromeApi = getChromeApi();
  return Boolean(chromeApi?.storage?.local?.get && chromeApi.storage.local.set);
}

function isStoreReviewUrlConfigured(): boolean {
  return Boolean(STORE_REVIEW_URL);
}

function readStorage(): Promise<RatingPromptStorage> {
  return new Promise((resolve) => {
    if (!isStorageAvailable()) {
      resolve({});
      return;
    }

    getChromeApi()?.storage?.local?.get?.(STORAGE_KEY, (items: Record<string, unknown>) => {
      const value = items[STORAGE_KEY];
      resolve(value && typeof value === "object" ? (value as RatingPromptStorage) : {});
    });
  });
}

function writeStorage(value: RatingPromptStorage): Promise<void> {
  return new Promise((resolve) => {
    if (!isStorageAvailable()) {
      resolve();
      return;
    }

    getChromeApi()?.storage?.local?.set?.({ [STORAGE_KEY]: value }, resolve);
  });
}

export async function recordViewerOpenAndGetRatingPrompt(): Promise<RatingPromptState> {
  const current = await readStorage();
  const now = Date.now();
  const next: RatingPromptStorage = {
    ...current,
    firstOpenedAt: current.firstOpenedAt ?? now,
    openCount: (current.openCount ?? 0) + 1
  };

  const shouldShow =
    isStoreReviewUrlConfigured() &&
    !next.rated &&
    !next.declined &&
    (next.openCount ?? 0) >= MIN_OPEN_COUNT_FOR_PROMPT &&
    (!next.nextPromptAt || next.nextPromptAt <= now);

  await writeStorage(shouldShow ? { ...next, lastPromptedAt: now } : next);

  return {
    shouldShow,
    storeUrl: shouldShow ? STORE_REVIEW_URL : ""
  };
}

export async function deferRatingPrompt(): Promise<void> {
  const current = await readStorage();
  await writeStorage({
    ...current,
    nextPromptAt: Date.now() + LATER_COOLDOWN_MS
  });
}

export async function declineRatingPrompt(): Promise<void> {
  const current = await readStorage();
  await writeStorage({
    ...current,
    declined: true
  });
}

export async function markRatingPromptAccepted(): Promise<void> {
  const current = await readStorage();
  await writeStorage({
    ...current,
    rated: true
  });
}
