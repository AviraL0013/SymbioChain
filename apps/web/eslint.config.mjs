import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  {
    files: ["src/app/opengraph-image.tsx"],
    // ImageResponse renders plain image elements through Satori, not next/image.
    rules: { "@next/next/no-img-element": "off" },
  },
  globalIgnores([".next/**", "out/**", "next-env.d.ts"]),
]);
