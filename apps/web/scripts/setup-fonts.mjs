import { access, mkdir, writeFile } from "node:fs/promises";

const directory = new URL("../public/fonts/", import.meta.url);
const formats = ["woff2", "ttf"];
const missing = [];
for (const format of formats) {
  try {
    await access(new URL(`clash-display-semibold.${format}`, directory));
  } catch {
    missing.push(format);
  }
}
if (missing.length) {
  const response = await fetch(
    "https://api.fontshare.com/v2/css?f[]=clash-display@600&display=swap",
    { signal: AbortSignal.timeout(20000) },
  );
  if (!response.ok)
    throw new Error(`Fontshare stylesheet failed: ${response.status}`);
  const css = await response.text();
  const face = css.match(
    /@font-face\s*\{[^}]*font-family:\s*'Clash Display'[^}]*\}/,
  )?.[0];
  if (!face)
    throw new Error("Clash Display is missing from the official stylesheet.");
  await mkdir(directory, { recursive: true });
  for (const format of missing) {
    const path = face.match(
      new RegExp(`url\\(['"]?([^)'" ]+\\.${format})['"]?\\)`),
    )?.[1];
    if (!path) throw new Error(`Official ${format} font URL is missing.`);
    const url = new URL(path, "https://api.fontshare.com");
    if (url.protocol !== "https:" || url.hostname !== "cdn.fontshare.com")
      throw new Error("Unexpected font download host.");
    const font = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!font.ok) throw new Error(`Font download failed: ${font.status}`);
    const bytes = Buffer.from(await font.arrayBuffer());
    const signature = bytes.subarray(0, 4).toString("hex");
    if (signature !== (format === "woff2" ? "774f4632" : "00010000"))
      throw new Error(`Invalid ${format} font file.`);
    await writeFile(
      new URL(`clash-display-semibold.${format}`, directory),
      bytes,
    );
  }
}
