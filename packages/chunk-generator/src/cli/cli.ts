import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";

import arg from "arg";
import { load } from "js-yaml";

import { generateChunks } from "../generator/generateChunks.ts";
import { getDirname } from "../util/currentDirName.ts";

const args = arg({
  "--help": Boolean,
  "--spec": String,
  "-s": "--spec",
});

function printHelp() {
  console.log(`Usage: docsmd [options]

Options:
  --help, -h  Show this help message
  --spec, -s  Path to OpenAPI spec`);
}

if (args["--help"]) {
  printHelp();
  process.exit(0);
}

const spec = args["--spec"];

if (!spec) {
  console.error("Missing required argument: --spec\n");
  printHelp();
  process.exit(1);
}

if (!existsSync(spec)) {
  console.error(`Spec file "${spec}" does not exist\n`);
  process.exit(1);
}

const specData = readFileSync(spec, "utf-8");
const schema = JSON.stringify(load(specData));

const baseFolder = join(getDirname(import.meta.url), "..", "..", "docs-dist");
if (existsSync(baseFolder)) {
  rmSync(baseFolder, {
    recursive: true,
  });
}

const chunkContents = await generateChunks(schema, baseFolder);

for (const [filename, contents] of Object.entries(chunkContents)) {
  mkdirSync(dirname(filename), {
    recursive: true,
  });
  writeFileSync(filename, contents, {
    encoding: "utf-8",
  });
}
