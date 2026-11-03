import { readExtensionStorage, writeExtensionStorage } from "./extensionStorage";

const STORAGE_KEY = "xpeTextSelectionGuideSeen";
let seenInSession = false;

export async function hasSeenTextSelectionGuide(): Promise<boolean> {
  return seenInSession || await readExtensionStorage(STORAGE_KEY) === true;
}

export function markTextSelectionGuideSeen(): Promise<void> {
  seenInSession = true;
  return writeExtensionStorage(STORAGE_KEY, true);
}
