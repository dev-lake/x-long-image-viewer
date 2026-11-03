import { readExtensionStorage, writeExtensionStorage } from "./extensionStorage";

const STORAGE_KEY = "xpeToolbarPosition";
const STYLE_STORAGE_KEY = "xpeToolbarStyle";
export type ToolbarPosition = "top" | "bottom";
export type ToolbarStyle = "classic" | "liquid-glass";

export async function readToolbarPosition(): Promise<ToolbarPosition> {
  return await readExtensionStorage(STORAGE_KEY) === "top" ? "top" : "bottom";
}

export function writeToolbarPosition(position: ToolbarPosition): Promise<void> {
  return writeExtensionStorage(STORAGE_KEY, position);
}

export async function readToolbarStyle(): Promise<ToolbarStyle> {
  return await readExtensionStorage(STYLE_STORAGE_KEY) === "liquid-glass" ? "liquid-glass" : "classic";
}

export function writeToolbarStyle(style: ToolbarStyle): Promise<void> {
  return writeExtensionStorage(STYLE_STORAGE_KEY, style);
}
