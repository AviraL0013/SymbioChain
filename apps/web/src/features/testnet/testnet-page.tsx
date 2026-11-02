"use client";
import { useEffect, useState } from "react";
import { TestnetReport } from "@symbiochain/shared";
import { AppShell } from "@/features/application/app-shell";
import { timestamp } from "@/features/swarm/format";
import "@/features/cycles/cycles.css";

const names = {
  network: "Network identity",
  deployment: "Treasury deployment",
  roles: "Agent permissions",
  policy: "Spending and chain limits",
  pause: "Pause and resume",
  services: "Agent service payments",
  evm_signature: "EVM MPC signature",
  solana_signature: "Solana MPC signature",
  settlement: "Market settlement",
  receipt: "Testnet NFT receipt",
  dividends: "Test-token distribution",
  tee_hardware: "TEE hardware evidence",
  tee_deployment: "TEE deployment approval",
  inference: "Signed AI completion",
};
export function TestnetPage() {
  const [report, setReport] = useState<TestnetReport | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/swarm/testnet", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw Error("The rehearsal report is unavailable.");
        setReport(TestnetReport.parse(await response.json()));
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setError("The rehearsal report is unavailable. Refresh to retry.");
      });
    return () => controller.abort();
  }, []);
  return (
    <AppShell
      title="Testnet rehearsal"
      description="Inspect recorded contract checks, signatures and verification gates."
      notice="Separate testnet evidence. The agent dashboard remains PAPER; settlement and economics here use explicit fixtures."
    >
      {error && (
        <p className="app-field-error" role="alert">
          {error}
        </p>
      )}
      {!report && !error && <p role="status">Loading rehearsal evidence…</p>}
      {report && (
        <>
          <div className="cycle-callout">
            Historical evidence from a recorded rehearsal. Hardware evidence
            does not establish deployment approval or a verified AI response.
            Simulated settlement does not prove real profit.
          </div>
          <div className="cycle-grid">
            <section className="cycle-card">
              <h2>Execution scope</h2>
              <dl className="cycle-metrics">
                <div>
                  <dt>Network</dt>
                  <dd>NEAR testnet</dd>
                </div>
                <div>
                  <dt>Recorded at</dt>
                  <dd>
                    {report.capturedAt
                      ? timestamp(report.capturedAt)
                      : "Not run"}
                  </dd>
                </div>
                <div>
                  <dt>Settlement / economics</dt>
                  <dd>SIMULATED</dd>
                </div>
                <div>
                  <dt>Mainnet transactions</dt>
                  <dd>{report.mainnetTransactions}</dd>
                </div>
                <div>
                  <dt>Paid inference requests</dt>
                  <dd>{report.paidInferenceRequests}</dd>
                </div>
              </dl>
            </section>
            <section className="cycle-card">
              <h2>Published artifact</h2>
              <dl className="cycle-metrics">
                <div>
                  <dt>Contract</dt>
                  <dd>
                    {report.contractId ? (
                      <a
                        href={`https://testnet.nearblocks.io/address/${report.contractId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {report.contractId} ↗
                      </a>
                    ) : (
                      "Not deployed"
                    )}
                  </dd>
                </div>
                <div>
                  <dt>WASM SHA-256</dt>
                  <dd>
                    <code>{report.artifactHash ?? "Not recorded"}</code>
                  </dd>
                </div>
                <div>
                  <dt>Run</dt>
                  <dd>
                    <code>{report.runId ?? "Not run"}</code>
                  </dd>
                </div>
              </dl>
            </section>
          </div>
          <section className="cycle-card">
            <h2>Checks and remaining gates</h2>
            <ul className="cycle-timeline">
              {report.checks.map((check) => (
                <li key={check.id}>
                  <strong>
                    {names[check.id]} · {check.status}
                  </strong>
                  <p>{check.detail}</p>
                </li>
              ))}
            </ul>
          </section>
          <section className="cycle-card">
            <h2>NEAR testnet transactions</h2>
            <p>
              Expected policy rejections appear as rejected transactions.
              Signature checks do not imply a transaction was broadcast on
              Ethereum or Solana.
            </p>
            {report.transactions.length === 0 ? (
              <p className="app-muted">No transactions recorded.</p>
            ) : (
              <ul className="cycle-timeline">
                {report.transactions.map((tx) => (
                  <li key={tx.hash}>
                    <strong>
                      {tx.operation.replaceAll("-", " ")} ·{" "}
                      {tx.success ? "CONFIRMED" : "REJECTED"}
                    </strong>
                    <a
                      href={`https://testnet.nearblocks.io/txns/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <code>{tx.hash}</code> ↗
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </AppShell>
  );
}
