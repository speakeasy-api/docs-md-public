import type { Chunk } from "../../types/chunk.ts";
import { renderAbout } from "./chunks/about.ts";
import { renderOperation } from "./chunks/operation.ts";
import { renderSchema } from "./chunks/schema.ts";
import { Renderer } from "./renderer.ts";

export function getDocsMDX(
  docsData: Map<string, Chunk>,
  basePath: string
): Record<string, string> {
  const chunkMap: Record<string, string> = {};
  for (const [id, chunk] of docsData) {
    if (id.startsWith("$")) {
      continue;
    }
    const fileUrl = `${basePath}/${id}/page.mdx`;
    switch (chunk.chunkType) {
      case "about": {
        chunkMap[fileUrl] = renderAbout(chunk);
        break;
      }
      case "schema": {
        const renderer = new Renderer();
        renderer.appendHeading(1, chunk.id);
        renderSchema(renderer, chunk, docsData, {
          baseHeadingLevel: 2,
        });
        chunkMap[fileUrl] = renderer.render();
        break;
      }
      case "operation": {
        chunkMap[fileUrl] = renderOperation(chunk, docsData);
        break;
      }
      default: {
        // Just a little extra checking. We do all this any typing cause TypeScript
        // is narrowing the type to `never`, but we're really checking in case
        // the types are wrong (cause they're out of date or something)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
        throw new Error(`Unknown chunk type: ${(chunk as any).chunkType}`);
      }
    }
  }
  return chunkMap;
}
