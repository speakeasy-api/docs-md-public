import type { Chunk } from "../../types/chunk.ts";
import { renderAbout } from "./chunks/about.ts";
import { renderSchema } from "./chunks/schema.ts";
import { Renderer } from "./renderer.ts";

export function getDocsMDX(
  docsData: Chunk[],
  basePath: string
): Record<string, string> {
  const chunkMap: Record<string, string> = {};
  for (const chunk of docsData) {
    if (chunk.id.startsWith("$")) {
      continue;
    }
    const fileUrl = `${basePath}/${chunk.id}.mdx`;
    switch (chunk.chunkType) {
      case "about": {
        chunkMap[fileUrl] = renderAbout(chunk);
        break;
      }
      case "schema": {
        const renderer = new Renderer();
        renderSchema(renderer, chunk);
        chunkMap[fileUrl] = renderer.render();
        break;
      }
    }
  }
  return chunkMap;
}
