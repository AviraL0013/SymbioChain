"use client";
import { useEffect, useState } from "react";
import { OperatingStatus } from "@symbiochain/shared";
import { timestamp } from "@/features/swarm/format";
import "./operating-boundaries.css";

export function OperatingBoundaries() {
  const [data, setData] = useState<ReturnType<
    typeof OperatingStatus.parse
  > | null>(null);
  const [stale, setStale] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    let pending = false;
    async function refresh() {
      if (pending) return;
      pending = true;
      try {
        const response = await fetch("/api/swarm/operations", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw Error();
        const next = OperatingStatus.parse(await response.json());
        if (next.mode !== "PAPER") throw Error();
        if (!controller.signal.aborted) {
          setData(next);
          setStale(false);
        }
      } catch {
        if (!controller.signal.aborted) setStale(true);
      } finally {
        pending = false;
      }
    }
    void refresh();
    const timer = setInterval(() => void refresh(), 15000);
    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, []);
  return (
    <aside
      className="ops-boundaries"
      aria-label="Verification and billing boundaries"
    >
      {!data ? (
        <p role="status">
          {stale
            ? "Verification and billing status unavailable. No approval or revenue is inferred."
            : "Loading verification and billing status…"}
        </p>
      ) : (
        <>
          {stale && (
            <p role="status">
              Connection unavailable — retained status is stale.
            </p>
          )}
          <dl>
            <div>
              <dt>TEE execution</dt>
              <dd className="ops-quarantined">QUARANTINED</dd>
            </div>
            <div>
              <dt>Credit bridge</dt>
              <dd>HUMAN IN THE LOOP</dd>
            </div>
            <div>
              <dt>External revenue</dt>
              <dd>
                {data.revenue.status === "UNPROVEN"
                  ? "UNPROVEN"
                  : "Receipts recorded; demand unproven"}
              </dd>
            </div>
          </dl>
          <p>
            The recorded approval gate is closed. PAPER inference is a local
            simulation, with no enclave or TEE signature. Manual purchase
            reports do not verify provider credits.
          </p>
          <p>
            Audit: {timestamp(data.tee.auditCapturedAt)} · Pending operator
            top-ups: {data.bridge.waitingOperator} · Provider-verified
            purchases: 0
          </p>
        </>
      )}
    </aside>
  );
}
