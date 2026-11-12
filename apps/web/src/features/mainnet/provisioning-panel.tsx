"use client";
import { useEffect, useState } from "react";
import { MainnetProvisioning } from "@symbiochain/shared";
import { formatAtoms, timestamp } from "@/features/swarm/format";
import { formatNear } from "./format";
export function ProvisioningPanel() {
  const [data, setData] = useState<MainnetProvisioning | null>(null),
    [error, setError] = useState(false);
  useEffect(() => {
    const c = new AbortController();
    void (async () => {
      try {
        const r = await fetch("/api/swarm/mainnet/provisioning", {
          cache: "no-store",
          signal: c.signal,
        });
        if (!r.ok) throw Error();
        const next = MainnetProvisioning.parse(await r.json());
        if (!c.signal.aborted) setData(next);
      } catch {
        if (!c.signal.aborted) setError(true);
      }
    })();
    return () => c.abort();
  }, []);
  return (
    <section className="cycle-card" aria-labelledby="mainnet-provisioning">
      <h2 id="mainnet-provisioning">Owner funding and permission receipts</h2>
      {error && (
        <p role="alert">
          Provisioning evidence unavailable. No funded execution is inferred.
        </p>
      )}
      {!data && !error && (
        <p role="status">Loading recorded funding outcomes…</p>
      )}
      {data && (
        <>
          <p>
            Recorded {timestamp(data.checkedAt)}. This sequence includes four
            real owner funding transfers and two permission calls. Its
            conversion outcomes are preserved below; current wallet balances
            appear in the preparation panel.
          </p>
          <p>
            Capital sent: {formatNear(data.capitalSentYocto, 2)} NEAR. Capital
            returned: {formatNear(data.capitalReturnedYocto, 2)} native NEAR.
            Retained capital at this observation:{" "}
            {formatNear(data.retainedCapitalYocto, 2)} NEAR of original input.
            Network fees for this sequence:{" "}
            {formatNear(data.networkFeesYocto, 8)} NEAR. Additional test
            planning ceiling: {formatNear(data.additionalCeilingYocto, 2)} NEAR.
          </p>
          {data.conversions.map((c) => {
            const label = c.asset.includes("base-0x")
              ? "Base USDC"
              : c.asset.includes("base.omft")
                ? "Base ETH"
                : "Solana SOL";
            return (
              <div key={c.asset} className="cycle-card">
                <h3>
                  {label} · {c.status}
                </h3>
                {c.actualOutputAtoms !== null && (
                  <p>
                    Confirmed output:{" "}
                    {formatAtoms(
                      c.actualOutputAtoms,
                      label === "Base USDC" ? 6 : label === "Base ETH" ? 18 : 9,
                    )}{" "}
                    {label.split(" ").at(-1)}.
                  </p>
                )}
                {c.status === "REFUNDED" && (
                  <p>
                    Quote expired. {formatNear(c.refundYocto, 2)} native NEAR
                    returned to the owner; this attempt did not fund destination
                    gas.
                  </p>
                )}
                {c.refundReceipts.map((r) => (
                  <p key={r.hash}>
                    <a href={r.url} target="_blank" rel="noopener noreferrer">
                      View verified native refund ↗
                    </a>
                  </p>
                ))}
                {c.destinationHashes.map((h) => (
                  <p key={h}>
                    <a
                      href={`https://basescan.org/tx/${h}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View confirmed destination receipt ↗
                    </a>
                  </p>
                ))}
              </div>
            );
          })}
          <p>
            Owner-approved limits:{" "}
            {formatAtoms(data.limits.maxTradeUsdcAtoms, 6)} USDC per
            authorization / {formatAtoms(data.limits.maxDailyUsdcAtoms, 6)} USDC
            daily. Native SOL caps: {formatAtoms(data.limits.maxSolLamports, 9)}{" "}
            SOL / {formatAtoms(data.limits.maxDailySolLamports, 9)} SOL daily.
            Native treasury reserve:{" "}
            {formatNear(data.limits.nativeReserveYocto, 2)} NEAR.
          </p>
          {[...data.funding, ...data.permissions].map((r) => (
            <p key={r.hash}>
              <a href={r.url} target="_blank" rel="noopener noreferrer">
                {r.label.replaceAll("_", " ")} receipt ↗
              </a>
            </p>
          ))}
          <p>
            These are owner-funded capital movements and permissions. They
            establish neither TEE-approved AI execution, external revenue,
            business profit nor purchased compute credits.
          </p>
        </>
      )}
    </section>
  );
}
