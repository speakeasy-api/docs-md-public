// These types are mirrors of the types in Go defined at:
// https://github.com/speakeasy-api/openapi-generation/blob/9360544609e4c3a0320bd0b2a039b49008944197/internal/docsData
// One day, we'll create an automated mechanism to keep them in sync

// About chunks

type Server = {
  url: string;
};

type AboutData = {
  title: string;
  description: string;
  version: string;
  servers: Server[];
};

export type AboutChunk = {
  id: string;
  chunkData: AboutData;
  chunkType: "about";
};

// Operation chunks

type Parameter = {
  name: string;
  description: string | null;
  required: boolean;
  fieldChunkId: string;
};

type Response = {
  description: string | null;
  contentType: string;
  contentChunkId: string;
};

type RequestBody = {
  description: string | null;
  required: boolean;
  contentChunkId: string;
};

type OperationData = {
  operationId: string;
  path: string;
  method: string;
  tag: string;
  summary: string | null;
  description: string | null;
  parameters: Parameter[];
  requestBody: RequestBody | null;
  responses: Record<string, Response[]>;
};

export type OperationChunk = {
  id: string;
  chunkData: OperationData;
  chunkType: "operation";
};

// Schema chunks

type ChunkValue = {
  type: "chunk";
  chunkId: string;
};

type BaseValue = {
  examples: string[];
};

type BooleanValue = BaseValue & {
  type: "boolean";
};

type StringValue = BaseValue & {
  type: "string";
};

type DateValue = BaseValue & {
  type: "date";
};

type DateTimeValue = BaseValue & {
  type: "datetime";
};

type NumberValue = BaseValue & {
  type: "number";
};

type IntegerValue = BaseValue & {
  type: "integer";
};

type Int32Value = BaseValue & {
  type: "int32";
};

type BigIntValue = BaseValue & {
  type: "bigint";
};

type EnumValue = BaseValue & {
  type: "enum";
  values: string[];
};

export type ObjectValue = BaseValue & {
  type: "object";
  properties: Record<string, SchemaValue>;
  required: string[];
};

export type ArrayValue = BaseValue & {
  type: "array";
  items: SchemaValue;
};

export type UnionValue = BaseValue & {
  type: "union";
  values: SchemaValue[];
};

type SchemaValue =
  | ChunkValue
  | BooleanValue
  | StringValue
  | DateValue
  | DateTimeValue
  | NumberValue
  | IntegerValue
  | Int32Value
  | BigIntValue
  | ObjectValue
  | ArrayValue
  | UnionValue
  | EnumValue;

export type SchemaChunk = {
  id: string;
  chunkData: { name: string; value: SchemaValue };
  chunkType: "schema";
};

// Tag chunk

type TagData = {
  name: string;
  operationChunkIds: string[];
};

export type TagChunk = {
  id: string;
  chunkData: TagData;
  chunkType: "tag";
};

// All chunks

export type Chunk = AboutChunk | OperationChunk | SchemaChunk | TagChunk;
