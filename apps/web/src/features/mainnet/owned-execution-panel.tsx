"use client";
import { useEffect, useState } from "react";
import { MainnetOwnedExecution } from "@symbiochain/shared";
import { formatAtoms, timestamp } from "@/features/swarm/format";
import { formatNear } from "./format";
export function OwnedExecutionPanel() {
  const [data, setData] = useState<MainnetOwnedExecution | null>(null),
    [error, setError] = useState(false);
  useEffect(() => {
    const c = new AbortController();
    void (async () => {
      try {
        const r = await fetch("/api/swarm/mainnet/execution", {
          cache: "no-store",
          signal: c.signal,
        });
        if (!r.ok) throw Error();
        const next = MainnetOwnedExecution.parse(await r.json());
        if (!c.signal.aborted) setData(next);
      } catch {
        if (!c.signal.aborted) setError(true);
      }
    })();
    return () => c.abort();
  }, []);
  return (
    <section className="cycle-card" aria-labelledby="owned-execution">
      <h2 id="owned-execution">Confirmed mainnet MPC execution</h2>
      {error && (
        <p role="alert">
          Controlled execution evidence unavailable. No successful transfer is
          inferred.
        </p>
      )}
      {!data && !error && (
        <p role="status">Loading finalized execution evidence…</p>
      )}
      {data && (
        <>
          <p>
            Recorded {timestamp(data.checkedAt)}. Both transfers used the
            deployed treasury’s scoped Brain, Hand and Accountant keys. The
            contract built the signing payloads, Chain Signatures produced valid
            signatures, destination receipts confirmed, and both contract cycles
            closed.
          </p>
          {data.results.map((r) => (
            <div key={r.id} className="cycle-card">
              <h3>
                {r.chain === "eip155:8453"
                  ? "Base · USDC self-transfer"
                  : "Solana · owned Scout wallet transfer"}
              </h3>
              <p>
                {formatAtoms(r.amountAtoms, r.chain === "eip155:8453" ? 6 : 9)}{" "}
                {r.chain === "eip155:8453" ? "USDC" : "SOL"} · destination
                confirmed · contract {r.contractStatus}.
              </p>
              <p>
                <code>{r.source}</code> → <code>{r.recipient}</code>
              </p>
              <p>
                <a
                  href={r.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View confirmed {r.chain === "eip155:8453" ? "Base" : "Solana"}{" "}
                  transaction ↗
                </a>
              </p>
              {r.nativeReceipts.map((t) => (
                <p key={t.hash}>
                  <a href={t.url} target="_blank" rel="noopener noreferrer">
                    {t.step.replaceAll("_", " ")} NEAR receipt ↗
                  </a>
                </p>
              ))}
            </div>
          ))}
          <p>
            NEAR execution fees: {formatNear(data.executionNativeFeesYocto, 8)}{" "}
            NEAR. All continuation NEAR fees:{" "}
            {formatNear(data.allContinuationNativeFeesYocto, 8)} NEAR. Retained
            capital input: {formatNear(data.retainedCapitalInputYocto, 2)} NEAR;
            additional planning ceiling:{" "}
            {formatNear(data.additionalPlanningCeilingYocto, 2)} NEAR.
            Destination fees are recorded separately in their native units.
          </p>
          <p>
            These are owner-authorized transfer fixtures. They establish no
            TEE-approved AI execution, arbitrage, external revenue, complete net
            profit or NFT mint. The automated execution engine remains disarmed.
          </p>
        </>
      )}
    </section>
  );
}
