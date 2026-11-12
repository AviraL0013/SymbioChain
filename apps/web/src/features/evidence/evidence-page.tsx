"use client";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowUpRight, ChevronDown, ShieldAlert } from "lucide-react";
import { MainnetAcceptance } from "@symbiochain/shared";
import { AppShell } from "@/features/application/app-shell";
import { useDeployment } from "@/features/mainnet/deployment-provider";
import { formatNear } from "@/features/mainnet/format";
import { timestamp } from "@/features/swarm/format";
import funding from "./recorded-mainnet-funding.json";
import { ActivationPanel } from "@/features/mainnet/activation-panel";
import { PreparationPanel } from "@/features/mainnet/preparation-panel";
import { OwnedExecutionPanel } from "@/features/mainnet/owned-execution-panel";
import { ProvisioningPanel } from "@/features/mainnet/provisioning-panel";
import { IntentsSettlementPanel } from "@/features/mainnet/intents-settlement-panel";
import "@/features/cycles/cycles.css";
import "./evidence.css";

function EvidenceGroup({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <details className="evidence-group">
      <summary>
        <span className="evidence-group-label">
          <span className="evidence-group-title">{title}</span>
          <span className="evidence-group-description">{description}</span>
        </span>
        <ChevronDown size={18} aria-hidden="true" />
      </summary>
      <div className="evidence-group-body">{children}</div>
    </details>
  );
}

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
      description="Inspect current mainnet state and the receipts behind each recorded result."
      notice="Recorded results apply only to their stated scope and date. Blocked and unexecuted checks do not count as successful execution."
    >
      <div className="evidence-workspace">
        {reportError && (
          <p role="alert" className="app-field-error">
            {reportError}
          </p>
        )}
        <section
          className="cycle-card evidence-overview"
          aria-labelledby="mainnet-evidence"
        >
          <div className="evidence-overview-heading">
            <div>
              <h2 id="mainnet-evidence">Current mainnet state</h2>
              <p>
                Finalized blockchain observations, separate from historical
                audits.
              </p>
            </div>
            <span className="evidence-network">NEAR mainnet</span>
          </div>
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
              <dl className="evidence-state-grid">
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
                      {mainnet.treasuryAccount}{" "}
                      <ArrowUpRight size={13} aria-hidden="true" />
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
                  <dt>Worker permissions</dt>
                  <dd>
                    {workers.filter((a) => a.workerEnabled === true).length} /{" "}
                    {workers.length} enabled
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
                  Inspect mainnet deployment transactions{" "}
                  <ArrowUpRight size={13} aria-hidden="true" />
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

        <aside
          className="evidence-gate-notice"
          aria-label="Remaining execution gates"
        >
          <ShieldAlert size={19} aria-hidden="true" />
          <div>
            <strong>TEE deployment approval remains quarantined</strong>
            <p>
              Deployment, funding and transfer receipts do not establish a
              verified paid AI completion, profitable trading or external
              revenue.
            </p>
          </div>
        </aside>

        <div className="evidence-section-heading">
          <h2>Inspect the evidence</h2>
          <p>Open a record for its scope, exact values and source receipts.</p>
        </div>
        <div className="evidence-groups">
          <EvidenceGroup
            title="Owner activation and permissions"
            description="Configured limits, worker monitors and bounded activation receipts."
          >
            <ActivationPanel />
          </EvidenceGroup>
          <EvidenceGroup
            title="Autonomous preparation"
            description="Read-only checks, derived wallets, quoted returns and the next execution gate."
          >
            <PreparationPanel />
          </EvidenceGroup>
          <EvidenceGroup
            title="Mainnet MPC transfer fixtures"
            description="Owner-authorized destination transfers and their corresponding NEAR receipts."
          >
            <OwnedExecutionPanel />
          </EvidenceGroup>
          <EvidenceGroup
            title="Internal Intents payments"
            description="Team-funded agent transfers, reconciled debits and credits, and network costs."
          >
            <IntentsSettlementPanel />
          </EvidenceGroup>
          <EvidenceGroup
            title="Owner funding and provisioning"
            description="Capital sent, refunded conversion attempts, destination funding and permissions."
          >
            <ProvisioningPanel />
          </EvidenceGroup>
          <EvidenceGroup
            title="Historical mainnet acceptance audit"
            description={
              report
                ? `Recorded ${timestamp(report.capturedAt)} UTC · before bounded owner activation${reportError ? " · stale copy" : ""}`
                : "A dated audit from before bounded owner activation."
            }
          >
            <section
              className="cycle-card"
              aria-labelledby="mainnet-acceptance"
            >
              <h2 id="mainnet-acceptance">Recorded mainnet acceptance</h2>
              {!report && !reportError && (
                <p role="status">Loading mainnet acceptance results…</p>
              )}
              {report && (
                <>
                  <p>
                    Recorded {timestamp(report.capturedAt)} at finalized block{" "}
                    {report.block.height}
                    {reportError ? " · STALE COPY" : ""}. Refresh reloads this
                    recorded audit from before bounded owner activation; current
                    state and the seven activation receipts are shown above.
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
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
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
          </EvidenceGroup>

          {report?.serviceRoundTrip && (
            <EvidenceGroup
              title="Service escrow round trip"
              description="Historical self-funded deposit and return; confirms escrow mechanics only."
            >
              <section className="cycle-card" aria-labelledby="mainnet-service">
                <h2 id="mainnet-service">
                  Confirmed mainnet service balance round trip
                </h2>
                <p>
                  Self-funded deposit and return of service credit. The treasury
                  stayed paused. This proves escrow mechanics; agent payments,
                  Intents settlement and earned revenue remain unproven by this
                  record.
                </p>
                <dl className="cycle-metrics evidence-metrics">
                  {[
                    ["Deposit", report.serviceRoundTrip.depositedYocto],
                    [
                      "Returned to owner",
                      report.serviceRoundTrip.returnedYocto,
                    ],
                    [
                      "Retained storage collateral",
                      report.serviceRoundTrip.storageCollateralYocto,
                    ],
                    [
                      "Combined network fees",
                      report.serviceRoundTrip.totalFeeYocto,
                    ],
                    [
                      "Net owner cost",
                      report.serviceRoundTrip.totalOwnerCostYocto,
                    ],
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
            </EvidenceGroup>
          )}

          <EvidenceGroup
            title="Initial treasury funding"
            description={`Recorded ${timestamp(funding.checkedAt)} UTC · owner capital, separate from revenue.`}
          >
            <section className="cycle-card" aria-labelledby="mainnet-funding">
              <h2 id="mainnet-funding">Confirmed mainnet funding</h2>
              <p>
                Recorded final receipt verified {timestamp(funding.checkedAt)}.
                This owner-signed funding call kept the treasury paused. It is
                team-funded treasury capital, not customer revenue or profit.
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
                <a
                  href={funding.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read the recorded verification and before/after balances ↗
                </a>
              </p>
            </section>
          </EvidenceGroup>

          <EvidenceGroup
            title="Remaining execution and business gates"
            description="Incomplete claims remain separate from confirmed deployment and funding."
          >
            <section
              className="cycle-card"
              aria-labelledby="remaining-evidence"
            >
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
                These unfinished claims are independent of the completed
                deployment and funding checks.
              </p>
            </section>
          </EvidenceGroup>
        </div>
      </div>
    </AppShell>
  );
}
