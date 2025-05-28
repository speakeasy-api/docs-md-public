import type {
  ArrayValue,
  Chunk,
  MapValue,
  ObjectValue,
  SchemaValue,
  SetValue,
  UnionValue,
} from "../../../types/chunk.ts";
import { assertNever } from "../../../util/assertNever.ts";
import type { Renderer } from "../renderer.ts";
import { getSchemaFromId } from "../util.ts";

type RenderSchemaOptions = {
  renderer: Renderer;
  schema: SchemaValue;
  docsData: Map<string, Chunk>;
  baseHeadingLevel: number;
  topLevelName: string;
};

type DisplayType = {
  label: string;
  breakoutSubTypes: Array<{ label: string; schema: SchemaValue }>;
  linkSubTypes: Array<{ label: string; link: string }>;
};

function getDisplayType(
  value: SchemaValue,
  docsData: Map<string, Chunk>
): DisplayType {
  switch (value.type) {
    case "object": {
      return {
        label: value.name,
        breakoutSubTypes: [
          { label: `${value.name} Properties`, schema: value },
        ],
        linkSubTypes: [],
      };
    }
    case "array": {
      const displayType = getDisplayType(value.items, docsData);
      return { ...displayType, label: `array<${displayType.label}>` };
    }
    case "map": {
      const displayType = getDisplayType(value.items, docsData);
      return { ...displayType, label: `map<${displayType.label}>` };
    }
    case "set": {
      const displayType = getDisplayType(value.items, docsData);
      return { ...displayType, label: `set<${displayType.label}>` };
    }
    case "union": {
      const displayTypes = value.values.map((v) => getDisplayType(v, docsData));
      const hasBreakoutSubType = displayTypes.some(
        (d) => d.breakoutSubTypes.length > 0 || d.linkSubTypes.length > 0
      );
      if (!hasBreakoutSubType) {
        return {
          label: `${displayTypes.map((d) => d.label).join(" | ")}`,
          breakoutSubTypes: [],
          linkSubTypes: [],
        };
      }
      const breakoutSubTypes = displayTypes.flatMap((d) => d.breakoutSubTypes);
      const linkSubTypes = displayTypes.flatMap((d) => d.linkSubTypes);
      return {
        label: `union<${displayTypes.map((d) => d.label).join(" | ")}>`,
        breakoutSubTypes,
        linkSubTypes,
      };
    }
    case "chunk": {
      const schemaChunk = getSchemaFromId(value.chunkId, docsData);
      return getDisplayType(schemaChunk.chunkData.value, docsData);
    }
    case "enum": {
      // TODO
      return { label: "Enum", breakoutSubTypes: [], linkSubTypes: [] };
    }
    case "string":
    case "number":
    case "boolean":
    case "bigint":
    case "date":
    case "date-time":
    case "integer":
    case "int32":
    case "float32":
    case "decimal":
    case "binary":
    case "any": {
      return { label: value.type, breakoutSubTypes: [], linkSubTypes: [] };
    }
    default: {
      assertNever(value);
    }
  }
}

function renderDisplayType({
  renderer,
  value,
  baseHeadingLevel,
  docsData,
}: {
  renderer: Renderer;
  value: SchemaValue;
  baseHeadingLevel: number;
  docsData: Map<string, Chunk>;
}) {
  const displayType = getDisplayType(value, docsData);
  renderer.appendParagraph(`Type: \`${displayType.label}\``);
  if (displayType.linkSubTypes.length === 1) {
    renderer.appendParagraph(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      `See [${displayType.linkSubTypes[0]!.label}](${displayType.linkSubTypes[0]!.link})`
    );
  } else if (displayType.linkSubTypes.length > 1) {
    renderer.appendParagraph("See:");
    renderer.appendList(
      displayType.linkSubTypes.map(
        (linkSubType) => `[${linkSubType.label}](${linkSubType.link})`
      )
    );
  }
  for (const breakoutSubType of displayType.breakoutSubTypes) {
    renderSchema({
      renderer,
      schema: breakoutSubType.schema,
      docsData,
      baseHeadingLevel,
      topLevelName: breakoutSubType.label,
    });
  }
}

export function renderSchema({
  renderer,
  schema,
  docsData,
  baseHeadingLevel,
  topLevelName,
}: RenderSchemaOptions) {
  function renderObjectProperties(
    objectValue: ObjectValue,
    { isOpenOnLoad = false }: { isOpenOnLoad?: boolean }
  ) {
    renderer.beginExpandableSection(topLevelName, {
      isOpenOnLoad,
    });
    for (const [key, value] of Object.entries(objectValue.properties)) {
      if (value.type === "chunk") {
        renderer.appendHeading(5, key);
        const schemaChunk = getSchemaFromId(value.chunkId, docsData);
        renderDisplayType({
          renderer,
          value: schemaChunk.chunkData.value,
          baseHeadingLevel,
          docsData,
        });
      } else if (value.type === "enum") {
        renderer.appendHeading(5, key);
        // TODO: this needs to be different
        renderer.appendParagraph(
          `Type: \`${value.values.map((v) => `"${v}"`).join(" | ")}\``
        );
      } else {
        const displayType = getDisplayType(value, docsData);
        renderer.appendHeading(5, key);
        renderer.appendParagraph(`Type: \`${displayType.label}\``);
      }
    }
    renderer.endExpandableSection();
  }

  function renderArrayLikeItems(
    arrayLikeValue: ArrayValue | MapValue | SetValue
  ) {
    renderDisplayType({
      renderer,
      value: arrayLikeValue,
      baseHeadingLevel,
      docsData,
    });
  }

  function renderUnionItems(unionValue: UnionValue) {
    renderDisplayType({
      renderer,
      value: unionValue,
      baseHeadingLevel,
      docsData,
    });
    return;
  }

  function renderBasicItems(primitiveValue: SchemaValue) {
    renderDisplayType({
      renderer,
      value: primitiveValue,
      baseHeadingLevel,
      docsData,
    });
    // TODO: this likely isn't right
    if (primitiveValue.type === "enum") {
      renderer.appendParagraph(
        `Values: ${primitiveValue.values.map((v) => `\`${v}\``).join(", ")}`
      );
    }
  }

  switch (schema.type) {
    case "object": {
      renderObjectProperties(schema, {
        isOpenOnLoad: true,
      });
      break;
    }
    case "map":
    case "set":
    case "array": {
      renderArrayLikeItems(schema);
      break;
    }
    case "union": {
      renderUnionItems(schema);
      break;
    }
    default: {
      renderBasicItems(schema);
      break;
    }
  }
}
