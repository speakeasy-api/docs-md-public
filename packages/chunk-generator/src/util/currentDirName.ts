import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

export function getDirname(importMetaUrl: string) {
  return dirname(fileURLToPath(importMetaUrl));
}
