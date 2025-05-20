import type {
  ArrayValue,
  Chunk,
  MapValue,
  ObjectValue,
  SchemaChunk,
  SchemaValue,
  SetValue,
  UnionValue,
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
      if (value.type === "chunk") {
        const schemaChunk = getSchemaFromId(value.chunkId, docsData);
        renderer.appendHeading(
          5,
          `${renderer.escapeText(key)}: \`${schemaChunk.chunkData.value.type}\``,
          {
            escape: false,
          }
        );
        renderSchema(renderer, schemaChunk, docsData, {
          baseHeadingLevel,
        });
      } else if (value.type === "enum") {
        renderer.appendHeading(
          5,
          `${renderer.escapeText(key)}: \`${value.values.map((v) => `"${v}"`).join(" | ")}\``,
          {
            escape: false,
          }
        );
      } else {
        renderer.appendHeading(
          5,
          `${renderer.escapeText(key)}: \`${value.type}\``,
          {
            escape: false,
          }
        );
      }
    }
    renderer.endExpandableSection();
  }

  function renderArrayLikeItems(
    arrayLikeValue: ArrayValue | MapValue | SetValue
  ) {
    if (arrayLikeValue.items.type === "chunk") {
      const schemaChunk = getSchemaFromId(
        arrayLikeValue.items.chunkId,
        docsData
      );
      renderSchema(renderer, schemaChunk, docsData, {
        baseHeadingLevel,
      });
    } else {
      renderer.appendParagraph(`Type: ${arrayLikeValue.items.type}`);
    }
  }

  function renderUnionItems(unionValue: UnionValue) {
    renderer.beginExpandableSection("Union", {
      isOpenOnLoad: true,
    });
    for (const value of unionValue.values) {
      if (value.type === "chunk") {
        const schemaChunk = getSchemaFromId(value.chunkId, docsData);
        renderer.appendHeading(
          5,
          `${renderer.escapeText(schemaChunk.chunkData.name)}: \`${schemaChunk.chunkData.value.type}\``,
          {
            escape: false,
          }
        );
        renderSchema(renderer, schemaChunk, docsData, {
          baseHeadingLevel,
        });
      } else {
        renderer.appendParagraph(`Type: ${value.type}`);
      }
    }
    renderer.endExpandableSection();
  }

  function renderBasicItems(primitiveValue: SchemaValue) {
    renderer.appendParagraph(`Type: ${primitiveValue.type}`);
    if (primitiveValue.type === "enum") {
      renderer.appendParagraph(
        `Values: ${primitiveValue.values.map((v) => `\`${v}\``).join(", ")}`
      );
    }
  }

  switch (chunk.chunkData.value.type) {
    case "object": {
      renderObjectProperties(chunk.chunkData.value, {
        isOpenOnLoad: true,
      });
      break;
    }
    case "map":
    case "set":
    case "array": {
      renderArrayLikeItems(chunk.chunkData.value);
      break;
    }
    case "union": {
      renderUnionItems(chunk.chunkData.value);
      break;
    }
    default: {
      renderBasicItems(chunk.chunkData.value);
      break;
    }
  }
}
