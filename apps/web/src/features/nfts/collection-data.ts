export const sampleTokens = [
  {
    id: "003",
    name: "Third cycle",
    profit: 3.2,
    liquidity: 18,
    palette: "pink",
    date: "01 Nov 2026",
    pattern: 2,
  },
  {
    id: "002",
    name: "Second cycle",
    profit: 1.8,
    liquidity: 12,
    palette: "yellow",
    date: "01 Nov 2026",
    pattern: 1,
  },
  {
    id: "001",
    name: "First cycle",
    profit: 2.5,
    liquidity: 15,
    palette: "blue",
    date: "01 Nov 2026",
    pattern: 0,
  },
] as const;
export type SampleToken = (typeof sampleTokens)[number];

export function filterTokens(query: string, sort: string) {
  const term = query.trim().toLowerCase().replace(/^#/, "");
  return sampleTokens
    .filter((t) => `${t.id} ${t.name}`.toLowerCase().includes(term))
    .sort((a, b) =>
      sort === "profit"
        ? b.profit - a.profit
        : sort === "liquidity"
          ? b.liquidity - a.liquidity
          : Number(b.id) - Number(a.id),
    );
}
