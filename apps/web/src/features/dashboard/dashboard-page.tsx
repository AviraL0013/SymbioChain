"use client";

import { useState } from "react";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  CircleHelp,
  Clock3,
  Flame,
  Radio,
  Wallet,
} from "lucide-react";
import type { ViewerSnapshot } from "@symbiochain/shared";
import { Dialog } from "@/components/ui/dialog";
import { BrainArt, EyeArt, HandArt } from "@/features/landing/artwork";
import { AppHeader, AppFooter } from "@/features/application/app-shell";
import { OperatingBoundaries } from "@/features/application/operating-boundaries";
import { ConnectionNotice, useSwarm } from "@/features/swarm/swarm-provider";
import {
  agentInfo,
  agentName,
  formatAtoms,
  timestamp,
  workerStatus,
} from "@/features/swarm/format";
import { ComputeStatus } from "@/features/swarm/compute-status";
import { TreasuryChart } from "./treasury-chart";
import "./dashboard.css";

const illustrations = { SCOUT: EyeArt, BRAIN: BrainArt, HAND: HandArt };
type Decision = ViewerSnapshot["decisions"][number];
type Transaction = ViewerSnapshot["transactions"][number];

export function DashboardPage() {
  const { data, error, loading, refresh } = useSwarm();
  const [filter, setFilter] = useState("ALL");
  const [decision, setDecision] = useState<Decision | null>(null);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const treasury = data?.treasury;
  const decisions =
    data?.decisions.filter(
      (item) => filter === "ALL" || item.agent === filter,
    ) ?? [];
  const transactions = data?.transactions ?? [];
  const workersOnline =
    data?.workers.length === 3 &&
    data.workers.every(
      (worker) => workerStatus(worker, data.capturedAt) === "Online",
    );
  const status = error
    ? "Connection lost"
    : loading
      ? "Connecting"
      : data?.paused
        ? "Swarm paused"
        : workersOnline
          ? "Workers online"
          : "Awaiting worker heartbeat";
  const lowReserve =
    treasury &&
    BigInt(treasury.availableAtoms) < BigInt(treasury.minReserveAtoms);

  return (
    <div className="mission-control">
      <a href="#dashboard-content" className="sc-skip-link">
        Skip to dashboard
      </a>
      <AppHeader />
      <main id="dashboard-content" className="sc-main">
        <noscript>
          <p className="sc-noscript-notice">
            JavaScript is required to load backend telemetry.
          </p>
        </noscript>
        <ConnectionNotice />
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
              className={`sc-status-pill ${!error && workersOnline && !data?.paused ? "is-alive" : "is-muted"}`}
            >
              <i />
              {status}
            </span>
          </div>
        </section>
        <OperatingBoundaries />
        <section className="sc-vitals" aria-label="Swarm vital signs">
          <article className="sc-vital">
            <div className="sc-vital-label">
              <span>Swarm heartbeat</span>
              <Activity size={17} />
            </div>
            <div className="sc-heartbeat-value">
              <span
                className={`sc-heartbeat ${error || !workersOnline ? "is-still" : ""}`}
              />
              <strong>
                {error
                  ? "Offline"
                  : data?.paused
                    ? "Paused"
                    : workersOnline
                      ? "Online"
                      : "Unknown"}
              </strong>
            </div>
            <p>
              {data
                ? `Snapshot ${timestamp(data.capturedAt)} UTC${error ? " · stale" : ""}`
                : "Waiting for worker telemetry"}
            </p>
            <div
              className={`sc-pulse-line ${error || !workersOnline ? "is-still" : ""}`}
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
            <div className="sc-vital-number">
              {formatAtoms(treasury?.balanceAtoms, treasury?.decimals ?? 0)}
              <span>{treasury?.asset ?? "—"}</span>
            </div>
            <p>Recorded PAPER ledger balance</p>
            <span className="sc-vital-foot">
              Available:{" "}
              {formatAtoms(treasury?.availableAtoms, treasury?.decimals ?? 0)}{" "}
              {treasury?.asset}
            </span>
          </article>
          <article className="sc-vital">
            <div className="sc-vital-label">
              <span>Metered inference</span>
              <Flame size={17} />
            </div>
            <div className="sc-vital-number">
              {formatAtoms(data?.compute.inferenceCostUsdMicros, 6)}
              <span>USD</span>
            </div>
            <p>Cumulative simulated inference cost</p>
            <span className="sc-vital-foot">
              Direct compute purchase is not implemented
            </span>
          </article>
          <article className="sc-vital sc-survival">
            <div className="sc-vital-label">
              <span>Business runway</span>
              <Clock3 size={17} />
            </div>
            <div className="sc-vital-number">Unknown</div>
            <p>A complete realized cost basis is not available.</p>
            <span className="sc-vital-foot">No estimated survival claim</span>
          </article>
        </section>
        <ComputeStatus />
        {lowReserve && (
          <div className="sc-reserve-notice" role="status">
            <Flame size={18} />
            <p>
              <strong>Available treasury is below the policy reserve.</strong>{" "}
              Recorded PAPER policy only.
            </p>
            <span>
              {formatAtoms(treasury.minReserveAtoms, treasury.decimals)}{" "}
              {treasury.asset}
            </span>
          </div>
        )}
        <div className="sc-overview-grid">
          <TreasuryChart data={data} />
          <section
            className="sc-panel sc-decisions"
            aria-labelledby="decisions-heading"
          >
            <div className="sc-panel-heading">
              <h2 id="decisions-heading">Decision stream</h2>
              <button
                type="button"
                className="sc-text-button"
                onClick={refresh}
              >
                Refresh
              </button>
            </div>
            <div className="sc-feed-toolbar">
              <label>
                <span className="sr-only">Filter decisions by agent</span>
                <select
                  aria-label="Filter decisions by agent"
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                >
                  <option value="ALL">All agents</option>
                  {agentInfo.map((agent) => (
                    <option key={agent.role} value={agent.role}>
                      {agent.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={13} />
              </label>
              <span>
                <i className={error ? "is-paused" : ""} />
                {error ? "Stale records" : "Recorded PAPER feed"}
              </span>
            </div>
            <div
              className="sc-feed-body"
              role="region"
              aria-label="Recent recorded decisions"
            >
              {decisions.length ? (
                <ol>
                  {decisions.slice(0, 5).map((item) => {
                    const Art = illustrations[item.agent];
                    return (
                      <li key={item.id} className="sc-feed-item">
                        <span className="sc-feed-marker">
                          <Art />
                        </span>
                        <button type="button" onClick={() => setDecision(item)}>
                          <span className="sc-feed-meta">
                            <strong>{agentName(item.agent)}</strong>
                            <time dateTime={item.timestamp}>
                              {timestamp(item.timestamp)} UTC
                            </time>
                          </span>
                          <span className="sc-feed-action">{item.action}</span>
                          <ArrowUpRight className="sc-feed-open" size={18} />
                        </button>
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <div className="sc-empty">
                  <Radio size={29} />
                  <strong>
                    {data
                      ? "No recorded decisions for this agent."
                      : "Waiting for the first signal."}
                  </strong>
                  <p>Decisions appear after a backend cycle advances.</p>
                </div>
              )}
            </div>
            <div className="sc-feed-footer">
              <span>{data?.decisions.length ?? 0} recent records</span>
              <span>PAPER · simulated execution</span>
            </div>
          </section>
        </div>
        <section className="sc-agents-section" aria-labelledby="agents-heading">
          <div className="sc-section-heading">
            <h2 id="agents-heading">Your agents.</h2>
            <a
              className="sc-button sc-button-recovery"
              href="https://symbiochain-core.onrender.com/dashboard"
              target="_blank"
              rel="noreferrer"
            >
              Operator controls <ArrowUpRight size={14} />
            </a>
          </div>
          <div className="sc-agent-grid">
            {agentInfo.map((agent) => {
              const Art = illustrations[agent.role];
              const worker = data?.workers.find(
                (item) => item.role === agent.role,
              );
              const state = error
                ? "Connection lost"
                : workerStatus(worker, data?.capturedAt);
              const recent = data?.decisions.find(
                (item) => item.agent === agent.role,
              );
              return (
                <article
                  key={agent.role}
                  className={`sc-agent-card sc-${agent.color}${state !== "Online" ? " is-unavailable" : ""}`}
                >
                  <div className="sc-agent-top">
                    <span className="sc-agent-name">{agent.name}</span>
                    <span className="sc-agent-role">{agent.title}</span>
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
                      <i className={state !== "Online" ? "is-paused" : ""} />
                      {state}
                    </span>
                    <strong>
                      {worker?.heartbeat
                        ? `${timestamp(worker.heartbeat)} UTC`
                        : "No heartbeat"}
                    </strong>
                  </div>
                  <p className="sc-agent-note">
                    {recent
                      ? `Last recorded action: ${recent.action}`
                      : "No activity recorded."}
                  </p>
                </article>
              );
            })}
          </div>
          <p className="sc-agent-note">
            <CircleHelp size={13} />
            EYE maps to the SCOUT worker. Pause, resume and fault recovery
            require operator authentication.
          </p>
        </section>
        <section
          className="sc-panel sc-settlements"
          aria-labelledby="settlements-heading"
        >
          <div className="sc-panel-heading">
            <h2 id="settlements-heading">Recent settlements</h2>
            <span>PAPER ledger</span>
          </div>
          <div
            className="sc-table-scroll"
            tabIndex={0}
            role="region"
            aria-label="Recorded PAPER settlements"
          >
            <table>
              <caption className="sr-only">
                Simulated backend execution records. Times are UTC.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Chain</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Status</th>
                  <th scope="col">Time · UTC</th>
                  <th scope="col">Reference</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((item) => (
                  <tr key={item.id}>
                    <td>{item.chainId}</td>
                    <td className="sc-amount">
                      <strong>
                        {item.decimals === null
                          ? item.amountAtoms
                          : formatAtoms(item.amountAtoms, item.decimals)}
                      </strong>{" "}
                      <span>
                        {item.decimals === null
                          ? `atomic units · ${item.asset}`
                          : item.asset}
                      </span>
                    </td>
                    <td>
                      <span className="sc-transaction-status">
                        <i />
                        Simulated
                      </span>
                    </td>
                    <td>
                      <time dateTime={item.timestamp}>
                        {timestamp(item.timestamp)}
                      </time>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="sc-reference-button"
                        onClick={() => setTransaction(item)}
                        aria-label={`View settlement ${item.id}`}
                      >
                        {item.txHash.slice(0, 20)}…<ArrowUpRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!transactions.length && (
              <div className="sc-empty sc-table-empty">
                <strong>
                  {data
                    ? "No settlements recorded yet."
                    : "No settlement data connected."}
                </strong>
              </div>
            )}
          </div>
          <div className="sc-table-footer">
            <span>
              <span className="sc-sample-tag">PAPER</span>Simulated. No explorer
              transaction.
            </span>
            <span>{transactions.length} recent records</span>
          </div>
        </section>
        <AppFooter />
      </main>
      <Dialog
        open={!!decision}
        title={decision?.action ?? "Decision details"}
        onClose={() => setDecision(null)}
      >
        {decision && (
          <>
            <div className="sc-dialog-meta">
              <strong>{agentName(decision.agent)}</strong>
              <span>{timestamp(decision.timestamp)} UTC</span>
            </div>
            <p>{decision.details}</p>
            <dl className="sc-transaction-detail">
              <div>
                <dt>Cycle</dt>
                <dd>{decision.cycleId}</dd>
              </div>
            </dl>
            <div className="sc-dialog-note">
              This is a recorded PAPER decision. It does not attest to a live
              model or a real trade.
            </div>
            <button
              type="button"
              className="sc-button sc-dialog-primary"
              onClick={() => setDecision(null)}
            >
              Back to the stream <ArrowRight size={16} />
            </button>
          </>
        )}
      </Dialog>
      <Dialog
        open={!!transaction}
        title="Recorded PAPER settlement"
        onClose={() => setTransaction(null)}
      >
        {transaction && (
          <>
            <p>
              This simulated execution was persisted by the backend. It has no
              on-chain explorer transaction.
            </p>
            <dl className="sc-transaction-detail">
              <div>
                <dt>Reference</dt>
                <dd>{transaction.txHash}</dd>
              </div>
              <div>
                <dt>Cycle</dt>
                <dd>{transaction.cycleId}</dd>
              </div>
              <div>
                <dt>Chain</dt>
                <dd>{transaction.chainId}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{transaction.status}</dd>
              </div>
            </dl>
          </>
        )}
      </Dialog>
    </div>
  );
}
