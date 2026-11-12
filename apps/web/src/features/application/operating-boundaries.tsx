"use client";
import { useEffect, useState } from "react";
import { useDeployment } from "@/features/mainnet/deployment-provider";
import { OperatingStatus } from "@symbiochain/shared";
import { timestamp } from "@/features/swarm/format";
import { ChevronDown, ShieldAlert } from "lucide-react";
import "./operating-boundaries.css";

export function OperatingBoundaries() {
  const deployment = useDeployment();
  const [data, setData] = useState<ReturnType<
    typeof OperatingStatus.parse
  > | null>(null);
  const [stale, setStale] = useState(false);
  useEffect(() => {
    if (deployment.runtime?.mode !== "PAPER") return;
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
  }, [deployment.runtime?.mode]);
  if (deployment.runtime?.mode === "LIVE")
    return (
      <details className="ops-boundaries" aria-label="Live execution boundary">
        <summary>
          <ShieldAlert size={16} />
          <span>
            <strong>
              Autonomous execution{" "}
              {deployment.mainnet
                ? deployment.mainnet.executionEnabled
                  ? "armed"
                  : "disarmed"
                : "status unavailable"}
              .
            </strong>{" "}
            AI inference remains quarantined.
          </span>
          <ChevronDown size={15} />
        </summary>
        <div className="ops-boundaries-detail">
          <p>
            Inference is blocked by the application-level TEE workload
            measurement policy. Wallet connection does not enable trading,
            minting, or credit purchases.
          </p>
        </div>
      </details>
    );
  return (
    <details
      className="ops-boundaries"
      aria-label="Verification and billing boundaries"
    >
      <summary>
        <ShieldAlert size={16} />
        <span>
          <strong>PAPER simulation.</strong> TEE approval remains closed.{" "}
          {stale &&
            (data
              ? "Retained status is stale."
              : "Verification status unavailable.")}
        </span>
        <ChevronDown size={15} />
      </summary>
      <div className="ops-boundaries-detail">
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
      </div>
    </details>
  );
}
