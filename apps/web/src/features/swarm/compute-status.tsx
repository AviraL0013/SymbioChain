"use client";
import Link from "next/link";
import { useSwarm } from "./swarm-provider";
import { formatAtoms } from "./format";
export function ComputeStatus() {
  const { status } = useSwarm();
  return (
    <section className="compute-status" aria-label="Backend execution gates">
      <div>
        <span className="app-muted">APPLICATION COMPUTE ALLOWANCE</span>
        <strong>
          {status?.computeControl.availableUsdMicros != null
            ? `${formatAtoms(status.computeControl.availableUsdMicros, 6)} USD`
            : "Unavailable"}
        </strong>
        <p>
          {status?.computeControl.source === "LOCAL_BUDGET"
            ? "Local spending limit; provider credit balance is unknown."
            : "Waiting for compute policy telemetry."}
        </p>
      </div>
      <div>
        <span className="app-muted">INFERENCE POLICY</span>
        <strong>
          {status?.measurementApprovalConfigured &&
          status.deploymentActionsApprovalConfigured
            ? "Configured"
            : "Awaiting deployment approval"}
        </strong>
        <p>
          {status?.model ?? "Model unavailable"} · configuration status, not a
          fresh attestation.
        </p>
      </div>
      <div>
        <span className="app-muted">EXECUTION MODE</span>
        <strong>PAPER · live trading disabled</strong>
        <p>
          Direct compute purchase remains unavailable.{" "}
          <Link href="/operator">Operator Control →</Link>
        </p>
      </div>
    </section>
  );
}
