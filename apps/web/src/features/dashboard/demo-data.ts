import type { DecisionLog, TransactionLog } from "@symbiochain/shared";

export type Scenario = "funded" | "low" | "exhausted" | "offline";
export const DEMO_EPOCH = Date.UTC(2026, 10, 1, 8, 30);
export const COMPUTE_RESERVE = 4;

export const demoDecisions: DecisionLog[] = [
  {
    id: "sample-5",
    timestamp: DEMO_EPOCH - 12000,
    agent: "EYE",
    action: "Route identified",
    details:
      "Sample opportunity: compare USDC settlement routes between Ethereum and Solana.",
  },
  {
    id: "sample-4",
    timestamp: DEMO_EPOCH - 37000,
    agent: "BRAIN",
    action: "Risk assessment complete",
    details:
      "Example policy checks: estimated fees, available liquidity, and compute reserve. This is an illustrative decision, not a verified TEE result.",
  },
  {
    id: "sample-3",
    timestamp: DEMO_EPOCH - 61000,
    agent: "HAND",
    action: "Settlement recorded",
    details:
      "A simulated settlement has been added to the sample history. No transaction was signed or broadcast.",
  },
  {
    id: "sample-2",
    timestamp: DEMO_EPOCH - 94000,
    agent: "SYSTEM",
    action: "Compute reserve checked",
    details:
      "The sample treasury covers the next eight hours of inference at 0.5 NEAR per hour.",
  },
  {
    id: "sample-1",
    timestamp: DEMO_EPOCH - 138000,
    agent: "BRAIN",
    action: "Route rejected",
    details:
      "Illustrative route rejected: estimated execution fees exceed the potential settlement spread.",
  },
];

export const demoEvents = [
  {
    agent: "EYE",
    action: "New route found",
    details:
      "Simulated scan: a candidate route is ready for policy and fee assessment.",
  },
  {
    agent: "BRAIN",
    action: "Risk check started",
    details:
      "Simulated assessment: compare execution cost with the compute reserve before proceeding.",
  },
  {
    agent: "HAND",
    action: "Waiting for approval",
    details:
      "Simulation only: the executor waits for an approved route. No signing request is submitted.",
  },
] satisfies Pick<DecisionLog, "agent" | "action" | "details">[];

export type PreviewTransaction = TransactionLog & {
  sample: true;
  route: string;
};
export const demoTransactions: PreviewTransaction[] = [
  {
    id: "sample-tx-5",
    timestamp: DEMO_EPOCH - 61000,
    txHash: "SAMPLE-0005",
    chain: "SOLANA",
    amount: "12.50",
    asset: "USDC",
    status: "SUCCESS",
    explorerUrl: "",
    sample: true,
    route: "USDC → SOL",
  },
  {
    id: "sample-tx-4",
    timestamp: DEMO_EPOCH - 240000,
    txHash: "SAMPLE-0004",
    chain: "ETHEREUM",
    amount: "25.00",
    asset: "USDC",
    status: "PENDING",
    explorerUrl: "",
    sample: true,
    route: "USDC → ETH",
  },
  {
    id: "sample-tx-3",
    timestamp: DEMO_EPOCH - 480000,
    txHash: "SAMPLE-0003",
    chain: "NEAR",
    amount: "0.40",
    asset: "NEAR",
    status: "SUCCESS",
    explorerUrl: "",
    sample: true,
    route: "Compute allocation",
  },
  {
    id: "sample-tx-2",
    timestamp: DEMO_EPOCH - 720000,
    txHash: "SAMPLE-0002",
    chain: "ETHEREUM",
    amount: "10.00",
    asset: "USDC",
    status: "FAILED",
    explorerUrl: "",
    sample: true,
    route: "USDC → ETH",
  },
  {
    id: "sample-tx-1",
    timestamp: DEMO_EPOCH - 1080000,
    txHash: "SAMPLE-0001",
    chain: "SOLANA",
    amount: "18.00",
    asset: "USDC",
    status: "SUCCESS",
    explorerUrl: "",
    sample: true,
    route: "USDC → SOL",
  },
];

export function treasuryHistory(
  scenario: Scenario,
  range: "6H" | "24H" | "7D",
) {
  const rising = [
    16.2, 17.4, 16.8, 19.1, 18.4, 20.2, 19.7, 22.1, 21.6, 23.8, 23.1, 24.5,
  ];
  const falling = [8.8, 8.2, 7.6, 7.9, 6.3, 5.7, 4.8, 4.1, 3.5, 2.8, 2.3, 1.8];
  const depleted = [7.6, 6.9, 7.1, 6.2, 5.5, 4.9, 4, 3.2, 2.4, 1.6, 0.7, 0];
  const values =
    scenario === "funded" ? rising : scenario === "low" ? falling : depleted;
  const duration = range === "6H" ? 6 : range === "24H" ? 24 : 168;
  return values.map((balance, i) => ({
    timestamp:
      DEMO_EPOCH -
      (duration * 3600000 * (values.length - 1 - i)) / (values.length - 1),
    balance,
  }));
}

export const agentInfo = [
  {
    name: "EYE",
    role: "The scout",
    summary: "Find the opportunity.",
    detail: "Monitors order flow and surfaces candidate routes.",
    color: "blue",
    fundedBalance: "6.80",
  },
  {
    name: "BRAIN",
    role: "The assessor",
    summary: "Think before acting.",
    detail: "Weighs execution risk, policies, and compute cost.",
    color: "yellow",
    fundedBalance: "8.20",
  },
  {
    name: "HAND",
    role: "The executor",
    summary: "Put the decision to work.",
    detail: "Prepares signing after an approved decision.",
    color: "pink",
    fundedBalance: "9.50",
  },
] as const;

export function timeAgo(timestamp: number, now: number) {
  const seconds = Math.max(0, Math.floor((now - timestamp) / 1000));
  if (seconds < 5) return "Just now";
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

export function demoTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}
