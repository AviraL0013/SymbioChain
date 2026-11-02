import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { format } from "prettier";

const backend = process.argv[2];
if (!backend)
  throw new Error(
    "Usage: node scripts/sync-viewer-contract.mjs /path/to/symbiochain-core",
  );
for (const name of ["viewer-contract", "viewer-details-contract"]) {
  const source = await readFile(resolve(backend, `src/${name}.ts`), "utf8");
  await writeFile(
    new URL(`../packages/shared/src/${name}.ts`, import.meta.url),
    await format(source, { parser: "typescript", singleQuote: false }),
  );
}
