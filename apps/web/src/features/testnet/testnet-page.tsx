"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
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
    const refresh = () =>
      void fetch("/api/swarm/testnet", {
        cache: "no-store",
        signal: controller.signal,
      })
        .then(async (response) => {
          if (!response.ok) throw Error("The rehearsal report is unavailable.");
          setReport(TestnetReport.parse(await response.json()));
          setError("");
        })
        .catch(() => {
          if (!controller.signal.aborted)
            setError("The rehearsal report is unavailable. Refresh to retry.");
        });
    refresh();
    const poll = setInterval(refresh, 10000);
    return () => {
      controller.abort();
      clearInterval(poll);
    };
  }, []);
  return (
    <AppShell
      title="Testnet rehearsal"
      description="Inspect recorded contract checks, signatures and verification gates."
      notice="Historical NEAR testnet evidence. The current mainnet dashboard is separate; settlement and economics in this rehearsal are SIMULATED."
    >
      <div className="cycle-callout">
        This page is the historical testnet archive.{" "}
        <Link href="/evidence">
          Open Execution evidence for the completed mainnet checks and funding
          receipt ↗
        </Link>
      </div>
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
          {report.swarm && (
            <section className="cycle-card">
              <h2>Integrated testnet agent workflow</h2>
              <p>
                {report.swarm.stage} · {report.swarm.status}. This recorded
                workflow has its own run identity and guarded checkpoints.
                Market settlement and economics remain SIMULATED, including any
                positive accountant fixture used to exercise NFT minting.
              </p>
              <dl className="cycle-metrics">
                <div>
                  <dt>Run</dt>
                  <dd>
                    <code>{report.swarm.runId}</code>
                  </dd>
                </div>
                <div>
                  <dt>Last recorded</dt>
                  <dd>{timestamp(report.swarm.updatedAt)}</dd>
                </div>
                <div>
                  <dt>Paid requests / reserved attempts</dt>
                  <dd>{report.swarm.paidInferenceRequests}</dd>
                </div>
                <div>
                  <dt>Verified model response</dt>
                  <dd>{report.swarm.inference?.status ?? "Not verified"}</dd>
                </div>
                <div>
                  <dt>Provider charge (USD micros)</dt>
                  <dd>
                    {report.swarm.billedUsdMicros ?? "Unknown / not purchased"}
                  </dd>
                </div>
                <div>
                  <dt>Destination execution</dt>
                  <dd>{report.swarm.execution?.status ?? "Not executed"}</dd>
                </div>
                <div>
                  <dt>Testnet receipt</dt>
                  <dd>{report.swarm.receiptTokenId ?? "Not minted"}</dd>
                </div>
              </dl>
              <ul className="cycle-timeline">
                {report.swarm.events.map((event, index) => (
                  <li key={`${event.at}:${index}`}>
                    <strong>
                      {event.stage} · {event.code}
                    </strong>
                    <p>{timestamp(event.at)}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {!!report.executions?.length && (
            <section className="cycle-card">
              <h2>Destination-chain execution checks</h2>
              <p>
                Authorization fixtures verify testnet execution independently of
                AI approval. They are not AI-approved trades or Intents
                settlements.
              </p>
              <ul className="cycle-timeline">
                {report.executions.map((execution) => (
                  <li key={execution.chain}>
                    <strong>
                      {execution.chain} · {execution.status}
                    </strong>
                    <p>
                      {execution.code} · {execution.source}
                    </p>
                    <p>
                      Derived wallet: <code>{execution.sender}</code>
                    </p>
                    {execution.txHash && (
                      <a
                        href={
                          execution.chain === "eip155:11155111"
                            ? `https://sepolia.etherscan.io/tx/${execution.txHash}`
                            : `https://explorer.solana.com/tx/${execution.txHash}?cluster=devnet`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <code>{execution.txHash}</code> ↗
                      </a>
                    )}
                    {execution.nearTransactions?.map((tx) => (
                      <p key={tx.hash}>
                        <a
                          href={`https://testnet.nearblocks.io/txns/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          NEAR {tx.operation.split(":").at(-1)} ·{" "}
                          <code>{tx.hash}</code> ↗
                        </a>
                      </p>
                    ))}
                  </li>
                ))}
              </ul>
            </section>
          )}
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
