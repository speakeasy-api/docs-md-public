import { resolve } from "node:path";

import { getNodeESLintConfig } from "@speakeasy-api/config";
import { getDirname } from "cross-dirname";

const gitignorePath = resolve(getDirname(), "..", "..", ".gitignore");

export default getNodeESLintConfig({
  gitignorePaths: gitignorePath,
  rootDir: getDirname(),
  entryPoints: {
    "eslint.config.mjs": ["default"],
    "src/index.ts": ["generateChunks"],
  },
  ignores: ["src/generator/docsData/wasm_exec.js"],
});
