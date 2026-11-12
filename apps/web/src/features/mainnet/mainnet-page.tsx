"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Fingerprint,
  GitBranch,
  LockKeyhole,
  PackageOpen,
  RefreshCw,
  Search,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { MainnetTransaction } from "@symbiochain/shared";
import { AppShell } from "@/features/application/app-shell";
import {
  DataDisclosure,
  Identifier,
  SectionHeading,
  StatusBadge,
} from "@/components/ui/data-display";
import { BrainArt, EyeArt, HandArt } from "@/features/landing/artwork";
import { useWallet } from "@/features/wallet/wallet-provider";
import { formatAtoms, timestamp } from "@/features/swarm/format";
import { useDeployment } from "./deployment-provider";
import { formatNear } from "./format";
import "./mainnet.css";

type Snapshot = NonNullable<ReturnType<typeof useDeployment>["mainnet"]>;
type Transaction = Snapshot["deployment"]["transactions"][number];

const pageCopy: Record<string, { title: string; description: string }> = {
  dashboard: {
    title: "Swarm overview",
    description:
      "Your treasury, agents, and latest activity. All observed on NEAR mainnet.",
  },
  topology: {
    title: "Meet your agents",
    description:
      "Three roles, one coordinated workflow. Inspect accounts, balances, and permissions.",
  },
  cycles: {
    title: "Transaction activity",
    description:
      "Explore recorded infrastructure transactions and inspect their on-chain receipts.",
  },
  nfts: {
    title: "Execution receipts",
    description:
      "On-chain receipt supply and the rights recorded by your treasury.",
  },
  verify: {
    title: "Verify a transaction",
    description:
      "Look up a recorded deployment transaction against finalized mainnet data.",
  },
  business: {
    title: "Business overview",
    description:
      "Separate treasury capital, operating allowances, and evidence of earned revenue.",
  },
  operator: {
    title: "Execution controls",
    description:
      "Review the boundaries that govern the treasury, agents, and inference.",
  },
};

function TreasuryMetrics({ data }: { data: Snapshot }) {
  const treasury = data.accounts.find((account) => account.role === "TREASURY");
  if (!treasury) return null;
  return (
    <section className="mn-vitals" aria-label="Mainnet treasury balances">
      {[
        {
          label: "Treasury balance",
          value: treasury.balanceYocto,
          detail: "Total native NEAR, including storage.",
          icon: Wallet,
        },
        {
          label: "Available balance",
          value: treasury.availableYocto,
          detail: "Treasury balance after storage collateral.",
          icon: Activity,
        },
        {
          label: "Storage collateral",
          value: treasury.storageYocto,
          detail: "Reserved by contract code and state.",
          icon: ShieldCheck,
        },
      ].map(({ label, value, detail, icon: Icon }, index) => (
        <article key={label} className={index === 0 ? "mn-primary-metric" : ""}>
          <div className="mn-metric-label">
            <span>{label}</span>
            <Icon size={16} />
          </div>
          <strong title={value + " yoctoNEAR"}>
            {formatNear(value)} <small>NEAR</small>
          </strong>
          <p>{detail}</p>
        </article>
      ))}
    </section>
  );
}

const agents = [
  {
    role: "SCOUT",
    name: "Eye",
    task: "Discover opportunities",
    description: "Reads candidate routes and prepares a proposal.",
    art: EyeArt,
    color: "blue",
  },
  {
    role: "BRAIN",
    name: "Brain",
    task: "Assess the decision",
    description: "Checks policy and private-inference evidence.",
    art: BrainArt,
    color: "yellow",
  },
  {
    role: "HAND",
    name: "Hand",
    task: "Prepare execution",
    description: "Handles authorized signing and reconciliation.",
    art: HandArt,
    color: "pink",
  },
] as const;

