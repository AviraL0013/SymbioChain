"use client";
import { useEffect, useState } from "react";
import { BusinessStatus } from "@symbiochain/shared";
import { AppShell } from "@/features/application/app-shell";
import { timestamp } from "@/features/swarm/format";
import "@/features/cycles/cycles.css";

export function BusinessPage() {
  const [data, setData] = useState<BusinessStatusData | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    let pending = false;
    const refresh = async () => {
      if (pending) return;
      pending = true;
      try {
        const response = await fetch("/api/swarm/business", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw Error();
        const next = BusinessStatus.parse(await response.json());
        if (!controller.signal.aborted) {
          setData(next);
          setError("");
        }
      } catch {
        if (!controller.signal.aborted)
          setError(
            "Business evidence is unavailable. Retained values are stale; no revenue or profit can be inferred from this connection failure.",
          );
      } finally {
        pending = false;
      }
    };
    void refresh();
    const interval = setInterval(() => void refresh(), 10000);
    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, []);
  return (
    <AppShell
      title="Business evidence"
      description="Track confirmed receipts, reported costs and the remaining economic proof."
      notice="PAPER demonstration. Simulated P&L, capital deposits and internal agent payments are excluded from external business revenue."
    >
      {error && (
        <p role="alert" className="app-field-error">
          {error}
        </p>
      )}
      {!data && !error && <p role="status">Loading business evidence…</p>}
      {data && (
        <>
          <div className="cycle-callout">
            {error ? "Stale record" : "Recorded status"} ·{" "}
            {timestamp(data.capturedAt)}.
            {data.configured
              ? " Business accounting is configured."
              : " A mainnet business receiver and exact payment asset are not configured."}{" "}
            No verified self-funding business is claimed.
          </div>
          <section className="cycle-card">
            <h2>Money received and costs reported</h2>
            <p>
              Invoices are amounts requested. Revenue requires a matching
              finalized Intents transfer from the invoiced payer. Commercial
              identity and operating costs remain accountant-reported.
            </p>
            <dl className="cycle-metrics">
              <div>
                <dt>Confirmed external receipts</dt>
                <dd>{data.confirmedReceiptCount}</dd>
              </div>
              <div>
                <dt>Revenue in payment-asset atoms</dt>
                <dd>{data.revenueAtoms}</dd>
              </div>
              <div>
                <dt>Net across closed cost windows</dt>
                <dd>{data.netAfterReportedCostsAtoms ?? "Unknown"}</dd>
              </div>
              <div>
                <dt>Receipts awaiting cost reconciliation</dt>
                <dd>{data.receiptsAwaitingCostWindow}</dd>
              </div>
              <div>
                <dt>Operating-cost evidence</dt>
                <dd>
                  {data.costVerification === "UNKNOWN"
                    ? "Unknown"
                    : "Accountant reported"}
                </dd>
              </div>
              <div>
                <dt>Full business runway</dt>
                <dd>Unknown</dd>
              </div>
            </dl>
            <p>
              Payment asset: <code>{data.asset ?? "Not configured"}</code>.
              Values are integer atoms of that asset; no USD or NEAR conversion
              is assumed. Closed windows do not establish costs outside their
              observation periods.
            </p>
          </section>
          <section className="cycle-card">
            <h2>What earned proceeds have funded</h2>
            <dl className="cycle-metrics">
              <div>
                <dt>Proceeds reserved, not paid</dt>
                <dd>{data.reservedAtoms}</dd>
              </div>
              <div>
                <dt>Automatic AI-credit purchase</dt>
                <dd>Not implemented</dd>
              </div>
              <div>
                <dt>Credits purchased from proceeds</dt>
                <dd>0</dd>
              </div>
              <div>
                <dt>Business-funded NFT distributions</dt>
                <dd>{data.businessFundedNftDistributions}</dd>
              </div>
            </dl>
            <p>
              A credit balance, grant or staking sync is not a purchase. A
              testnet NFT distribution proves contract mechanics; it does not
              prove that customers funded the payout.
            </p>
            <p>
              Completion needs a provider-supported payment-to-credit flow,
              actual earned proceeds, and confirmed conversion and distribution
              transactions. Mainnet execution also requires a dedicated funded
              account and explicit spending limits.
            </p>
          </section>
        </>
      )}
    </AppShell>
  );
}
type BusinessStatusData = ReturnType<typeof BusinessStatus.parse>;
