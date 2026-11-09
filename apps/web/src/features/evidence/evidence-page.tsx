"use client";
import Link from "next/link";
import { AppShell } from "@/features/application/app-shell";
import { useDeployment } from "@/features/mainnet/deployment-provider";
import { formatNear } from "@/features/mainnet/format";
import { timestamp } from "@/features/swarm/format";
import funding from "./recorded-mainnet-funding.json";
import "@/features/cycles/cycles.css";

export function EvidencePage() {
  const { runtime, mainnet, error, refresh } = useDeployment();
  const workers =
    mainnet?.accounts.filter((a) => a.workerEnabled !== null) ?? [];
  return (
    <AppShell
      title="Execution evidence"
      description="Completed mainnet checks, the confirmed funding receipt and historical testnet results."
      notice="Mainnet deployment and funding are real. Testnet distribution uses faucet tokens and simulated economics."
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
            <dl className="cycle-metrics">
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
        <button type="button" className="sc-text-button" onClick={refresh}>
          Refresh current checks
        </button>
      </section>

      <section className="cycle-card" aria-labelledby="mainnet-funding">
        <h2 id="mainnet-funding">Confirmed mainnet funding</h2>
        <p>
          Recorded final receipt verified {timestamp(funding.checkedAt)}. This
          owner-signed funding call kept the treasury paused. It is team-funded
          treasury capital, not customer revenue or profit.
        </p>
        <dl className="cycle-metrics">
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
        <dl className="cycle-metrics">
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

      <section className="cycle-card" aria-labelledby="testnet-archive">
        <h2 id="testnet-archive">Historical testnet evidence</h2>
        <p>
          Recorded NEAR testnet contract checks, MPC signatures and a test-token
          NFT distribution and holder claim remain available separately. The
          distribution allocated 10% of a faucet-funded deposit. Its underlying
          market settlement and accountant profit are SIMULATED; it is not a
          mainnet revenue distribution.
        </p>
        <p>
          <Link href="/testnet">Open the testnet rehearsal archive ↗</Link>
        </p>
      </section>
    </AppShell>
  );
}
