export function MetabolismArt({ pattern }: { pattern: number }) {
  return (
    <svg
      viewBox="0 0 400 350"
      fill="none"
      aria-hidden="true"
      className={`metabolism-art art-pattern-${pattern}`}
    >
      <circle cx="200" cy="175" r="128" stroke="currentColor" opacity=".2" />
      <g className="metabolism-orbit">
        {Array.from({ length: pattern === 1 ? 8 : 12 }, (_, i) => (
          <ellipse
            key={i}
            cx="200"
            cy="175"
            rx={pattern === 2 ? 48 : 75}
            ry="126"
            transform={`rotate(${i * (pattern === 1 ? 22.5 : 15)} 200 175)`}
            stroke="currentColor"
            strokeWidth="1.2"
          />
        ))}
      </g>
      <circle cx="200" cy="175" r={pattern === 2 ? 45 : 34} fill="#111" />
      <path
        d="M200 150 C200 170 195 175 175 175 C195 175 200 180 200 200 C200 180 205 175 225 175 C205 175 200 170 200 150Z"
        fill="#c7ff9b"
      />
      <circle cx="200" cy="47" r="5" fill="#111" />
      <circle cx="200" cy="303" r="5" fill="#111" />
    </svg>
  );
}