function AgentOverview({
  data,
  showAll = true,
}: {
  data: Snapshot;
  showAll?: boolean;
}) {
  return (
    <section className="mn-panel">
      <SectionHeading
        title="The swarm"
        description="Account balances and on-chain permissions."
        action={
          showAll && (
            <Link href="/topology">
              All agents <ArrowUpRight size={13} />
            </Link>
          )
        }
      />
      <div className="mn-agent-strip">
        {agents.map(({ role, name, task, art: Art, color }) => {
          const account = data.accounts.find((a) => a.role === role);
          return (
            <article
              key={role}
              className={`mn-agent-summary mn-agent-${color}`}
            >
              <div className="mn-agent-avatar">
                <Art />
              </div>
              <div className="mn-agent-summary-name">
                <strong>{name}</strong>
                <span>{task}</span>
              </div>
              <div className="mn-agent-summary-balance">
                {account ? formatNear(account.balanceYocto) : "—"}
                <small>NEAR</small>
              </div>
              <StatusBadge
                tone={account?.workerEnabled ? "success" : "neutral"}
              >
                {account?.workerEnabled === null
                  ? "Off-chain scout"
                  : account?.workerEnabled
                    ? "Permission enabled"
                    : "Permission disabled"}
              </StatusBadge>
            </article>
          );
        })}
      </div>
      <p className="mn-caption">
        Permissions describe allowed calls. Autonomous execution is{" "}
        {data.executionEnabled ? "armed" : "disarmed"}.
      </p>
    </section>
  );
}

function ExecutionStatus({ data }: { data: Snapshot }) {
  return (
    <section className="mn-panel mn-readiness">
      <SectionHeading
        title="Execution status"
        description="Independent safeguards, shown separately."
      />
      <dl className="mn-facts">
        <div>
          <dt>Autonomous execution</dt>
          <dd>
            <StatusBadge tone={data.executionEnabled ? "success" : "warning"}>
              {data.executionEnabled ? "Armed" : "Disarmed"}
            </StatusBadge>
          </dd>
        </div>
        <div>
          <dt>Treasury</dt>
          <dd>
            <StatusBadge tone={data.paused ? "neutral" : "success"}>
              {data.paused ? "Paused" : "Active"}
            </StatusBadge>
          </dd>
        </div>
        <div>
          <dt>AI inference</dt>
          <dd>
            <StatusBadge tone="warning">Quarantined</StatusBadge>
          </dd>
        </div>
        <div>
          <dt>Contract identity</dt>
          <dd>
            <StatusBadge tone={data.code.matches ? "success" : "danger"}>
              {data.code.matches ? "Matches review" : "Review required"}
            </StatusBadge>
          </dd>
        </div>
      </dl>
      <Link className="mn-panel-link" href="/evidence">
        Review deployment evidence <ArrowRight size={14} />
      </Link>
    </section>
  );
}

