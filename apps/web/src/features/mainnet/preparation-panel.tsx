"use client";
import { useEffect, useState } from "react";
import { MainnetPreparation } from "@symbiochain/shared";
import { timestamp } from "@/features/swarm/format";

export function PreparationPanel() {
  const [data, setData] = useState<MainnetPreparation | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    let pending = false;
    const read = async () => {
      if (pending) return;
      pending = true;
      try {
        const r = await fetch("/api/swarm/mainnet/preparation", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!r.ok) throw Error();
        const next = MainnetPreparation.parse(await r.json());
        if (!controller.signal.aborted) {
          setData(next);
          setError(false);
        }
      } catch {
        if (!controller.signal.aborted) setError(true);
      } finally {
        pending = false;
      }
    };
    void read();
    const timer = setInterval(() => void read(), 30000);
    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, []);
  const report = data?.report;
  return (
    <section className="cycle-card" aria-labelledby="mainnet-preparation">
      <h2 id="mainnet-preparation">Mainnet trading preparation</h2>
      <p>
        Autonomous read-only checks run independently of TEE approval. They
        derive wallets, inspect real mainnet balances and verify signed dry
        quotes without purchasing inference, reserving capital or submitting a
        transaction.
      </p>
      {error && (
        <p role="alert">
          Preparation observations unavailable.{" "}
          {report ? "Retained results are stale." : "No readiness is inferred."}
        </p>
      )}
      {!data && !error && <p role="status">Reading preparation results…</p>}
      {data && (
        <p>
          Preparation worker: {data.enabled ? "ACTIVE · READ ONLY" : "OFF"}.
          Paid execution remains{" "}
          {data.executionEnabled ? "separately controlled" : "DISARMED"}; TEE:{" "}
          {data.tee}.
        </p>
      )}
      {data && !report && <p>No mainnet preparation run recorded yet.</p>}
      {report && (
        <>
          <p>
            Observed {timestamp(report.capturedAt)}
            {data?.stale || error ? " · STALE" : ""}. Next gate:{" "}
            {report.nextGate.replaceAll("_", " ")}.
          </p>
          <ul className="cycle-timeline evidence-checks">
            {report.checks.map((c) => (
              <li key={c.id}>
                <h3>
                  {c.id.replaceAll("_", " ")} · {c.status}
                </h3>
                <p>{c.detail}</p>
              </li>
            ))}
          </ul>
          <dl className="cycle-metrics evidence-metrics">
            {report.wallets.map((w) => (
              <div key={w.chain}>
                <dt>{w.chain} derived wallet</dt>
                <dd>
                  <code>{w.address}</code>
                  <br />
                  Native balance: {w.nativeAtoms}{" "}
                  {w.chain === "BASE" ? "wei" : "lamports"}
                  {w.tokenAtoms !== null && (
                    <>
                      <br />
                      USDC balance: {w.tokenAtoms} atoms
                    </>
                  )}
                  <br />
                  Observed block/slot: {w.block}
                </dd>
              </div>
            ))}
          </dl>
          <p>
            Round-trip preview: {report.quote.status}. Input:{" "}
            {report.quote.inputAtoms} USDC atoms.{" "}
            {report.quote.minimumOutputAtoms !== null && (
              <>
                Minimum return: {report.quote.minimumOutputAtoms} atoms. Profit
                floor: {report.quote.passesProfitFloor ? "PASS" : "REJECTED"}.
              </>
            )}
          </p>
          <p>
            These checks do not prove a completed trade, external revenue, a
            provider credit purchase or business-funded NFT distributions.
            Wallet funding and owner permissions remain independently required.
          </p>
        </>
      )}
    </section>
  );
}
