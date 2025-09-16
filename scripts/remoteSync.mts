import { runCommand } from "./util.mts";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// Make sure we're on main
const currentBranchOutput = await runCommand(
  "git",
  ["branch", "--show-current"],
  {
    cwd: ROOT_DIR,
    stdio: "pipe",
  }
);
const currentBranch = currentBranchOutput[1]?.trim();
if (currentBranch !== "main") {
  console.error("Must be on main branch");
  process.exit(1);
}

// Make sure there are no uncommitted changes
const statusOutput = await runCommand("git", ["status", "-s"], {
  cwd: ROOT_DIR,
  stdio: "pipe",
});
const status = statusOutput[1]?.trim();
if (status !== "") {
  console.error("Must have no uncommitted changes");
  process.exit(1);
}

// Check if we need to add the remote
const remoteOutput = await runCommand("git", ["remote"], {
  cwd: ROOT_DIR,
  stdio: "pipe",
});
const remotes = remoteOutput[1]
  ?.split("\n")
  .filter(Boolean)
  .map((r) => r.trim());
if (!remotes?.includes("public")) {
  console.log("Adding remote");
  runCommand(
    "git",
    [
      "remote",
      "add",
      "public",
      "https://github.com/speakeasy-api/docs-md-public.git",
    ],
    {
      cwd: ROOT_DIR,
      stdio: "pipe",
    }
  );
}

// Sync code
runCommand(
  "git",
  ["subtree", "push", "--prefix=packages/react", "public", "main"],
  {
    cwd: ROOT_DIR,
  }
);

// Sync tags
runCommand("git", ["push", "public", "--tags"], {
  cwd: ROOT_DIR,
});
