"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Flame,
  LayoutDashboard,
  Network,
  Pause,
  Play,
  Plus,
  Radio,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Square,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import type { AgentName, DecisionLog } from "@symbiochain/shared";
import { Dialog } from "@/components/ui/dialog";
import { BrainArt, EyeArt, HandArt } from "@/features/landing/artwork";
import { RibbonMark } from "@/features/landing/brand";
import {
  agentInfo,
  DEMO_EPOCH,
  demoTime,
  demoTransactions,
  timeAgo,
  type PreviewTransaction,
  type Scenario,
} from "./demo-data";
import { previewHealth } from "./demo-state";
import { TreasuryChart } from "./treasury-chart";
import { useDemoSwarm } from "./use-demo-swarm";
import "./dashboard.css";

const navigation = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/topology", label: "Topology", icon: Network },
  { href: "/verify", label: "Proofs", icon: ShieldCheck },
  { href: "/nfts", label: "NFTs", icon: Square },
];
const illustrations = { EYE: EyeArt, BRAIN: BrainArt, HAND: HandArt };
const agentColors: Record<AgentName, string> = {
  EYE: "blue",
  BRAIN: "yellow",
  HAND: "pink",
  SYSTEM: "neutral",
};
type Filter = "ALL" | AgentName;

export function DashboardPage() {
  const { state, dispatch } = useDemoSwarm();
  const health = previewHealth(state.scenario, state.elapsed);
  const now = DEMO_EPOCH + state.elapsed * 1000;
  const offline = state.scenario === "offline";
  const exhausted = state.scenario === "exhausted";
  const recovering = state.recoveryUntil !== null;
  const recoverySeconds = Math.max(
    0,
    (state.recoveryUntil ?? state.elapsed) - state.elapsed,
  );
  const [filter, setFilter] = useState<Filter>("ALL");
  const [transactionFilter, setTransactionFilter] = useState("ALL");
  const [walletOpen, setWalletOpen] = useState(false);
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<DecisionLog | null>(
    null,
  );
  const [selectedTransaction, setSelectedTransaction] =
    useState<PreviewTransaction | null>(null);
  const decisions = useMemo(
    () =>
      state.decisions.filter(
        (item) => filter === "ALL" || item.agent === filter,
      ),
    [state.decisions, filter],
  );
  const transactions = offline
    ? []
    : demoTransactions.filter(
        (item) =>
          transactionFilter === "ALL" || item.status === transactionFilter,
      );
  const status = offline
    ? "Awaiting connection"
    : exhausted
      ? "Swarm paused"
      : state.scenario === "low"
        ? "Reserve running low"
        : "The swarm is alive";
  const pulseAge = health
    ? Math.floor((now - health.lastPulseTimestamp) / 1000)
    : 0;

  return (
    <div className={`mission-control sc-scenario-${state.scenario}`}>
      <a href="#dashboard-content" className="sc-skip-link">
        Skip to dashboard
      </a>
      <header className="sc-header">
        <div className="sc-header-inner">
          <Link href="/" className="sc-brand" aria-label="SymbioChain home">
            <RibbonMark />
            <span>SymbioChain</span>
          </Link>
          <nav className="sc-navigation" aria-label="Application navigation">
            {navigation.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                aria-current={href === "/dashboard" ? "page" : undefined}
              >
                <Icon size={16} aria-hidden="true" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="sc-header-actions">
            <span className="sc-network">
              <span /> NEAR Testnet
            </span>
            <button
              type="button"
              className="sc-button sc-button-dark"
              onClick={() => setWalletOpen(true)}
            >
              <Wallet size={16} />
              Connect wallet
            </button>
          </div>
        </div>
      </header>

      <main id="dashboard-content" className="sc-main">
        <noscript>
          <p className="sc-noscript-notice">
            Interactive preview controls require JavaScript. All displayed
            activity is sample data.
          </p>
        </noscript>
        <div className="sc-demo-notice">
          <div className="sc-demo-label">
            <Sparkles size={15} />
            <strong>Demo swarm</strong>
            <span className="sc-demo-separator" />
            <span>Sample data. No funds moved.</span>
          </div>
          <button
            type="button"
            className="sc-text-button"
            onClick={() => dispatch({ type: "reset" })}
          >
            <RotateCcw size={13} />
            Reset demo
          </button>
        </div>

        <section
          className="sc-page-heading"
          aria-labelledby="dashboard-heading"
        >
          <div>
            <h1 id="dashboard-heading">
              Mission Control<span className="sc-heading-period">.</span>
            </h1>
            <p>Treasury, decisions, and the agents behind them.</p>
          </div>
          <div className="sc-heading-controls">
            <span
              className={`sc-status-pill ${offline || exhausted ? "is-muted" : state.scenario === "low" ? "is-warning" : "is-alive"}`}
            >
              <i />
              {status}
            </span>
            <label className="sc-scenario-select">
              <span className="sr-only">Preview state</span>
              <select
                aria-label="Preview state"
                value={state.scenario}
                onChange={(event) =>
                  dispatch({
                    type: "scenario",
                    scenario: event.target.value as Scenario,
                  })
                }
              >
                <option value="funded">Preview: funded</option>
                <option value="low">Preview: low balance</option>
                <option value="exhausted">Preview: exhausted</option>
                <option value="offline">Preview: offline</option>
              </select>
              <ChevronDown size={14} />
            </label>
          </div>
        </section>

        <section className="sc-vitals" aria-label="Swarm vital signs">
          <article className="sc-vital">
            <div className="sc-vital-label">
              <span>Swarm heartbeat</span>
              <Activity size={17} />
            </div>
            <div className="sc-heartbeat-value">
              <span
                className={`sc-heartbeat ${offline || exhausted ? "is-still" : ""}`}
              />
              <strong>
                {offline ? "Offline" : exhausted ? "Paused" : "Alive"}
              </strong>
            </div>
            <p>
              {offline
                ? "No telemetry connected"
                : exhausted
                  ? "Compute reserve depleted"
                  : `Simulated pulse · ${pulseAge}s ago`}
            </p>
            <div
              className={`sc-pulse-line ${offline || exhausted ? "is-still" : ""}`}
              aria-hidden="true"
            >
              <svg viewBox="0 0 280 35" preserveAspectRatio="none">
                <path d="M0 20H62l8-5 8 5h35l8-15 12 28 11-20 8 7h46l8-5 8 5h66" />
              </svg>
            </div>
          </article>
          <article className="sc-vital">
            <div className="sc-vital-label">
              <span>Treasury balance</span>
              <Wallet size={17} />
            </div>
            <div className="sc-vital-number" key={`balance-${state.scenario}`}>
              {health ? Number(health.nearBalance).toFixed(2) : "—"}
              <span>NEAR</span>
            </div>
            <p>
              {offline
                ? "Waiting for treasury data"
                : "Shared across three agent accounts"}
            </p>
            <span className="sc-vital-foot">
              <span className="sc-mini-dot" />
              Sample treasury
            </span>
          </article>
          <article className="sc-vital">
            <div className="sc-vital-label">
              <span>Compute burn</span>
              <Flame size={17} />
            </div>
            <div className="sc-vital-number">
              {health ? health.computeCostPerHour : "—"}
              <span>NEAR / hr</span>
            </div>
            <p>Estimated cost of keeping the swarm running</p>
            <span className="sc-vital-foot">
              <Zap size={12} />
              Inference budget
            </span>
          </article>
          <article className="sc-vital sc-survival">
            <div className="sc-vital-label">
              <span>Survival time</span>
              <Clock3 size={17} />
            </div>
            <div className="sc-vital-number" key={`survival-${state.scenario}`}>
              {health
                ? health.survivalHours.toLocaleString("en-US", {
                    maximumFractionDigits: 1,
                  })
                : "—"}
              <span>hours</span>
            </div>
            <p>
              {offline
                ? "Waiting for balance and burn rate"
                : exhausted
                  ? "No compute runway remaining"
                  : state.scenario === "low"
                    ? "Below the eight-hour compute reserve"
                    : "Estimated runway at the current burn rate"}
            </p>
            <div className="sc-runway" aria-hidden="true">
              {Array.from({ length: 24 }, (_, i) => (
                <i
                  key={i}
                  className={
                    health &&
                    i < Math.ceil(Math.min(health.survivalHours, 48) / 2)
                      ? "is-filled"
                      : ""
                  }
                />
              ))}
            </div>
          </article>
        </section>

        {(state.scenario === "low" || exhausted) && (
          <div className="sc-reserve-notice" role="status">
            <Flame size={18} />
            <p>
              <strong>
                {exhausted
                  ? "The reserve is exhausted."
                  : "The runway is getting shorter."}
              </strong>{" "}
              {exhausted
                ? "This sample swarm cannot fund another inference cycle."
                : "This sample treasury is below its 4 NEAR compute reserve."}
            </p>
            <span>Preview state</span>
          </div>
        )}

        <div className="sc-overview-grid">
          <TreasuryChart scenario={state.scenario} />
          <section
            className="sc-panel sc-decisions"
            aria-labelledby="decisions-heading"
          >
            <div className="sc-panel-heading">
              <div>
                <h2 id="decisions-heading">Decision stream</h2>
              </div>
              <button
                type="button"
                className="sc-icon-button"
                aria-label={
                  state.paused
                    ? "Resume demo decision feed"
                    : "Pause demo decision feed"
                }
                aria-pressed={state.paused}
                disabled={offline || exhausted}
                onClick={() => dispatch({ type: "pause" })}
              >
                {state.paused ? <Play size={16} /> : <Pause size={16} />}
              </button>
            </div>
            <div className="sc-feed-toolbar">
              <label>
                <span className="sr-only">Filter decisions by agent</span>
                <select
                  aria-label="Filter decisions by agent"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as Filter)}
                >
                  {["ALL", "EYE", "BRAIN", "HAND", "SYSTEM"].map((name) => (
                    <option key={name} value={name}>
                      {name === "ALL" ? "All agents" : name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={13} />
              </label>
              <span>
                <i
                  className={
                    state.paused || offline || exhausted ? "is-paused" : ""
                  }
                />
                {offline
                  ? "Disconnected"
                  : exhausted
                    ? "Swarm paused"
                    : state.paused
                      ? "Feed paused"
                      : "Simulated feed"}
              </span>
            </div>
            <div
              className="sc-feed-body"
              role="region"
              aria-label="Recent demo decisions"
            >
              {decisions.length ? (
                <ol>
                  {decisions.slice(0, 5).map((item) => (
                    <li key={item.id} className="sc-feed-item">
                      <span className="sc-feed-marker">
                        {item.agent === "EYE" ? (
                          <EyeArt />
                        ) : item.agent === "BRAIN" ? (
                          <BrainArt />
                        ) : item.agent === "HAND" ? (
                          <HandArt />
                        ) : (
                          <Activity size={24} />
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedDecision(item)}
                      >
                        <span className="sc-feed-meta">
                          <strong>{item.agent}</strong>
                          <time
                            dateTime={new Date(item.timestamp).toISOString()}
                          >
                            {timeAgo(item.timestamp, now)}
                          </time>
                        </span>
                        <span className="sc-feed-action">{item.action}</span>
                        <ArrowUpRight
                          className="sc-feed-open"
                          size={18}
                          aria-hidden="true"
                        />
                      </button>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="sc-empty">
                  <Radio size={29} strokeWidth={1.3} />
                  <strong>
                    {offline
                      ? "Waiting for the first signal."
                      : "No decisions from this agent yet."}
                  </strong>
                  <p>
                    {offline
                      ? "The decision stream appears when telemetry is available."
                      : "Choose another agent or simulate a new event."}
                  </p>
                </div>
              )}
            </div>
            <div className="sc-feed-footer">
              <span>{state.decisions.length} sample decisions</span>
              <button
                type="button"
                className="sc-text-button"
                disabled={offline || exhausted || state.paused || recovering}
                onClick={() => dispatch({ type: "event" })}
              >
                Simulate event <Plus size={14} />
              </button>
            </div>
          </section>
        </div>

        <section className="sc-agents-section" aria-labelledby="agents-heading">
          <div className="sc-section-heading">
            <div>
              <h2 id="agents-heading">Your agents.</h2>
            </div>
            <button
              type="button"
              className="sc-button sc-button-recovery"
              onClick={() => setRecoveryOpen(true)}
              disabled={offline || exhausted || recovering}
            >
              <RotateCcw size={14} />
              {recovering ? `Recovery · ${recoverySeconds}s` : "Test recovery"}
            </button>
          </div>
          <div className="sc-agent-grid">
            {agentInfo.map((agent) => {
              const Art = illustrations[agent.name];
              const unavailable =
                offline || exhausted || (recovering && agent.name === "EYE");
              const activity = offline
                ? "No connection"
                : exhausted
                  ? "Paused"
                  : recovering && agent.name === "EYE"
                    ? "Recovering"
                    : agent.name === "EYE"
                      ? "Scanning routes"
                      : agent.name === "BRAIN"
                        ? "Assessing risk"
                        : "Ready to execute";
              return (
                <article
                  key={agent.name}
                  className={`sc-agent-card sc-${agent.color}${unavailable ? " is-unavailable" : ""}`}
                >
                  <div className="sc-agent-top">
                    <span className="sc-agent-name">{agent.name}</span>
                    <span className="sc-agent-role">{agent.role}</span>
                    <ArrowUpRight size={18} aria-hidden="true" />
                  </div>
                  <div className="sc-agent-middle">
                    <div>
                      <h3>{agent.summary}</h3>
                      <p>{agent.detail}</p>
                    </div>
                    <Art className="sc-agent-art" />
                  </div>
                  <div className="sc-agent-bottom">
                    <span>
                      <i className={unavailable ? "is-paused" : ""} />
                      {activity}
                    </span>
                    <strong>
                      {offline
                        ? "—"
                        : exhausted
                          ? "0.00"
                          : state.scenario === "low"
                            ? "0.60"
                            : agent.fundedBalance}{" "}
                      <span>NEAR</span>
                    </strong>
                  </div>
                  {recovering && agent.name === "EYE" && (
                    <div
                      className="sc-recovery-progress"
                      role="progressbar"
                      aria-label="Simulated EYE recovery"
                      aria-valuemin={0}
                      aria-valuemax={10}
                      aria-valuenow={10 - recoverySeconds}
                    >
                      <span
                        style={{ width: `${(10 - recoverySeconds) * 10}%` }}
                      />
                    </div>
                  )}
                </article>
              );
            })}
          </div>
          <p className="sc-agent-note">
            <CircleHelp size={13} />
            Agent balances and activity are examples. Recovery pauses only the
            demo scout for 10 seconds.
          </p>
        </section>

        <section
          className="sc-panel sc-settlements"
          aria-labelledby="settlements-heading"
        >
          <div className="sc-panel-heading">
            <div>
              <h2 id="settlements-heading">Recent settlements</h2>
            </div>
            <label className="sc-table-filter">
              <span className="sr-only">Filter settlements by status</span>
              <select
                value={transactionFilter}
                aria-label="Filter settlements by status"
                onChange={(event) => setTransactionFilter(event.target.value)}
              >
                <option value="ALL">All statuses</option>
                <option value="SUCCESS">Success</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
              </select>
              <ChevronDown size={14} />
            </label>
          </div>
          <div
            className="sc-table-scroll"
            tabIndex={0}
            role="region"
            aria-label="Sample settlement history"
          >
            <table>
              <caption className="sr-only">
                Illustrative settlements. No transaction was submitted. Times
                are UTC.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Route</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Status</th>
                  <th scope="col">
                    Time <span>UTC</span>
                  </th>
                  <th scope="col">Reference</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="sc-settlement-route">
                        <span
                          className={`sc-route-icon sc-route-${item.chain.toLowerCase()}`}
                        >
                          <Image
                            src={`/chains/${item.chain.toLowerCase()}.svg`}
                            alt=""
                            width={24}
                            height={24}
                            unoptimized
                          />
                        </span>
                        <div>
                          <strong>{item.route}</strong>
                          <span className="sc-route-network">
                            {item.chain === "NEAR"
                              ? "NEAR"
                              : item.chain === "ETHEREUM"
                                ? "Ethereum"
                                : "Solana"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="sc-amount">
                      <strong>{item.amount}</strong> <span>{item.asset}</span>
                    </td>
                    <td>
                      <span
                        className={`sc-transaction-status is-${item.status.toLowerCase()}`}
                      >
                        <i />
                        {item.status === "SUCCESS"
                          ? "Success"
                          : item.status === "PENDING"
                            ? "Pending"
                            : "Failed"}
                      </span>
                    </td>
                    <td>
                      <time dateTime={new Date(item.timestamp).toISOString()}>
                        {demoTime(item.timestamp)}
                      </time>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="sc-reference-button"
                        onClick={() => setSelectedTransaction(item)}
                        aria-label={`View sample settlement ${item.txHash}`}
                      >
                        {item.txHash}
                        <ArrowUpRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!transactions.length && (
              <div className="sc-empty sc-table-empty">
                <ArrowDownLeft size={28} strokeWidth={1.3} />
                <strong>
                  {offline
                    ? "No settlement data connected."
                    : "No sample settlements match this filter."}
                </strong>
                <p>
                  {offline
                    ? "Transaction records will appear here once available."
                    : "Choose another status to view the sample history."}
                </p>
              </div>
            )}
          </div>
          <div className="sc-table-footer">
            <span>
              <span className="sc-sample-tag">SAMPLE</span>Illustrative records.
              No on-chain transactions.
            </span>
            <span>
              {transactions.length} of {offline ? 0 : demoTransactions.length}{" "}
              records
            </span>
          </div>
        </section>

        <footer className="sc-footer">
          <Link href="/" className="sc-footer-brand">
            SymbioChain<span>Stay alive.</span>
          </Link>
          <p>SymbioChain on NEAR</p>
          <Link href="/">
            Back to the website <ArrowUpRight size={14} />
          </Link>
        </footer>
      </main>

      {state.notice && (
        <div className="sc-toast" role="status">
          <span className="sc-toast-icon">
            <Check size={17} />
          </span>
          <p>{state.notice.text}</p>
          <button
            type="button"
            className="sc-icon-button"
            aria-label="Dismiss notification"
            onClick={() => dispatch({ type: "dismiss" })}
          >
            <X size={17} />
          </button>
        </div>
      )}
      <Dialog
        open={walletOpen}
        title="Connect your wallet"
        onClose={() => setWalletOpen(false)}
      >
        <div className="sc-dialog-art">
          <Wallet size={34} strokeWidth={1.4} />
        </div>
        <p>
          Wallet connections are not enabled in this frontend preview. No
          account is connected, and no funds can be deposited or moved.
        </p>
        <div className="sc-dialog-note">
          <ShieldCheck size={17} />
          Never share your seed phrase or private keys.
        </div>
        <button
          type="button"
          className="sc-button sc-button-dark sc-dialog-primary"
          onClick={() => setWalletOpen(false)}
        >
          Back to the demo <ArrowRight size={16} />
        </button>
      </Dialog>
      <Dialog
        open={recoveryOpen}
        title="Test scout recovery"
        onClose={() => setRecoveryOpen(false)}
      >
        <div className="sc-recovery-diagram" aria-hidden="true">
          <span className="sc-blue">EYE</span>
          <ArrowRight size={18} />
          <span>10 seconds</span>
          <ArrowRight size={18} />
          <span className="sc-green">Online</span>
        </div>
        <p>
          Pause the sample EYE agent and watch its ten-second recovery. BRAIN
          and HAND stay available while the demo scout comes back online.
        </p>
        <p className="sc-dialog-muted">
          This is a local UI simulation. It does not stop a real agent or call
          your teammate’s backend.
        </p>
        <div className="sc-dialog-actions">
          <button
            type="button"
            className="sc-button"
            onClick={() => setRecoveryOpen(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="sc-button sc-button-dark"
            onClick={() => {
              dispatch({ type: "recover" });
              setRecoveryOpen(false);
            }}
          >
            Run simulation <Play size={14} />
          </button>
        </div>
      </Dialog>
      <Dialog
        open={selectedDecision !== null}
        title={selectedDecision?.action ?? "Decision details"}
        onClose={() => setSelectedDecision(null)}
      >
        {selectedDecision && (
          <>
            <div className="sc-dialog-meta">
              <span
                className={`sc-agent-name sc-${agentColors[selectedDecision.agent]}`}
              >
                {selectedDecision.agent}
              </span>
              <span>
                {demoTime(selectedDecision.timestamp)} UTC · Sample decision
              </span>
            </div>
            <p>{selectedDecision.details}</p>
            <div className="sc-dialog-note">
              <CircleHelp size={17} />
              Sample decisions are not TEE attestations or trade instructions.
            </div>
            <button
              type="button"
              className="sc-button sc-dialog-primary"
              onClick={() => setSelectedDecision(null)}
            >
              Back to the stream <ArrowRight size={16} />
            </button>
          </>
        )}
      </Dialog>
      <Dialog
        open={selectedTransaction !== null}
        title="A sample settlement."
        onClose={() => setSelectedTransaction(null)}
      >
        {selectedTransaction && (
          <>
            <p>
              This record illustrates the settlement interface. No transaction
              was signed or broadcast, so there is no explorer transaction to
              verify.
            </p>
            <dl className="sc-transaction-detail">
              <div>
                <dt>Reference</dt>
                <dd>{selectedTransaction.txHash}</dd>
              </div>
              <div>
                <dt>Route</dt>
                <dd>{selectedTransaction.route}</dd>
              </div>
              <div>
                <dt>Amount</dt>
                <dd>
                  {selectedTransaction.amount} {selectedTransaction.asset}
                </dd>
              </div>
              <div>
                <dt>Network</dt>
                <dd>{selectedTransaction.chain}</dd>
              </div>
            </dl>
            <button
              type="button"
              className="sc-button sc-dialog-primary"
              onClick={() => setSelectedTransaction(null)}
            >
              Back to settlements <ArrowRight size={16} />
            </button>
          </>
        )}
      </Dialog>
    </div>
  );
}
