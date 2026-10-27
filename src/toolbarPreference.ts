import { readExtensionStorage, writeExtensionStorage } from "./extensionStorage";

const STORAGE_KEY = "xpeToolbarPosition";
export type ToolbarPosition = "top" | "bottom";

export async function readToolbarPosition(): Promise<ToolbarPosition> {
  return await readExtensionStorage(STORAGE_KEY) === "top" ? "top" : "bottom";
}

export function writeToolbarPosition(position: ToolbarPosition): Promise<void> {
  return writeExtensionStorage(STORAGE_KEY, position);
}
