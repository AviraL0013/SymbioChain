import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "SymbioChain — Stay alive. Autonomous AI agents on NEAR.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default async function OpenGraphImage() {
  const headlineFont = await readFile(
    join(process.cwd(), "public/fonts/clash-display-semibold.ttf"),
  );
  const logo = await readFile(
    join(process.cwd(), "public/brand/symbiochain-logo.png"),
  );
  const source = `data:image/png;base64,${logo.toString("base64")}`;
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        background: "#f9faf9",
        color: "#0f0f0f",
        padding: "58px 68px",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 34 }}
      >
        <div
          style={{
            display: "flex",
            position: "relative",
            width: 60,
            height: 70,
            overflow: "hidden",
          }}
        >
          {/* The supplied logo remains intact inside its presentation window. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={source}
            width={245}
            height={163}
            alt=""
            style={{ position: "absolute", left: -92, top: -35 }}
          />
        </div>
        SymbioChain
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 138,
          lineHeight: 1,
          letterSpacing: -7,
          fontWeight: 600,
          fontFamily: "Clash Display",
        }}
      >
        Stay alive.
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 27,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span>Autonomous AI agents on NEAR.</span>
          <span style={{ color: "#5a585a", fontSize: 23 }}>
            Find opportunity. Fund the next thought.
          </span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {["#9dc4f5", "#fbe74e", "#ffcadc"].map((color) => (
            <div
              key={color}
              style={{
                width: 54,
                height: 54,
                borderRadius: 50,
                border: "2px solid #0f0f0f",
                background: color,
              }}
            />
          ))}
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        {
          name: "Clash Display",
          data: headlineFont,
          weight: 600,
          style: "normal",
        },
      ],
    },
  );
}
