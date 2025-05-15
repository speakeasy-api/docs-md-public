import type {
  ArrayValue,
  Chunk,
  ObjectValue,
  SchemaChunk,
} from "../../../types/chunk.ts";
import type { Renderer } from "../renderer.ts";
import { getSchemaFromId } from "../util.ts";

export function renderSchema(
  renderer: Renderer,
  chunk: SchemaChunk,
  docsData: Map<string, Chunk>,
  { baseHeadingLevel }: { baseHeadingLevel: number }
) {
  function renderObjectProperties(
    objectValue: ObjectValue,
    { isOpenOnLoad = false }: { isOpenOnLoad?: boolean }
  ) {
    renderer.beginExpandableSection("Properties", {
      isOpenOnLoad,
    });
    for (const [key, value] of Object.entries(objectValue.properties)) {
      renderer.appendHeading(baseHeadingLevel + 1, key);
      if (value.type === "chunk") {
        const schemaChunk = getSchemaFromId(value.chunkId, docsData);
        renderSchema(renderer, schemaChunk, docsData, {
          baseHeadingLevel,
        });
      } else {
        renderer.appendParagraph(`Type: ${value.type}`);
      }
    }
    renderer.endExpandableSection();
  }

  function renderArrayItems(arrayValue: ArrayValue) {
    if (arrayValue.items.type === "chunk") {
      const schemaChunk = getSchemaFromId(arrayValue.items.chunkId, docsData);
      renderSchema(renderer, schemaChunk, docsData, {
        baseHeadingLevel,
      });
    } else {
      renderer.appendParagraph(`Type: ${arrayValue.items.type}`);
    }
  }

  switch (chunk.chunkData.type) {
    case "object":
      renderObjectProperties(chunk.chunkData, {
        isOpenOnLoad: true,
      });
      break;
    case "array":
      renderArrayItems(chunk.chunkData);
      break;
    default:
      break;
  }
}
