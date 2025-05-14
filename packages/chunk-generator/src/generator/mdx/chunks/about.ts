import type { AboutChunk } from "../../../types/chunk.ts";
import { Renderer } from "../renderer.ts";

export function renderAboutChunk(chunk: AboutChunk) {
  const renderer = new Renderer();
  renderer.appendHeading(1, chunk.chunkData.title);
  if (chunk.chunkData.version) {
    renderer.appendParagraph(`_Version: ${chunk.chunkData.version}_`);
  }
  if (chunk.chunkData.description) {
    renderer.appendParagraph(chunk.chunkData.description);
  }
  if (chunk.chunkData.servers.length > 0) {
    renderer.appendParagraph("Servers");
    renderer.appendList(chunk.chunkData.servers.map((server) => server.url));
  }
  return renderer.render();
}
