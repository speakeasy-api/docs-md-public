import type {
  ArrayValue,
  ObjectValue,
  SchemaChunk,
} from "../../../types/chunk.ts";
import type { Renderer } from "../renderer.ts";

export function renderSchema(renderer: Renderer, chunk: SchemaChunk) {
  renderer.appendHeading(1, chunk.id);

  function renderObjectProperties(
    objectValue: ObjectValue,
    { isOpenOnLoad = false }: { isOpenOnLoad?: boolean }
  ) {
    renderer.beginExpandableSection("Properties", {
      isOpenOnLoad,
    });
    for (const [key, value] of Object.entries(objectValue.properties)) {
      renderer.appendHeading(3, key);
      if (value.type === "chunk") {
        // TODO:
      } else {
        renderer.appendParagraph(`Type: ${value.type}`);
      }
    }
    renderer.endExpandableSection();
  }

  function renderArrayItems(
    arrayValue: ArrayValue,
    { isOpenOnLoad = false }: { isOpenOnLoad?: boolean }
  ) {
    renderer.beginExpandableSection("Items", {
      isOpenOnLoad,
    });
    if (arrayValue.items.type === "chunk") {
      // TODO:
    } else {
      renderer.appendParagraph(`Type: ${arrayValue.items.type}`);
    }
    renderer.endExpandableSection();
  }

  switch (chunk.chunkData.type) {
    case "object":
      renderObjectProperties(chunk.chunkData, {
        isOpenOnLoad: true,
      });
      break;
    case "array":
      renderArrayItems(chunk.chunkData, {
        isOpenOnLoad: true,
      });
      break;
    default:
      break;
  }
}
