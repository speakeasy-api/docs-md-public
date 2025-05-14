import type { Chunk } from "../../types/chunk.ts";

export function getSchemaFromId(
  schemaId: string,
  docsData: Map<string, Chunk>
) {
  const schemaChunk = docsData.get(schemaId);
  if (!schemaChunk) {
    throw new Error(`Could not find schema chunk: ${schemaId}`);
  }
  if (schemaChunk.chunkType !== "schema") {
    throw new Error(`Schema chunk is not a schema chunk: ${schemaId}`);
  }
  return schemaChunk;
}
