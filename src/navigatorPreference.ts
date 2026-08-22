const STORAGE_KEY = "xpeNavigatorPosition";

export type NavigatorPosition = "left" | "right";

function getChromeApi(): typeof chrome | undefined {
  return typeof chrome === "undefined" ? undefined : chrome;
}

export function readNavigatorPosition(): Promise<NavigatorPosition> {
  return new Promise((resolve) => {
    const storage = getChromeApi()?.storage?.local;
    if (!storage?.get) {
      resolve("left");
      return;
    }

    storage.get(STORAGE_KEY, (items: Record<string, unknown>) => {
      resolve(items[STORAGE_KEY] === "right" ? "right" : "left");
    });
  });
}

export function writeNavigatorPosition(position: NavigatorPosition): Promise<void> {
  return new Promise((resolve) => {
    const storage = getChromeApi()?.storage?.local;
    if (!storage?.set) {
      resolve();
      return;
    }

    storage.set({ [STORAGE_KEY]: position }, resolve);
  });
}
