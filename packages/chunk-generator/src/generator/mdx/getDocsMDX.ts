import type { Chunk } from "../../types/chunk.ts";
import { renderAbout } from "./chunks/about.ts";
import { renderOperation } from "./chunks/operation.ts";
import { renderSchema } from "./chunks/schema.ts";
import { renderTag } from "./chunks/tag.ts";
import { Renderer } from "./renderer.ts";
import { getOperationFromId } from "./util.ts";

function getPageMap(
  docsData: Map<string, Chunk>,
  basePath: string
): Map<string, Chunk[]> {
  const pageMap: Map<string, Chunk[]> = new Map();

  for (const [, chunk] of docsData) {
    const path = `${basePath}/${chunk.id}.mdx`;
    switch (chunk.chunkType) {
      case "about": {
        // TODO: eventually we want to make this more configurable, since
        // Docusaurus and Nextra use different formats
        pageMap.set(path, [chunk]);
        break;
      }
      case "schema": {
        if (!chunk.id.startsWith("$")) {
          pageMap.set(path, [chunk]);
        }
        break;
      }
      case "tag": {
        const chunks: Chunk[] = [chunk];
        pageMap.set(path, chunks);
        for (const operationChunkId of chunk.chunkData.operationChunkIds) {
          const operationChunk = getOperationFromId(operationChunkId, docsData);
          chunks.push(operationChunk);
        }
        break;
      }
      // We don't look for operations here, cause they're never on their own page
    }
  }

  return pageMap;
}

export function getDocsMDX(
  docsData: Map<string, Chunk>,
  basePath: string
): Record<string, string> {
  // First, get a mapping of pages to chunks
  const pageMap = getPageMap(docsData, basePath);

  const renderedChunkMap = new Map<string, string>();
  for (const [pagePath, chunks] of pageMap) {
    const renderer = new Renderer();
    for (const chunk of chunks) {
      switch (chunk.chunkType) {
        case "about": {
          renderAbout(renderer, chunk);
          break;
        }
        case "tag": {
          renderTag(renderer, chunk);
          break;
        }
        case "schema": {
          // The normal schema renderer doesn't render a heading, since it's
          // normally embedded in a separate page. It's not in this case though,
          // so we add one by hand
          renderer.appendHeading(1, chunk.id);
          renderSchema(renderer, chunk, docsData, {
            baseHeadingLevel: 1,
          });
          break;
        }
        case "operation": {
          renderOperation(renderer, chunk, docsData, {
            baseHeadingLevel: 2,
          });
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
    renderedChunkMap.set(pagePath, renderer.render());
  }

  return Object.fromEntries(renderedChunkMap);
}
