"use client";
import { useEffect, useState } from "react";
import { MainnetSettlementFixture } from "@symbiochain/shared";
import { timestamp } from "@/features/swarm/format";
import { formatNear } from "./format";
export function IntentsSettlementPanel() {
  const [data, setData] = useState<MainnetSettlementFixture | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const r = await fetch("/api/swarm/mainnet/settlement", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!r.ok) throw Error();
        const next = MainnetSettlementFixture.parse(await r.json());
        if (!controller.signal.aborted) setData(next);
      } catch {
        if (!controller.signal.aborted) setError(true);
      }
    })();
    return () => controller.abort();
  }, []);
  return (
    <section className="cycle-card" aria-labelledby="intents-settlement">
      <h2 id="intents-settlement">
        Confirmed mainnet internal Intents payments
      </h2>
      {error && (
        <p role="alert">
          Recorded Intents settlement evidence unavailable. No transfer is
          inferred.
        </p>
      )}
      {!data && !error && (
        <p role="status">Loading finalized payment evidence…</p>
      )}
      {data && (
        <>
          <p>
            Recorded {timestamp(data.checkedAt)}. Two real payments used the
            agents&apos; dedicated registered keys; their exact debits, credits,
            nonces and final receipt outcomes were reconciled.
          </p>
          <p>
            <a
              href={data.funding.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              View owner funding receipt ↗
            </a>
            . {formatNear(data.fundedCapitalYocto, 3)} NEAR was wrapped as
            recoverable capital; {formatNear(data.storageCollateralYocto, 5)}{" "}
            NEAR was FT storage collateral.
          </p>
          {data.payments.map((p) => (
            <div key={p.receipt.hash} className="cycle-card">
              <p>
                <code>{p.payer}</code> → <code>{p.recipient}</code>
              </p>
              <p>
                {formatNear(p.amountYocto, 4)} wNEAR · nonce confirmed · fee{" "}
                {formatNear(p.nativeFeeYocto, 8)} NEAR
              </p>
              <a href={p.receipt.url} target="_blank" rel="noopener noreferrer">
                View finalized agent payment ↗
              </a>
            </div>
          ))}
          <p>
            Total network fees, including the failed funding attempt and two
            gas-allowance repairs: {formatNear(data.totalNetworkFeesYocto, 8)}{" "}
            NEAR. Overall test planning ceiling:{" "}
            {formatNear(data.totalPlanningCeilingYocto, 2)} NEAR.
          </p>
          <p>
            These are team-funded internal transfers. They do not establish a
            market swap, TEE-approved AI execution, external revenue, business
            profit or a purchased compute credit.
          </p>
        </>
      )}
    </section>
  );
}
