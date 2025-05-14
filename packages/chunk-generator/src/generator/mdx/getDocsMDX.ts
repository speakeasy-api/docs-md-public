import type { Chunk } from "../../types/chunk.ts";
import { renderAboutChunk } from "./chunks/about.ts";

export function getDocsMDX(
  docsData: Chunk[],
  basePath: string
): Record<string, string> {
  const chunkMap: Record<string, string> = {};
  for (const chunk of docsData) {
    switch (chunk.chunkType) {
      case "about":
        chunkMap[`${basePath}/about.mdx`] = renderAboutChunk(chunk);
        break;
    }
  }
  return chunkMap;
}
