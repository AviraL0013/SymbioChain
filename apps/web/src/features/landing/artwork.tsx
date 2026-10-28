import type { SVGProps } from "react";

type ArtProps = SVGProps<SVGSVGElement>;

function Art({ children, ...props }: ArtProps) {
  return (
    <svg
      viewBox="0 0 240 240"
      fill="none"
      stroke="#0f0f0f"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export function EyeArt(props: ArtProps) {
  return (
    <Art {...props}>
      <path
        d="M21 120s35-57 99-57 99 57 99 57-35 57-99 57-99-57-99-57Z"
        fill="#fff"
      />
      <circle cx="120" cy="120" r="44" fill="#05c92f" />
      <circle cx="120" cy="120" r="22" fill="#0f0f0f" />
      <circle cx="129" cy="109" r="8" fill="#fff" stroke="none" />
      <path d="M120 28v17M62 39l10 17M178 39l-10 17M120 195v17M62 201l10-17M178 201l-10-17" />
      <path
        d="m27 67 5 9 10 1-7 7 2 10-10-5-8 5 1-10-7-7 10-1Z"
        fill="#fbe74e"
      />
    </Art>
  );
}

export function BrainArt(props: ArtProps) {
  return (
    <Art {...props}>
      <path
        d="M119 44c-18-22-48-7-48 14-25-3-43 19-36 42-21 16-17 48 4 58-7 28 14 50 38 43 12 23 42 15 43-7V57"
        fill="#ffcadc"
      />
      <path
        d="M121 44c18-22 48-7 48 14 25-3 43 19 36 42 21 16 17 48-4 58 7 28-14 50-38 43-12 23-42 15-43-7V57"
        fill="#fff"
      />
      <path d="M71 58c-2 15 3 25 17 29M39 100c17-7 32 0 34 16M39 158c16 4 31-5 32-18M77 201c-8-12-7-28 5-35M169 58c2 15-3 25-17 29M201 100c-17-7-32 0-34 16M201 158c-16 4-31-5-32-18M163 201c8-12 7-28-5-35M89 112c20 0 23 24 7 34M151 112c-20 0-23 24-7 34" />
      <path d="m196 28 5 14 15 5-15 5-5 14-5-14-15-5 15-5Z" fill="#05c92f" />
    </Art>
  );
}

export function HandArt(props: ArtProps) {
  return (
    <Art {...props}>
      <path
        d="M70 202c-16-22-30-46-37-61-8-19 8-29 20-15l21 23V55c0-21 24-21 24 0v63-83c0-21 24-21 24 0v82-69c0-21 24-21 24 0v70-48c0-20 24-20 24 0v74c10-21 33-23 34-8 0 15-16 32-25 48l-11 18H70Z"
        fill="#fff"
      />
      <path d="M70 202h101v24H70z" fill="#9dc4f5" />
      <rect
        x="84"
        y="114"
        width="70"
        height="56"
        rx="10"
        fill="#05c92f"
        transform="rotate(-8 119 142)"
      />
      <path d="m105 141 9 9 21-22" strokeWidth="4" />
      <path d="M183 43h21M194 32v22M25 81h15M32 74v15" />
    </Art>
  );
}

export function LoopArt(props: ArtProps) {
  return (
    <Art {...props}>
      <path
        d="M62 77c24-45 95-44 119 3M190 93c22 43-12 96-61 100M110 192c-48-4-80-58-58-99"
        strokeDasharray="5 6"
      />
      <path d="m179 65 5 19-20-2M199 172l-15 15-9-18M30 99l19-10 3 22" />
      <circle cx="65" cy="73" r="29" fill="#9dc4f5" />
      <circle cx="184" cy="88" r="29" fill="#fbe74e" />
      <circle cx="121" cy="194" r="29" fill="#ffcadc" />
      <path d="m118 76-24 51h25l-2 40 30-57h-27l-2-34Z" fill="#05c92f" />
      <path d="M51 73s14-19 28 0c-14 19-28 0-28 0Z" fill="#fff" />
      <circle cx="65" cy="73" r="4" fill="#0f0f0f" />
      <path d="M176 79c-10-7-15 8-6 10-9 10 4 18 10 12M186 76c12-5 17 10 8 13 9 9-3 20-9 12M184 77v25" />
      <path d="m111 194 7 7 14-16" strokeWidth="3" />
    </Art>
  );
}

export function EnclaveArt(props: ArtProps) {
  return (
    <Art {...props}>
      <rect x="39" y="39" width="162" height="162" rx="32" fill="#fff" />
      <rect x="59" y="59" width="122" height="122" rx="20" fill="#9dc4f5" />
      <path d="M102 110V94a18 18 0 0 1 36 0v16" strokeWidth="4" />
      <rect x="91" y="109" width="58" height="48" rx="12" fill="#fbe74e" />
      <circle cx="120" cy="129" r="5" fill="#0f0f0f" />
      <path d="M120 132v10M74 23v16M105 23v16M136 23v16M167 23v16M74 201v16M105 201v16M136 201v16M167 201v16M23 74h16M23 105h16M23 136h16M23 167h16M201 74h16M201 105h16M201 136h16M201 167h16" />
    </Art>
  );
}

export function TokenArt(props: ArtProps) {
  return (
    <Art {...props}>
      <path
        d="m120 24 24 9 26 2 15 22 22 15 2 26 9 22-9 24-2 26-22 15-15 22-26 2-24 9-22-9-26-2-15-22-22-15-2-26-9-24 9-22 2-26 22-15 15-22 26-2Z"
        fill="#fbe74e"
      />
      <circle cx="120" cy="120" r="72" fill="#fff" />
      <path
        d="M145 77c-33-22-68 8-45 28l32 25c21 19-12 48-39 28"
        strokeWidth="15"
      />
      <path d="m119 89 7 22 22 7-22 8-7 23-8-23-22-8 22-7Z" fill="#05c92f" />
    </Art>
  );
}

export function ChainMark({
  chain,
  ...props
}: ArtProps & { chain: "near" | "ethereum" | "solana" }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" {...props}>
      {chain === "near" ? (
        <path
          d="M12 35V13l24 22V13M12 35l10-13M36 13 26 26"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : chain === "ethereum" ? (
        <>
          <path
            d="m24 5 12 20-12 7-12-7L24 5Z"
            fill="currentColor"
            opacity=".9"
          />
          <path
            d="m12 28 12 15 12-15-12 7-12-7Z"
            fill="currentColor"
            opacity=".55"
          />
          <path d="M24 5v27l12-7L24 5Z" fill="currentColor" opacity=".3" />
        </>
      ) : (
        <>
          <path
            d="m13 10-6 7h28l6-7H13ZM7 21l6 7h28l-6-7H7Zm6 11-6 7h28l6-7H13Z"
            fill="currentColor"
          />
        </>
      )}
    </svg>
  );
}

export function SwarmDots() {
  return (
    <span className="swarm-dots" aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}
