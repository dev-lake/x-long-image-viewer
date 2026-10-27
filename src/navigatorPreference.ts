import { readExtensionStorage, writeExtensionStorage } from "./extensionStorage";

const STORAGE_KEY = "xpeNavigatorPosition";
export type NavigatorPosition = "left" | "right";

export async function readNavigatorPosition(): Promise<NavigatorPosition> {
  return await readExtensionStorage(STORAGE_KEY) === "right" ? "right" : "left";
}

export function writeNavigatorPosition(position: NavigatorPosition): Promise<void> {
  return writeExtensionStorage(STORAGE_KEY, position);
}