function AccountDirectory({ data }: { data: Snapshot }) {
  return (
    <section className="mn-panel">
      <SectionHeading
        title="Account directory"
        description="Native balances, recovery custody, and scoped permissions."
        action={
          <span className="mn-caption">{data.accounts.length} accounts</span>
        }
      />
      <p className="mn-table-hint">
        Scroll to view all columns <ArrowRight size={14} />
      </p>
      <div
        className="mn-table-wrap"
        tabIndex={0}
        role="region"
        aria-label="Scrollable account directory"
      >
        <table className="mn-data-table">
          <caption className="sr-only">Mainnet deployment accounts</caption>
          <thead>
            <tr>
              <th>Account</th>
              <th>Balance</th>
              <th>Permission</th>
              <th>Access keys</th>
              <th>
                <span className="sr-only">Explorer</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {data.accounts.map((a) => (
              <tr key={a.role}>
                <td>
                  <strong>
                    {a.role === "SCOUT"
                      ? "Eye · Scout"
                      : a.role.charAt(0) + a.role.slice(1).toLowerCase()}
                  </strong>
                  <Identifier value={a.accountId} label="account address" />
                </td>
                <td className="mn-number">
                  {formatNear(a.balanceYocto)} <span>NEAR</span>
                </td>
                <td>
                  <StatusBadge tone={a.workerEnabled ? "success" : "neutral"}>
                    {a.workerEnabled === null
                      ? a.role === "SCOUT"
                        ? "Off-chain"
                        : "Owner controlled"
                      : a.workerEnabled
                        ? "Enabled"
                        : "Disabled"}
                  </StatusBadge>
                </td>
                <td>
                  <span className="mn-key-count">
                    {a.fullAccessKeyCount} recovery · {a.scopedKeyCount} scoped
                  </span>
                  {a.recoveryKeyPresent && (
                    <span className="mn-key-verified">
                      <Check size={11} />
                      Recovery present
                    </span>
                  )}
                </td>
                <td>
                  <a
                    className="mn-explorer-button"
                    href={"https://nearblocks.io/address/" + a.accountId}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View ${a.role.toLowerCase()} account on explorer`}
                  >
                    <ArrowUpRight size={15} />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Transactions({
  data,
  compact = false,
  verifying,
  onVerify,
}: {
  data: Snapshot;
  compact?: boolean;
  verifying: boolean;
  onVerify: (value: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const filtered = data.deployment.transactions.filter((t) =>
    [t.hash, t.label, t.signerId, t.receiverId]
      .join(" ")
      .toLowerCase()
      .replaceAll(/[-_]+/g, " ")
      .includes(query.trim().toLowerCase().replaceAll(/[-_]+/g, " ")),
  );
  const size = compact ? 5 : 10;
  const current = Math.min(
    page,
    Math.max(0, Math.ceil(filtered.length / size) - 1),
  );
  const visible = filtered.slice(current * size, (current + 1) * size);
  return (
    <section className="mn-panel mn-transactions">
      <SectionHeading
        title={compact ? "Deployment activity" : "Recorded transactions"}
        description="Infrastructure receipts. These do not establish trading revenue."
        action={
          compact ? (
            <Link href="/cycles">
              View all <ArrowUpRight size={13} />
            </Link>
          ) : (
            <span className="mn-caption">
              {data.deployment.transactions.length} records
            </span>
          )
        }
      />
      {!compact && (
        <div className="mn-transaction-toolbar">
          <label className="mn-search">
            <Search size={15} />
            <input
              aria-label="Search recorded transactions"
              placeholder="Search by hash, account, or action"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
            />
          </label>
          <span className="mn-caption">NEAR mainnet · deployment receipts</span>
        </div>
      )}
      <p className="mn-table-hint">
        Scroll to view all columns <ArrowRight size={14} />
      </p>
      <div
        className="mn-table-wrap"
        tabIndex={0}
        role="region"
        aria-label="Scrollable transaction records"
      >
        <table className="mn-data-table">
          <caption className="sr-only">
            Recorded deployment transactions
          </caption>
          <thead>
            <tr>
              <th>Action</th>
              <th>Transaction</th>
              <th>Network</th>
              <th>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((t) => (
              <TransactionRow
                key={t.hash}
                transaction={t}
                verifying={verifying}
                onVerify={onVerify}
              />
            ))}
          </tbody>
        </table>
      </div>
      {!visible.length && (
        <p className="mn-empty-inline">
          No recorded transactions match this search.
        </p>
      )}
      {!compact && (
        <div className="mn-pagination">
          <span>
            {filtered.length
              ? `${current * size + 1}–${Math.min((current + 1) * size, filtered.length)}`
              : "0"}{" "}
            of {filtered.length} records
          </span>
          <div>
            <button
              type="button"
              className="sc-icon-button"
              aria-label="Previous transaction page"
              disabled={current === 0}
              onClick={() => setPage(current - 1)}
            >
              <ChevronLeft size={15} />
            </button>
            <button
              type="button"
              className="sc-icon-button"
              aria-label="Next transaction page"
              disabled={(current + 1) * size >= filtered.length}
              onClick={() => setPage(current + 1)}
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function TransactionRow({
  transaction: t,
  verifying,
  onVerify,
}: {
  transaction: Transaction;
  verifying: boolean;
  onVerify: (value: string) => void;
}) {
  return (
    <tr>
      <td>
        <strong className="mn-action-name">
          {t.label.charAt(0).toUpperCase() +
            t.label.slice(1).replaceAll("-", " ").replaceAll("_", " ")}
        </strong>
        <details className="mn-route-detail">
          <summary>
            View accounts <ChevronDown size={12} />
          </summary>
          <dl>
            <div>
              <dt>Signer</dt>
              <dd>
                <Identifier value={t.signerId} label="signer account" />
              </dd>
            </div>
            <div>
              <dt>Receiver</dt>
              <dd>
                <Identifier value={t.receiverId} label="receiver account" />
              </dd>
            </div>
          </dl>
        </details>
      </td>
      <td>
        <Identifier value={t.hash} label="transaction hash" />
      </td>
      <td>
        <span className="mn-chain-label">
          <i />
          NEAR
        </span>
      </td>
      <td>
        <div className="mn-row-actions">
          <button
            type="button"
            className="sc-text-button"
            disabled={verifying}
            onClick={() => onVerify(t.hash)}
          >
            Verify
          </button>
          <a
            className="mn-explorer-button"
            href={t.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${t.label.replaceAll("-", " ")} transaction`}
          >
            <ArrowUpRight size={14} />
          </a>
        </div>
      </td>
    </tr>
  );
}

function AllowanceDetails({ data }: { data: Snapshot }) {
  return (
    <dl className="mn-facts">
      <div>
        <dt>Total AI budget ceiling</dt>
        <dd>{formatAtoms(data.compute.totalBudgetUsdMicros, 6)} USD</dd>
      </div>
      <div>
        <dt>Maximum per request</dt>
        <dd>{formatAtoms(data.compute.maxRequestUsdMicros, 6)} USD</dd>
      </div>
      <div>
        <dt>Model</dt>
        <dd>
          <code>{data.compute.model}</code>
        </dd>
      </div>
      <div>
        <dt>Automatic credit purchase</dt>
        <dd>Unavailable</dd>
      </div>
      <div>
        <dt>Deployment key</dt>
        <dd>
          {data.deployment.temporaryKeyRevoked ? "Revoked" : "Needs review"}
        </dd>
      </div>
      <div>
        <dt>Business runway</dt>
        <dd>Unknown</dd>
      </div>
    </dl>
  );
}

export function MainnetPage() {
  const path = usePathname();
  const { mainnet: data, error, refresh } = useDeployment();
  const wallet = useWallet();
  const [hash, setHash] = useState("");
  const [proof, setProof] = useState<ReturnType<
    typeof MainnetTransaction.parse
  > | null>(null);
  const [proofError, setProofError] = useState<{
    title: string;
    message: string;
  } | null>(null);
  const [verifying, setVerifying] = useState(false);
  const page = path.split("/")[1] ?? "dashboard";
  const copy = pageCopy[page] ?? pageCopy.dashboard!;
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
      if (r.ok) setProof(MainnetTransaction.parse(await r.json()));
      else
        setProofError(
          r.status === 404
            ? {
                title: "No verified record found",
                message:
                  "No confirmed deployment record was found for this hash. Check the hash and its network.",
              }
            : {
                title: "Verification unavailable",
                message:
                  "The lookup could not be completed. Try again when the connection is available.",
              },
        );
    } catch {
      setProofError({
        title: "Verification unavailable",
        message:
          "The lookup could not be completed. Try again when the connection is available.",
      });
    } finally {
      setVerifying(false);
    }
    document.getElementById("mainnet-verification")?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  }
  const verification = (
    <section id="mainnet-verification" className="mn-panel mn-verification">
      <SectionHeading
        title="Transaction lookup"
        description="Recorded NEAR deployment receipts. This does not verify an AI response."
      />
      <form
        className="mn-verify"
        onSubmit={(e) => {
          e.preventDefault();
          void verify(hash);
        }}
      >
        <label htmlFor="mainnet-tx">NEAR transaction hash</label>
        <div className="mn-verify-input">
          <Fingerprint size={18} />
          <input
            id="mainnet-tx"
            value={hash}
            onChange={(e) => setHash(e.target.value)}
            placeholder="Paste a recorded transaction hash"
            autoComplete="off"
            spellCheck={false}
            required
            pattern="[1-9A-HJ-NP-Za-km-z]{43,44}"
          />
          <button className="sc-button sc-button-dark" disabled={verifying}>
            {verifying ? "Verifying…" : "Verify transaction"}
          </button>
        </div>
      </form>
      {proofError && (
        <div className="mn-verification-result is-unavailable" role="status">
          <CircleHelp size={20} />
          <div>
            <strong>{proofError.title}</strong>
            <p>{proofError.message}</p>
          </div>
        </div>
      )}
      {proof && (
        <div
          className={`mn-verification-result ${proof.succeeded && proof.final ? "is-confirmed" : "is-unavailable"}`}
          role="status"
        >
          <ShieldCheck size={23} />
          <div>
            <strong>
              {proof.succeeded && proof.final
                ? "Confirmed on mainnet"
                : "Not confirmed as successful"}
            </strong>
            <p>
              Recorded deployment transaction · {timestamp(proof.verifiedAt)}{" "}
              UTC
            </p>
            <Identifier value={proof.hash} label="verified transaction hash" />
            <a href={proof.url} target="_blank" rel="noopener noreferrer">
              View receipt <ArrowUpRight size={13} />
            </a>
          </div>
        </div>
      )}
      {!proof && !proofError && (
        <p className="mn-verify-note">
          <LockKeyhole size={13} />
          Read-only lookup. No wallet connection or signature required.
        </p>
      )}
    </section>
  );
  return (
    <AppShell
      title={copy.title}
      description={copy.description}
      notice="Mainnet observations. Treasury capital, internal transfers, and deployment activity are separate from earned revenue."
      action={
        <button type="button" className="sc-button" onClick={refresh}>
          <RefreshCw size={14} />
          Refresh data
        </button>
      }
    >
      {error && (
        <p className="mn-alert" role="alert">
          {error}
        </p>
      )}
      {!data ? (
        <section className="mn-panel mn-loading" role="status">
          <Activity size={23} />
          <h2>Reading mainnet observations</h2>
          <p>
            Finalized balances and records will appear when the connection is
            available.
          </p>
        </section>
      ) : (
        <>
          {page === "dashboard" && (
            <>
              <TreasuryMetrics data={data} />
              <div className="mn-overview-grid">
                <AgentOverview data={data} />
                <ExecutionStatus data={data} />
              </div>
              <Transactions
                data={data}
                compact
                verifying={verifying}
                onVerify={(value) => void verify(value)}
              />
              <DataDisclosure
                title="Operating allowances & limitations"
                description="AI budgets, provider configuration, and remaining execution gates"
              >
                <AllowanceDetails data={data} />
                <ul className="mn-blockers">
                  {data.blockers.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </DataDisclosure>
              {(proof || proofError || verifying) && verification}
            </>
          )}
          {page === "topology" && (
            <>
              <div className="mn-topology-legend">
                <GitBranch size={17} />
                <span>Discovery</span>
                <ArrowRight size={13} />
                <span>Risk assessment</span>
                <ArrowRight size={13} />
                <span>Execution</span>
              </div>
              <AgentOverview data={data} showAll={false} />
              <AccountDirectory data={data} />
              <div className="mn-inline-note">
                <ShieldCheck size={15} />
                <p>
                  Recovery custody is present on{" "}
                  {data.accounts.filter((a) => a.recoveryKeyPresent).length} of{" "}
                  {data.accounts.length} accounts. Enabled permissions do not
                  arm autonomous execution.
                </p>
              </div>
            </>
          )}
          {page === "cycles" && (
            <>
              <div className="mn-page-meta">
                <StatusBadge>Deployment records</StatusBadge>
                <span>
                  Recorded verification ·{" "}
                  {timestamp(data.deployment.verifiedAt)} UTC
                </span>
              </div>
              <Transactions
                data={data}
                verifying={verifying}
                onVerify={(value) => void verify(value)}
              />
              <DataDisclosure
                title="Verify a recorded transaction"
                description="Check finality and execution success against the chain"
                open={!!proof || !!proofError || verifying}
              >
                {verification}
              </DataDisclosure>
            </>
          )}
          {page === "verify" && (
            <>
              <div className="mn-verify-layout">
                {verification}
                <aside className="mn-panel mn-verification-guide">
                  <div className="mn-guide-symbol">
                    <Fingerprint size={30} />
                  </div>
                  <h2>Know what the proof establishes.</h2>
                  <p>
                    A finalized receipt confirms the recorded transaction.
                    Deployment records do not prove trading revenue or verified
                    AI execution.
                  </p>
                  <Link href="/evidence">
                    Explore the evidence <ArrowUpRight size={14} />
                  </Link>
                </aside>
              </div>
              <Transactions
                data={data}
                compact
                verifying={verifying}
                onVerify={(value) => void verify(value)}
              />
            </>
          )}
          {page === "nfts" && (
            <>
              <div className="mn-receipt-stats">
                <article className="mn-panel">
                  <span className="mn-small-label">On-chain supply</span>
                  <strong className="mn-large">{data.nfts.totalSupply}</strong>
                  <p>Receipts minted by the mainnet treasury.</p>
                </article>
                <article className="mn-panel">
                  <span className="mn-small-label">
                    Revenue-share entitlements
                  </span>
                  <strong className="mn-large">
                    {data.nfts.revenueShareBps}
                    <small> bps</small>
                  </strong>
                  <p>Business-funded distributions remain unproven.</p>
                </article>
              </div>
              <section className="mn-panel mn-empty-state">
                <div className="mn-empty-symbol">
                  <PackageOpen size={34} strokeWidth={1.3} />
                </div>
                <h2>
                  {data.nfts.totalSupply === "0"
                    ? "No mainnet receipts yet"
                    : "Inspect the treasury receipt records"}
                </h2>
                <p>
                  {data.nfts.totalSupply === "0"
                    ? "When the treasury mints an on-chain receipt, its supply will be reflected here. No placeholder NFTs are displayed."
                    : "Supply is read from the mainnet treasury. Inspect individual token records on the explorer."}
                </p>
                <a
                  className="sc-button"
                  href={"https://nearblocks.io/address/" + data.treasuryAccount}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View treasury <ArrowUpRight size={14} />
                </a>
              </section>
            </>
          )}
          {page === "business" && (
            <>
              <section className="mn-business-metrics">
                <article>
                  <span>External revenue</span>
                  <strong>Unproven</strong>
                  <p>No confirmed customer revenue is established.</p>
                </article>
                <article>
                  <span>Net business profit</span>
                  <strong>Unknown</strong>
                  <p>Capital funding does not establish earnings.</p>
                </article>
                <article>
                  <span>Business runway</span>
                  <strong>Unknown</strong>
                  <p>Requires a complete operating cost basis.</p>
                </article>
              </section>
              <div className="mn-overview-grid">
                <section className="mn-panel">
                  <SectionHeading
                    title="Compute & operating allowance"
                    description="Configured ceilings, distinct from purchased provider credits."
                  />
                  <AllowanceDetails data={data} />
                </section>
                <ExecutionStatus data={data} />
              </div>
              <div className="mn-inline-note">
                <CircleHelp size={17} />
                <p>
                  Confirmed funding and internal service payments demonstrate
                  capital movement. Customer demand, trading revenue, and a
                  self-funding compute loop remain separate claims.{" "}
                  <Link href="/evidence">
                    Inspect financial evidence <ArrowUpRight size={12} />
                  </Link>
                </p>
              </div>
            </>
          )}
          {page === "operator" && (
            <>
              <div className="mn-control-intro">
                <div className="mn-control-icon">
                  <LockKeyhole size={23} />
                </div>
                <div>
                  <h2>Observation controls</h2>
                  <p>
                    The mainnet interface reads deployed state. Wallet
                    connection does not authorize an execution or change agent
                    permissions.
                  </p>
                </div>
                <StatusBadge>Read only</StatusBadge>
              </div>
              <div className="mn-overview-grid">
                <ExecutionStatus data={data} />
                <section className="mn-panel">
                  <SectionHeading
                    title="Owner & configuration"
                    description="On-chain identity and configured operating allowances."
                  />
                  <dl className="mn-facts">
                    <div>
                      <dt>Owner account</dt>
                      <dd>
                        <Identifier
                          value={data.ownerAccount}
                          label="owner account"
                        />
                      </dd>
                    </div>
                    <div>
                      <dt>Treasury contract</dt>
                      <dd>
                        <Identifier
                          value={data.treasuryAccount}
                          label="treasury account"
                        />
                      </dd>
                    </div>
                    <div>
                      <dt>Temporary deployment key</dt>
                      <dd>
                        <StatusBadge
                          tone={
                            data.deployment.temporaryKeyRevoked
                              ? "success"
                              : "warning"
                          }
                        >
                          {data.deployment.temporaryKeyRevoked
                            ? "Revoked"
                            : "Needs review"}
                        </StatusBadge>
                      </dd>
                    </div>
                    <div>
                      <dt>Your wallet</dt>
                      <dd>
                        {wallet.account ? (
                          <Identifier
                            value={wallet.account.accountId}
                            label="connected wallet"
                          />
                        ) : (
                          "Not connected"
                        )}
                      </dd>
                    </div>
                  </dl>
                  {wallet.error && (
                    <p className="app-field-error" role="status">
                      {wallet.error}
                    </p>
                  )}
                </section>
              </div>
              <DataDisclosure
                title="Configured allowances & remaining gates"
                description="Inspect the AI budget, model, and execution limitations"
                open
              >
                <AllowanceDetails data={data} />
                <ul className="mn-blockers">
                  {data.blockers.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </DataDisclosure>
              <AccountDirectory data={data} />
            </>
          )}
          <div className="mn-observed">
            <span>
              <i />
              Finalized mainnet observations
            </span>
            <span>
              Block {data.block.height} · {timestamp(data.capturedAt)} UTC
            </span>
          </div>
        </>
      )}
    </AppShell>
  );
}
