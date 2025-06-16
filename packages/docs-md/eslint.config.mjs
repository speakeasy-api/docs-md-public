import { resolve } from "node:path";

import { getNodeESLintConfig } from "@speakeasy-api/config";
import { getDirname } from "cross-dirname";
import { globalIgnores } from "eslint/config";

const gitignorePath = resolve(getDirname(), "..", "..", ".gitignore");

export default [
  ...getNodeESLintConfig({
    gitignorePaths: gitignorePath,
    rootDir: getDirname(),
    entryPoints: {
      "eslint.config.mjs": ["default"],
      "src/index.ts": ["Settings", "TryItNow", "SnippetAI"],
      "assets/SideBar/index.tsx": ["SideBar", "SideBarCta"],
    },
    ignores: ["src/generator/docsData/wasm_exec.js"],
  }),
  globalIgnores(["assets/SnippetAI/**/*"]),
];
