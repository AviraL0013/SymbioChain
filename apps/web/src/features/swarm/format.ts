import type { ViewerSnapshot } from "@symbiochain/shared";

/** Keep monetary values in integer space, including values beyond Number.MAX_SAFE_INTEGER. */
export function formatAtoms(
  value: string | null | undefined,
  decimals: number,
) {
  if (value == null) return "—";
  const atoms = BigInt(value);
  const absolute = atoms < 0n ? -atoms : atoms;
  const scale = 10n ** BigInt(decimals);
  const fraction = (absolute % scale)
    .toString()
    .padStart(decimals, "0")
    .replace(/0+$/, "");
  return `${atoms < 0n ? "−" : ""}${(absolute / scale).toLocaleString("en-US")}${fraction ? `.${fraction}` : ""}`;
}

export function timestamp(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

export function workerStatus(
  worker: ViewerSnapshot["workers"][number] | undefined,
  now: string | undefined,
) {
  if (!worker) return "Unknown";
  if (worker.paused) return "Paused";
  if (!worker.heartbeat || !now) return "No heartbeat";
  return Date.parse(now) - Date.parse(worker.heartbeat) > 90_000
    ? "Stale"
    : "Online";
}

export const agentInfo = [
  {
    role: "SCOUT",
    name: "EYE",
    title: "The scout",
    summary: "Find the opportunity.",
    detail: "Quotes candidate routes before policy assessment.",
    color: "blue",
  },
  {
    role: "BRAIN",
    name: "BRAIN",
    title: "The assessor",
    summary: "Think before acting.",
    detail: "Checks policy and records inference evidence.",
    color: "yellow",
  },
  {
    role: "HAND",
    name: "HAND",
    title: "The executor",
    summary: "Put the decision to work.",
    detail: "Tracks execution, settlement and cost-gated receipts.",
    color: "pink",
  },
] as const;

export const agentName = (role: string) => (role === "SCOUT" ? "EYE" : role);
