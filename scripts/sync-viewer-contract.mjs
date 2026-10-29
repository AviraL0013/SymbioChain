import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { format } from "prettier";

const backend = process.argv[2];
if (!backend)
  throw new Error(
    "Usage: node scripts/sync-viewer-contract.mjs /path/to/symbiochain-core",
  );
const source = await readFile(
  resolve(backend, "src/viewer-contract.ts"),
  "utf8",
);
const destination = new URL(
  "../packages/shared/src/viewer-contract.ts",
  import.meta.url,
);
await writeFile(
  destination,
  await format(source, { parser: "typescript", singleQuote: false }),
);
