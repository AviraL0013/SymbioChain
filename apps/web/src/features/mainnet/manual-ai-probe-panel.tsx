"use client";
import { useEffect, useState } from "react";
import { ManualAiProbe } from "@symbiochain/shared";
import { formatAtoms, timestamp } from "@/features/swarm/format";

export function ManualAiProbePanel() {
  const [data, setData] = useState<ManualAiProbe | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch("/api/swarm/manual-ai-probe", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw Error();
        const evidence = ManualAiProbe.parse(await response.json());
        if (!controller.signal.aborted) setData(evidence);
      } catch {
        if (!controller.signal.aborted) setUnavailable(true);
      }
    })();
    return () => controller.abort();
  }, []);
  return (
    <section className="cycle-card" aria-labelledby="manual-ai-probe">
      <h2 id="manual-ai-probe">Manual API Probe (Unverified Inference)</h2>
      {unavailable && (
        <p role="alert">
          Manual probe evidence unavailable. No successful inference is
          inferred.
        </p>
      )}
      {!data && !unavailable && (
        <p role="status">Loading recorded manual probe…</p>
      )}
      {data && (
        <>
          <p>
            Successful response received · recorded {timestamp(data.checkedAt)}{" "}
            · HTTP {data.httpStatus}.
          </p>
          <p>
            Purpose: validate API authentication and model availability. The
            configured organization binding was not independently verified by
            this response.
          </p>
          <dl className="cycle-metrics evidence-metrics">
            <div>
              <dt>Model</dt>
              <dd>{data.returnedModel}</dd>
            </div>
            <div>
              <dt>Expected response</dt>
              <dd>{data.expectedResponse}</dd>
            </div>
            <div>
              <dt>Manual model requests</dt>
              <dd>{data.inferenceRequests}</dd>
            </div>
            <div>
              <dt>Automated model requests</dt>
              <dd>{data.automatedInferenceRequests}</dd>
            </div>
            <div>
              <dt>Token usage</dt>
              <dd>
                {data.usage.promptTokens} input · {data.usage.completionTokens}{" "}
                output
              </dd>
            </div>
            <div>
              <dt>Provider-reported cost</dt>
              <dd>
                {data.billing.costNanoUsd === null
                  ? "Pending billing reconciliation"
                  : `$${formatAtoms(data.billing.costNanoUsd, 9)}`}
              </dd>
            </div>
            <div>
              <dt>Per-request ceiling</dt>
              <dd>$0.10</dd>
            </div>
            <div>
              <dt>Treasury funds used</dt>
              <dd>NONE</dd>
            </div>
          </dl>
          <p>
            Security boundary: this isolated request bypassed the automated
            treasury and remains unverified inference. It does not establish TEE
            workload approval or a verified response signature, unlock trading,
            or change on-chain permissions. Automated execution remains
            disarmed.
          </p>
          <p>
            The raw response is retained privately. This page publishes only
            bounded metadata and its SHA-256 digest.
          </p>
          <p>
            <code>{data.responseSha256}</code>
          </p>
          <p>
            <a
              href="https://github.com/SuyashAlphaC/symbiochain-core/blob/main/artifacts/manual-ai-probe.json"
              target="_blank"
              rel="noopener noreferrer"
            >
              View sanitized manual probe evidence ↗
            </a>
          </p>
        </>
      )}
    </section>
  );
}
