// Content scripts can outlive their extension context after an update or reload.
// Preferences are optional, so fall back gracefully if Chrome invalidates it.
function consumeLastError(): boolean {
  try {
    return Boolean(typeof chrome !== "undefined" && chrome?.runtime?.lastError);
  } catch {
    return true;
  }
}

export function readExtensionStorage(key: string): Promise<unknown> {
  return new Promise((resolve) => {
    try {
      const storage = typeof chrome === "undefined" ? undefined : chrome?.storage?.local;
      if (!storage?.get) return resolve(undefined);
      storage.get(key, (items) => {
        if (consumeLastError()) return resolve(undefined);
        resolve(items?.[key]);
      });
    } catch {
      resolve(undefined);
    }
  });
}

export function writeExtensionStorage(key: string, value: unknown): Promise<void> {
  return new Promise((resolve) => {
    try {
      const storage = typeof chrome === "undefined" ? undefined : chrome?.storage?.local;
      if (!storage?.set) return resolve();
      storage.set({ [key]: value }, () => {
        consumeLastError();
        resolve();
      });
    } catch {
      resolve();
    }
  });
}
