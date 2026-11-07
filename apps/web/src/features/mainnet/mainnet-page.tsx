"use client";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Wallet,
  RefreshCw,
} from "lucide-react";
import { MainnetTransaction } from "@symbiochain/shared";
import { AppHeader, AppFooter } from "@/features/application/app-shell";
import { useDeployment } from "./deployment-provider";
import { useWallet } from "@/features/wallet/wallet-provider";
import { formatNear } from "./format";
import "./mainnet.css";
export function MainnetPage() {
  const path = usePathname();
  const { mainnet: data, error, refresh } = useDeployment();
  const wallet = useWallet();
  const [hash, setHash] = useState(""),
    [proof, setProof] = useState<ReturnType<
      typeof MainnetTransaction.parse
    > | null>(null),
    [proofError, setProofError] = useState<string | null>(null),
    [verifying, setVerifying] = useState(false);
  const treasury = data?.accounts.find((a) => a.role === "TREASURY");
  const page = path.split("/")[1] ?? "dashboard";
  const titles: Record<string, string> = {
    dashboard: "Mainnet Mission Control",
    topology: "Mainnet Agents",
    cycles: "Mainnet Transactions",
    nfts: "Mainnet Receipts",
    verify: "Verify Mainnet Evidence",
    business: "Business Readiness",
    operator: "Execution Controls",
    testnet: "Testnet Evidence Archive",
  };
  async function verify(value: string) {
    setHash(value);
    setProof(null);
    setProofError(null);
    setVerifying(true);
    try {
      const r = await fetch(
        "/api/swarm/mainnet/transaction?hash=" + encodeURIComponent(value),
        { cache: "no-store" },
      );
      if (!r.ok) throw Error();
      setProof(MainnetTransaction.parse(await r.json()));
    } catch {
      setProofError(
        "No verified deployment transaction was confirmed. Check the hash or retry when connected.",
      );
    } finally {
      setVerifying(false);
    }
  }
  return (
    <div className="mission-control mn-page">
      <a href="#mainnet-content" className="sc-skip-link">
        Skip to mainnet data
      </a>
      <AppHeader />
      <main id="mainnet-content" className="sc-main">
        <div className="mn-connection" role="status">
          <span>
            <strong>NEAR MAINNET</strong> ·{" "}
            {error
              ? "Stale observations"
              : data
                ? "Finalized block " + data.block.height
                : "Reading finalized blockchain data…"}
          </span>
          <button className="sc-text-button" onClick={refresh}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
        {error && (
          <p className="mn-alert" role="alert">
            {error}
          </p>
        )}
        <section className="sc-page-heading">
          <div>
            <p className="mn-eyebrow">
              REAL CHAIN DATA · EXECUTION{" "}
              {data?.executionEnabled ? "ARMED" : "DISARMED"}
            </p>
            <h1>
              {titles[page] ?? "Mainnet Mission Control"}
              <span className="sc-heading-period">.</span>
            </h1>
            <p>
              Observed balances, account permissions and recorded deployment
              evidence.
            </p>
          </div>
          <span className="sc-status-pill is-muted">
            <i />
            {data
              ? data.paused
                ? "Treasury paused"
                : "Treasury active"
              : "Connecting"}
          </span>
        </section>
        {!data || !treasury ? (
          <section className="mn-panel">
            <p role="status">
              Waiting for verified mainnet observations. No sample balances or
              transactions are shown.
            </p>
          </section>
        ) : (
          <>
            <section
              className="mn-vitals"
              aria-label="Mainnet treasury balances"
            >
              <article>
                <span>
                  <Wallet size={17} />
                  Treasury total
                </span>
                <strong>
                  {formatNear(treasury.balanceYocto)} <small>NEAR</small>
                </strong>
                <p>Native balance, including storage collateral.</p>
              </article>
              <article>
                <span>
                  <ShieldCheck size={17} />
                  Storage collateral
                </span>
                <strong>
                  {formatNear(treasury.storageYocto)} <small>NEAR</small>
                </strong>
                <p>Locked by contract code and state.</p>
              </article>
              <article>
                <span>
                  <Activity size={17} />
                  Available after storage
                </span>
                <strong>
                  {formatNear(treasury.availableYocto)} <small>NEAR</small>
                </strong>
                <p>Not trading profit or purchased AI credits.</p>
              </article>
            </section>
            {["dashboard", "topology", "operator"].includes(page) && (
              <section className="mn-panel" aria-labelledby="mn-accounts">
                <div className="mn-panel-heading">
                  <h2 id="mn-accounts">Deployment accounts</h2>
                  <span>
                    Recovery custody verified{" "}
                    {data.accounts.filter((a) => a.recoveryKeyPresent).length}/6
                  </span>
                </div>
                <div className="mn-account-grid">
                  {data.accounts.map((a) => (
                    <article key={a.role}>
                      <span className="mn-role">{a.role}</span>
                      <a
                        href={"https://nearblocks.io/address/" + a.accountId}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {a.accountId}
                        <ArrowUpRight size={14} />
                      </a>
                      <strong>{formatNear(a.balanceYocto)} NEAR</strong>
                      <p>
                        {a.workerEnabled === null
                          ? a.role === "SCOUT"
                            ? "Off-chain Scout is disarmed"
                            : a.role === "OWNER"
                              ? "Treasury owner account"
                              : "Treasury contract"
                          : a.workerEnabled
                            ? "On-chain permission enabled"
                            : "On-chain permission disabled"}
                      </p>
                      <p>
                        {a.fullAccessKeyCount} recovery key · {a.scopedKeyCount}{" "}
                        scoped keys
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            )}
            {["dashboard", "cycles", "verify"].includes(page) && (
              <section className="mn-panel">
                <div className="mn-panel-heading">
                  <h2>Recorded deployment transactions</h2>
                  <span>
                    Verified{" "}
                    {new Date(data.deployment.verifiedAt).toLocaleString()}
                  </span>
                </div>
                <p>
                  These are real infrastructure transactions. They do not
                  establish trading revenue or net profit.
                </p>
                <div className="mn-transaction-list">
                  {data.deployment.transactions.map((t) => (
                    <article key={t.hash}>
                      <div>
                        <strong>{t.label.replaceAll("-", " ")}</strong>
                        <code>{t.hash}</code>
                        <span>
                          {t.signerId} → {t.receiverId}
                        </span>
                      </div>
                      <a href={t.url} target="_blank" rel="noopener noreferrer">
                        Explorer ↗
                      </a>
                      <button
                        className="sc-text-button"
                        disabled={verifying}
                        onClick={() => void verify(t.hash)}
                      >
                        Verify
                      </button>
                    </article>
                  ))}
                </div>
              </section>
            )}
            {["verify", "cycles", "dashboard"].includes(page) && (
              <section className="mn-panel">
                <h2>Transaction verification</h2>
                <form
                  className="mn-verify"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void verify(hash);
                  }}
                >
                  <label htmlFor="mainnet-tx">
                    Recorded NEAR transaction hash
                  </label>
                  <input
                    id="mainnet-tx"
                    value={hash}
                    onChange={(e) => setHash(e.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                    required
                    pattern="[1-9A-HJ-NP-Za-km-z]{43,44}"
                  />
                  <button
                    className="sc-button sc-button-dark"
                    disabled={verifying}
                  >
                    {verifying ? "Verifying…" : "Verify on mainnet"}
                  </button>
                </form>
                {proofError && <p role="status">{proofError}</p>}
                {proof && (
                  <p role="status">
                    <strong>
                      {proof.succeeded && proof.final
                        ? "Confirmed on mainnet"
                        : "Not confirmed as successful"}
                    </strong>{" "}
                    · {proof.hash} · Deployment, not revenue.{" "}
                    <a
                      href={proof.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View receipt ↗
                    </a>
                  </p>
                )}
              </section>
            )}
            {page === "nfts" && (
              <section className="mn-panel">
                <h2>On-chain receipt supply</h2>
                <strong className="mn-large">{data.nfts.totalSupply}</strong>
                <p>
                  Tokens minted by the mainnet treasury. Revenue-share
                  entitlements total {data.nfts.revenueShareBps} basis points.
                </p>
                <p>
                  {data.nfts.totalSupply === "0"
                    ? "No mainnet receipt NFTs have been minted."
                    : "Inspect the treasury token records on NEAR Explorer."}{" "}
                  Business-funded distributions remain unproven.
                </p>
              </section>
            )}
            {["dashboard", "business", "operator"].includes(page) && (
              <section className="mn-panel mn-readiness">
                <h2>Execution readiness</h2>
                <dl>
                  <div>
                    <dt>Paid AI inference</dt>
                    <dd>QUARANTINED</dd>
                  </div>
                  <div>
                    <dt>AI budget ceiling</dt>
                    <dd>
                      {(
                        Number(data.compute.totalBudgetUsdMicros) / 1e6
                      ).toFixed(2)}{" "}
                      USD total ·{" "}
                      {(Number(data.compute.maxRequestUsdMicros) / 1e6).toFixed(
                        2,
                      )}{" "}
                      USD/request
                    </dd>
                  </div>
                  <div>
                    <dt>Provider model</dt>
                    <dd>{data.compute.model}</dd>
                  </div>
                  <div>
                    <dt>External revenue / net profit</dt>
                    <dd>Unproven / unknown</dd>
                  </div>
                  <div>
                    <dt>Automatic credit purchase</dt>
                    <dd>Unavailable</dd>
                  </div>
                  <div>
                    <dt>Temporary deployment key</dt>
                    <dd>
                      {data.deployment.temporaryKeyRevoked
                        ? "Revoked"
                        : "Needs review"}
                    </dd>
                  </div>
                  <div>
                    <dt>Contract identity</dt>
                    <dd>
                      {data.code.matches
                        ? "Matches reviewed executable"
                        : "Code changed — review required"}
                    </dd>
                  </div>
                </dl>
                <ul>
                  {data.blockers.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
                <p>
                  Wallet connection does not unlock these controls. Owner
                  account: <code>{data.ownerAccount}</code>.
                </p>
              </section>
            )}
            {page === "testnet" && (
              <section className="mn-panel">
                <h2>Historical rehearsal</h2>
                <p>
                  The current application observes mainnet. Prior testnet
                  signatures and transfers remain authorization fixtures with
                  simulated economics.
                </p>
                <a
                  href="https://github.com/SuyashAlphaC/symbiochain-core/blob/main/artifacts/testnet-rehearsal.json"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open the recorded testnet evidence ↗
                </a>
              </section>
            )}
            <section className="mn-panel mn-wallet-status">
              <h2>Your wallet</h2>
              {wallet.account ? (
                <p>
                  Connected: <strong>{wallet.account.accountId}</strong> ·{" "}
                  {wallet.balance
                    ? formatNear(wallet.balance.balanceYocto) + " NEAR total"
                    : "Reading balance…"}
                </p>
              ) : (
                <p>
                  Use Connect wallet in the header to connect Meteor or
                  MyNearWallet. No access key or payment is requested.
                </p>
              )}
              {wallet.error && <p role="status">{wallet.error}</p>}
              <p className="mn-observed">
                Observed {new Date(data.capturedAt).toLocaleString()} · Mainnet
                block {data.block.height}. Runway and business profit remain
                unknown.
              </p>
            </section>
          </>
        )}
        <AppFooter />
      </main>
    </div>
  );
}
