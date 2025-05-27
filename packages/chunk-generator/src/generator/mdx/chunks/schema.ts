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
import { assertNever } from "../../../util/assertNever.ts";
import type { Renderer } from "../renderer.ts";
import { getSchemaFromId } from "../util.ts";

type RenderSchemaOptions = {
  renderer: Renderer;
  chunk: SchemaChunk;
  docsData: Map<string, Chunk>;
  baseHeadingLevel: number;
  topLevelName: string;
};

function getInlineRepresentation(
  value: SchemaValue,
  docsData: Map<string, Chunk>
): string | undefined {
  switch (value.type) {
    case "object": {
      return undefined;
    }
    case "array": {
      const inlineRepresentation = getInlineRepresentation(
        value.items,
        docsData
      );
      if (inlineRepresentation) {
        return `Array<${inlineRepresentation}>`;
      }
      return undefined;
    }
    case "map": {
      const inlineRepresentation = getInlineRepresentation(
        value.items,
        docsData
      );
      if (inlineRepresentation) {
        return `Map<${inlineRepresentation}>`;
      }
      return undefined;
    }
    case "set": {
      const inlineRepresentation = getInlineRepresentation(
        value.items,
        docsData
      );
      if (inlineRepresentation) {
        return `Set<${inlineRepresentation}>`;
      }
      return undefined;
    }
    case "union": {
      const inlineRepresentations = value.values.map((v) =>
        getInlineRepresentation(v, docsData)
      );
      if (!inlineRepresentations.some((r) => r === undefined)) {
        return inlineRepresentations.join(" | ");
      }
      return undefined;
    }
    case "chunk": {
      const schemaChunk = getSchemaFromId(value.chunkId, docsData);
      return getInlineRepresentation(schemaChunk.chunkData.value, docsData);
    }
    case "enum": {
      // TODO
      return undefined;
    }
    case "string":
    case "number":
    case "boolean":
    case "bigint":
    case "date":
    case "datetime":
    case "integer":
    case "int32":
    case "float32":
    case "decimal":
    case "binary":
    case "any": {
      return value.type;
    }
    default: {
      assertNever(value);
    }
  }
}

export function renderSchema({
  renderer,
  chunk,
  docsData,
  baseHeadingLevel,
  topLevelName,
}: RenderSchemaOptions) {
  function renderObjectProperties(
    objectValue: ObjectValue,
    { isOpenOnLoad = false }: { isOpenOnLoad?: boolean }
  ) {
    renderer.beginExpandableSection(`${topLevelName} Properties`, {
      isOpenOnLoad,
    });
    for (const [key, value] of Object.entries(objectValue.properties)) {
      if (value.type === "chunk") {
        const schemaChunk = getSchemaFromId(value.chunkId, docsData);
        const inlineRepresentation = getInlineRepresentation(
          schemaChunk.chunkData.value,
          docsData
        );
        if (inlineRepresentation) {
          renderer.appendHeading(
            5,
            `${renderer.escapeText(key)}: \`${inlineRepresentation}\``,
            {
              escape: false,
            }
          );
          continue;
        }
        renderer.appendHeading(
          5,
          `${renderer.escapeText(key)}: \`${schemaChunk.chunkData.value.type}\``,
          {
            escape: false,
          }
        );
        renderSchema({
          renderer,
          chunk: schemaChunk,
          docsData,
          baseHeadingLevel,
          topLevelName: key,
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
    const inlineRepresentation = getInlineRepresentation(
      arrayLikeValue,
      docsData
    );
    if (inlineRepresentation) {
      renderer.appendParagraph(`Type: ${inlineRepresentation}`);
      return;
    }

    if (arrayLikeValue.items.type === "chunk") {
      const schemaChunk = getSchemaFromId(
        arrayLikeValue.items.chunkId,
        docsData
      );
      renderSchema({
        renderer,
        chunk: schemaChunk,
        docsData,
        baseHeadingLevel,
        topLevelName,
      });
    } else {
      renderer.appendParagraph(`Type: ${arrayLikeValue.items.type}`);
    }
  }

  function renderUnionItems(unionValue: UnionValue) {
    const inlineRepresentation = getInlineRepresentation(unionValue, docsData);
    if (inlineRepresentation) {
      renderer.appendHeading(5, `${topLevelName}: \`${inlineRepresentation}\``);
      return;
    }
    renderer.beginExpandableSection(`${topLevelName} Union Values`, {
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
        renderSchema({
          renderer,
          chunk: schemaChunk,
          docsData,
          baseHeadingLevel,
          topLevelName: schemaChunk.chunkData.name,
        });
      } else {
        renderer.appendParagraph(value.type);
      }
    }
    renderer.endExpandableSection();
    return;
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
