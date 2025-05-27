import { join } from "node:path";

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
): Map<
  string,
  { sidebarLabel: string; sidebarPosition: string; chunks: Chunk[] }
> {
  const pageMap: Map<
    string,
    { sidebarLabel: string; sidebarPosition: string; chunks: Chunk[] }
  > = new Map();

  // let schemaIndex = 0;
  let tagIndex = 0;
  for (const [, chunk] of docsData) {
    if (!chunk.slug) {
      continue;
    }
    const path = `${basePath}/${chunk.slug}.mdx`;
    switch (chunk.chunkType) {
      case "about": {
        // TODO: eventually we want to make this more configurable, since
        // Docusaurus and Nextra use different formats
        pageMap.set(path, {
          sidebarLabel: "About",
          sidebarPosition: "1",
          chunks: [chunk],
        });
        break;
      }
      case "tag": {
        const chunks: Chunk[] = [chunk];
        pageMap.set(path, {
          sidebarLabel: chunk.chunkData.name,
          sidebarPosition: `2.${tagIndex++}`,
          chunks,
        });
        for (const operationChunkId of chunk.chunkData.operationChunkIds) {
          const operationChunk = getOperationFromId(operationChunkId, docsData);
          chunks.push(operationChunk);
        }
        break;
      }
      // TODO: Mistral doesn't want this in the sidebar (fair), but others might
      // so eventually we should control this with a config file value
      // case "schema": {
      //   if (chunk.chunkData.name) {
      //     pageMap.set(path, {
      //       sidebarLabel: chunk.chunkData.name,
      //       sidebarPosition: `3.${schemaIndex++}`,
      //       chunks: [chunk],
      //     });
      //   }
      //   break;
      // }
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
  for (const [pagePath, { chunks, sidebarLabel, sidebarPosition }] of pageMap) {
    const renderer = new Renderer();
    renderer.insertFrontMatter({
      sidebarPosition,
      sidebarLabel,
    });
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
          renderer.appendHeading(1, chunk.chunkData.name);
          renderSchema({
            renderer,
            chunk,
            docsData,
            baseHeadingLevel: 1,
            topLevelName: "Schema",
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

  // TODO: don't hard-code this for Docusaurus
  renderedChunkMap.set(
    join(basePath, "tag", "_category_.json"),
    JSON.stringify(
      {
        position: 2,
        label: "Operations",
        collapsible: true,
        collapsed: false,
      },
      null,
      "  "
    )
  );

  return Object.fromEntries(renderedChunkMap);
}
