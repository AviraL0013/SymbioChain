"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MainnetAcceptance } from "@symbiochain/shared";
import { AppShell } from "@/features/application/app-shell";
import { useDeployment } from "@/features/mainnet/deployment-provider";
import { formatNear } from "@/features/mainnet/format";
import { timestamp } from "@/features/swarm/format";
import funding from "./recorded-mainnet-funding.json";
import { ActivationPanel } from "@/features/mainnet/activation-panel";
import { PreparationPanel } from "@/features/mainnet/preparation-panel";
import { OwnedExecutionPanel } from "@/features/mainnet/owned-execution-panel";
import { ManualAiProbePanel } from "@/features/mainnet/manual-ai-probe-panel";
import { ProvisioningPanel } from "@/features/mainnet/provisioning-panel";
import { IntentsSettlementPanel } from "@/features/mainnet/intents-settlement-panel";
import "@/features/cycles/cycles.css";

export function EvidencePage() {
  const { runtime, mainnet, error, refresh } = useDeployment();
  const [report, setReport] = useState<MainnetAcceptance | null>(null);
  const [reportError, setReportError] = useState("");
  const [generation, setGeneration] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/swarm/mainnet/acceptance", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw Error("Report unavailable");
        setReport(MainnetAcceptance.parse(await response.json()));
        setReportError("");
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setReportError(
            "Recorded mainnet acceptance report unavailable. Refresh to retry; any previous report retains its original date.",
          );
      });
    return () => controller.abort();
  }, [generation]);
  const workers =
    mainnet?.accounts.filter((a) => a.workerEnabled !== null) ?? [];
  return (
    <AppShell
      title="Execution evidence"
      description="Mainnet state, finalized transaction proofs and explicit execution gaps."
      notice="Recorded results apply only to their stated scope and date. Blocked and unexecuted checks do not count as successful execution."
    >
      <section className="cycle-card" aria-labelledby="mainnet-evidence">
        <h2 id="mainnet-evidence">Mainnet deployment and safety checks</h2>
        <p>
          The treasury and agent accounts are deployed on NEAR mainnet. Current
          checks below come from finalized blockchain state; deployment and
          funding do not establish profitable trading or earned revenue.
        </p>
        {error && (
          <p className="app-field-error" role="alert">
            {error}
          </p>
        )}
        {mainnet ? (
          <>
            <p>
              Finalized block {mainnet.block.height} · observed{" "}
              {timestamp(mainnet.capturedAt)}
              {error ? " · STALE" : ""}
            </p>
            <dl className="cycle-metrics evidence-metrics">
              <div>
                <dt>Network</dt>
                <dd>NEAR MAINNET</dd>
              </div>
              <div>
                <dt>Treasury</dt>
                <dd>
                  <a
                    href={`https://nearblocks.io/address/${mainnet.treasuryAccount}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {mainnet.treasuryAccount} ↗
                  </a>
                </dd>
              </div>
              <div>
                <dt>Executable identity</dt>
                <dd>
                  {mainnet.code.matches
                    ? "MATCHES REVIEWED BUILD"
                    : "MISMATCH — REVIEW REQUIRED"}
                </dd>
              </div>
              <div>
                <dt>Treasury policy</dt>
                <dd>{mainnet.paused ? "PAUSED" : "ACTIVE"}</dd>
              </div>
              <div>
                <dt>Execution workers</dt>
                <dd>
                  {workers.filter((a) => a.workerEnabled === false).length} /{" "}
                  {workers.length} disabled
                </dd>
              </div>
              <div>
                <dt>Temporary key</dt>
                <dd>
                  {mainnet.deployment.temporaryKeyRevoked
                    ? "REVOKED"
                    : "REVIEW REQUIRED"}
                </dd>
              </div>
              <div>
                <dt>Runtime execution</dt>
                <dd>{mainnet.executionEnabled ? "ARMED" : "DISARMED"}</dd>
              </div>
              <div>
                <dt>Recorded deployment txs</dt>
                <dd>{mainnet.deployment.transactions.length}</dd>
              </div>
            </dl>
            <p>
              <Link href="/cycles">
                Inspect mainnet deployment transactions ↗
              </Link>
            </p>
          </>
        ) : (
          <p role="status">
            {runtime?.mode === "LIVE"
              ? "Loading finalized mainnet checks…"
              : "Live mainnet observation is unavailable in this runtime. The recorded funding receipt below retains its original network and date."}
          </p>
        )}
        <button
          type="button"
          className="sc-text-button"
          onClick={() => {
            refresh();
            setGeneration((n) => n + 1);
          }}
        >
          Refresh current checks
        </button>
      </section>

      <ActivationPanel />
      <ManualAiProbePanel />
      <IntentsSettlementPanel />
      <OwnedExecutionPanel />
      <ProvisioningPanel />
      <PreparationPanel />
      <section className="cycle-card" aria-labelledby="mainnet-acceptance">
        <h2 id="mainnet-acceptance">Recorded mainnet acceptance</h2>
        {reportError && (
          <p role="alert" className="app-field-error">
            {reportError}
          </p>
        )}
        {!report && !reportError && (
          <p role="status">Loading mainnet acceptance results…</p>
        )}
        {report && (
          <>
            <p>
              Recorded {timestamp(report.capturedAt)} at finalized block{" "}
              {report.block.height}
              {reportError ? " · STALE COPY" : ""}. Refresh reloads this
              recorded audit from before bounded owner activation; current state
              and the seven activation receipts are shown above.
            </p>
            <p>
              <strong>
                {report.summary.passed} passed · {report.summary.blocked}{" "}
                blocked · {report.summary.notRun} not run
              </strong>
              .{" "}
              {report.summary.complete
                ? "All recorded checks passed."
                : "Mainnet execution coverage is incomplete."}
            </p>
            <ul className="cycle-timeline evidence-checks">
              {report.checks.map((check) => (
                <li key={check.id}>
                  <h3>
                    {check.label} · {check.status}
                  </h3>
                  <p>{check.scope.replaceAll("_", " ")}</p>
                  <p>{check.detail}</p>
                  {check.links.map((url, index) => (
                    <p key={url}>
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        {check.id} source {index + 1} ↗
                      </a>
                    </p>
                  ))}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {report?.serviceRoundTrip && (
        <section className="cycle-card" aria-labelledby="mainnet-service">
          <h2 id="mainnet-service">
            Confirmed mainnet service balance round trip
          </h2>
          <p>
            Self-funded deposit and return of service credit. The treasury
            stayed paused. This proves escrow mechanics; agent payments, Intents
            settlement and earned revenue remain unproven.
          </p>
          <dl className="cycle-metrics evidence-metrics">
            {[
              ["Deposit", report.serviceRoundTrip.depositedYocto],
              ["Returned to owner", report.serviceRoundTrip.returnedYocto],
              [
                "Retained storage collateral",
                report.serviceRoundTrip.storageCollateralYocto,
              ],
              ["Combined network fees", report.serviceRoundTrip.totalFeeYocto],
              ["Net owner cost", report.serviceRoundTrip.totalOwnerCostYocto],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{formatNear(value!, 16)} NEAR</dd>
              </div>
            ))}
            <div>
              <dt>Wallet balance reconciliation</dt>
              <dd>
                {report.serviceRoundTrip.walletBalanceReconciled
                  ? "EXACT MATCH"
                  : "NOT RECONCILED"}
              </dd>
            </div>
          </dl>
          <p>
            Final service credit: zero. Storage collateral remains in the
            contract.
          </p>
          <p>
            <a
              href={`https://nearblocks.io/txns/${report.serviceRoundTrip.depositHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View service deposit ↗
            </a>
          </p>
          <p>
            <a
              href={`https://nearblocks.io/txns/${report.serviceRoundTrip.withdrawalHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View returned service credit ↗
            </a>
          </p>
        </section>
      )}

      <section className="cycle-card" aria-labelledby="mainnet-funding">
        <h2 id="mainnet-funding">Confirmed mainnet funding</h2>
        <p>
          Recorded final receipt verified {timestamp(funding.checkedAt)}. This
          owner-signed funding call kept the treasury paused. It is team-funded
          treasury capital, not customer revenue or profit.
        </p>
        <dl className="cycle-metrics evidence-metrics">
          <div>
            <dt>Network</dt>
            <dd>NEAR MAINNET · RECORDED RECEIPT</dd>
          </div>
          <div>
            <dt>Deposit</dt>
            <dd>{formatNear(funding.depositYocto, 3)} NEAR</dd>
          </div>
          <div>
            <dt>Network fee</dt>
            <dd>{formatNear(funding.actualFeeYocto, 16)} NEAR</dd>
          </div>
          <div>
            <dt>Total wallet debit</dt>
            <dd>{formatNear(funding.totalOwnerDebitYocto, 16)} NEAR</dd>
          </div>
          <div>
            <dt>Call</dt>
            <dd>
              <code>
                {funding.method}({"{}"})
              </code>
            </dd>
          </div>
        </dl>
        <p>
          <a href={funding.url} target="_blank" rel="noopener noreferrer">
            View confirmed funding transaction ↗
          </a>
        </p>
        <p>
          <code>{funding.hash}</code>
        </p>
        <p>
          <a href={funding.sourceUrl} target="_blank" rel="noopener noreferrer">
            Read the recorded verification and before/after balances ↗
          </a>
        </p>
      </section>

      <section className="cycle-card" aria-labelledby="remaining-evidence">
        <h2 id="remaining-evidence">Execution still gated</h2>
        <dl className="cycle-metrics evidence-metrics">
          <div>
            <dt>TEE deployment approval</dt>
            <dd>QUARANTINED</dd>
          </div>
          <div>
            <dt>Verified paid AI completion</dt>
            <dd>NOT DEMONSTRATED</dd>
          </div>
          <div>
            <dt>Funded Intents trading</dt>
            <dd>NOT DEMONSTRATED</dd>
          </div>
          <div>
            <dt>External net revenue</dt>
            <dd>UNPROVEN</dd>
          </div>
          <div>
            <dt>Mainnet NFT distribution</dt>
            <dd>NOT DEMONSTRATED</dd>
          </div>
          <div>
            <dt>Automatic credit purchase</dt>
            <dd>UNSUPPORTED PROVIDER FLOW</dd>
          </div>
        </dl>
        <p>
          These unfinished claims are independent of the completed deployment
          and funding checks.
        </p>
      </section>
    </AppShell>
  );
}
