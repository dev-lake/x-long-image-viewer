const STORAGE_KEY = "xpeToolbarPosition";

export type ToolbarPosition = "top" | "bottom";

function getChromeApi(): typeof chrome | undefined {
  return typeof chrome === "undefined" ? undefined : chrome;
}

export function readToolbarPosition(): Promise<ToolbarPosition> {
  return new Promise((resolve) => {
    const storage = getChromeApi()?.storage?.local;
    if (!storage?.get) {
      resolve("bottom");
      return;
    }

    storage.get(STORAGE_KEY, (items: Record<string, unknown>) => {
      resolve(items[STORAGE_KEY] === "top" ? "top" : "bottom");
    });
  });
}

export function writeToolbarPosition(position: ToolbarPosition): Promise<void> {
  return new Promise((resolve) => {
    const storage = getChromeApi()?.storage?.local;
    if (!storage?.set) {
      resolve();
      return;
    }

    storage.set({ [STORAGE_KEY]: position }, resolve);
  });
}
