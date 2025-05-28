import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

import arg from "arg";
import { load } from "js-yaml";

import { generateChunks } from "../generator/generateChunks.ts";

const args = arg({
  "--help": Boolean,
  "--spec": String,
  "--out-dir": String,
  "-s": "--spec",
  "-o": "--out-dir",
});

function printHelp() {
  console.log(`Usage: docsmd [options]

Options:
  --help, -h     Show this help message
  --spec, -s     Path to OpenAPI spec
  --out-dir, -o  Output directory`);
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

const outDir = args["--out-dir"];

if (!outDir) {
  console.error("Missing required argument: --out-dir\n");
  printHelp();
  process.exit(1);
}

const specData = readFileSync(spec, "utf-8");
const schema = JSON.stringify(load(specData));

const chunkContents = await generateChunks(schema, outDir);

for (const [filename, contents] of Object.entries(chunkContents)) {
  mkdirSync(dirname(filename), {
    recursive: true,
  });
  writeFileSync(filename, contents, {
    encoding: "utf-8",
  });
}
