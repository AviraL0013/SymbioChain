"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ViewerCycles, ViewerCycle } from "@symbiochain/shared";
import { AppShell } from "@/features/application/app-shell";
import { useSwarm } from "@/features/swarm/swarm-provider";
import { formatAtoms, timestamp, agentName } from "@/features/swarm/format";
import "./cycles.css";
export function CyclesPage() {
  const { data } = useSwarm();
  const [page, setPage] = useState<ViewerCycles | null>(null),
    [cursor, setCursor] = useState<string | undefined>(),
    [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    void fetch(`/api/swarm/cycles${cursor ? `?cursor=${cursor}` : ""}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (r) => {
        if (!r.ok) throw Error("Cycle history is unavailable.");
        const result = ViewerCycles.parse(await r.json());
        setPage(result);
        setError("");
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setError("Cycle history is unavailable. Refresh to retry.");
      });
    return () => controller.abort();
  }, [cursor, data?.cursor]);
  return (
    <AppShell
      title="Execution journal"
      description="Follow each cycle from discovery to its recorded outcome."
      notice="PAPER execution records. Amounts, settlements and receipts are simulated."
    >
      {error && (
        <p className="app-field-error" role="alert">
          {error}
        </p>
      )}
      <div className="cycle-table-wrap">
        <table className="cycle-table">
          <caption className="sr-only">Recorded execution cycles</caption>
          <thead>
            <tr>
              <th>Cycle</th>
              <th>State</th>
              <th>Created (UTC)</th>
              <th>Policy outcome</th>
            </tr>
          </thead>
          <tbody>
            {page?.cycles.map((c) => (
              <tr key={c.id}>
                <td>
                  <Link href={`/cycles/${c.id}`}>{c.id.slice(0, 8)} →</Link>
                </td>
                <td>
                  <span className="cycle-state">
                    {c.state.replaceAll("_", " ")}
                  </span>
                </td>
                <td>{timestamp(c.createdAt)}</td>
                <td>{c.rejection ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!page?.cycles.length && (
        <p className="app-empty-inline">
          {page ? "No recorded cycles." : "Loading recorded cycles…"}
        </p>
      )}
      <div className="cycle-actions">
        <button
          className="sc-button"
          type="button"
          disabled={!cursor}
          onClick={() => setCursor(undefined)}
        >
          Newest cycles
        </button>
        <button
          className="sc-button sc-button-dark"
          type="button"
          disabled={!page?.nextCursor}
          onClick={() => setCursor(page?.nextCursor ?? undefined)}
        >
          Older cycles
        </button>
      </div>
    </AppShell>
  );
}
export function CyclePage({ id }: { id: string }) {
  const { data } = useSwarm();
  const [stored, setRecord] = useState<ViewerCycle | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    void fetch(`/api/swarm/cycles/${encodeURIComponent(id)}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (r) => {
        if (!r.ok)
          throw Error(
            r.status === 404
              ? "No recorded cycle found."
              : "Cycle details are unavailable.",
          );
        setRecord(ViewerCycle.parse(await r.json()));
        setError("");
      })
      .catch((e) => {
        if (!controller.signal.aborted)
          setError(
            e instanceof Error ? e.message : "Cycle details are unavailable.",
          );
      });
    return () => controller.abort();
  }, [id, data?.cursor]);
  const record = stored?.cycle.id === id ? stored : null;
  const units = (value: string | null | undefined) =>
    `${formatAtoms(value, record?.baseDecimals ?? 6)} ${record?.baseAsset ?? ""}`;
  return (
    <AppShell
      title="Cycle inspection"
      description={
        record
          ? `${record.cycle.state.replaceAll("_", " ")} · ${record.cycle.id}`
          : "Inspect recorded execution, policy checks and cost approval."
      }
      notice="Recorded PAPER evidence. A simulated result is not an on-chain transaction."
    >
      <Link href="/cycles" className="sc-text-button">
        ← All cycles
      </Link>
      {error && (
        <p className="app-field-error" role="alert">
          {error}
        </p>
      )}
      {!record && !error && <p className="app-empty-inline">Loading cycle…</p>}
      {record && (
        <>
          <div className="cycle-grid">
            <section className="cycle-card">
              <h2>Route &amp; policy</h2>
              <dl className="cycle-metrics">
                <div>
                  <dt>Input</dt>
                  <dd>{units(record.proposal.amountAtoms)}</dd>
                </div>
                <div>
                  <dt>Route</dt>
                  <dd>
                    {record.proposal.originChain} →{" "}
                    {record.proposal.destinationChain} →{" "}
                    {record.proposal.originChain}
                  </dd>
                </div>
                <div>
                  <dt>Slippage ceiling</dt>
                  <dd>{record.proposal.slippageBps} bps</dd>
                </div>
                <div>
                  <dt>Rejection</dt>
                  <dd>{record.cycle.rejection ?? "No recorded rejection"}</dd>
                </div>
              </dl>
            </section>
            <section className="cycle-card">
              <h2>Profit admission</h2>
              {record.profitCheck ? (
                <>
                  <p className="app-muted">
                    Indicative quote arithmetic. Cost allowances are estimates.
                  </p>
                  <dl className="cycle-metrics">
                    <div>
                      <dt>Conservative return</dt>
                      <dd>{units(record.profitCheck.minimumOutputAtoms)}</dd>
                    </div>
                    <div>
                      <dt>Cost allowance</dt>
                      <dd>
                        {units(record.profitCheck.previewCostAllowanceAtoms)}
                      </dd>
                    </div>
                    <div>
                      <dt>Net after allowance</dt>
                      <dd>
                        {units(
                          record.profitCheck.minimumNetAfterAllowanceAtoms,
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt>Required profit</dt>
                      <dd>{units(record.profitCheck.profitFloorAtoms)}</dd>
                    </div>
                    <div>
                      <dt>Shortfall</dt>
                      <dd>{units(record.profitCheck.shortfallAtoms)}</dd>
                    </div>
                    <div>
                      <dt>Profit gate</dt>
                      <dd>
                        {record.profitCheck.passesProfitFloor
                          ? "Passed against current policy"
                          : "Rejected"}
                      </dd>
                    </div>
                  </dl>
                </>
              ) : (
                <p className="app-muted">No quote recorded yet.</p>
              )}
            </section>
          </div>
          <section className="cycle-card">
            <h2>Settlement &amp; cost approval</h2>
            <p className="app-muted">
              Accountant approval is an explicit valuation. Full business runway
              remains unknown.
            </p>
            <dl className="cycle-metrics">
              <div>
                <dt>Status</dt>
                <dd>{record.economics.status.replaceAll("_", " ")}</dd>
              </div>
              <div>
                <dt>Simulated gross P&amp;L</dt>
                <dd>{units(record.economics.grossTradingPnlAtoms)}</dd>
              </div>
              <div>
                <dt>Metered inference</dt>
                <dd>
                  {formatAtoms(record.economics.inferenceCostUsdMicros, 6)} USD
                  (simulated)
                </dd>
              </div>
              <div>
                <dt>Approved cost allowance</dt>
                <dd>{units(record.economics.totalApprovedCostAtoms)}</dd>
              </div>
              <div>
                <dt>Net after approved costs</dt>
                <dd>{units(record.economics.netAfterApprovedCostsAtoms)}</dd>
              </div>
              <div>
                <dt>Receipt rights requested</dt>
                <dd>{record.economics.requestedShareBps} bps · simulated</dd>
              </div>
            </dl>
            {record.economics.requiresApprovalForRights &&
              record.economics.status === "AWAITING_COST_APPROVAL" && (
                <p className="cycle-callout">
                  This cycle waits for a settlement-bound cost approval in
                  Operator Control.
                </p>
              )}
          </section>
          <div className="cycle-grid">
            <section className="cycle-card">
              <h2>Decision timeline</h2>
              <ol className="cycle-timeline">
                {record.decisions.map((d) => (
                  <li key={d.id}>
                    <strong>
                      {agentName(d.agent)} · {d.action}
                    </strong>
                    <time dateTime={d.timestamp}>
                      {timestamp(d.timestamp)} UTC
                    </time>
                  </li>
                ))}
              </ol>
            </section>
            <section className="cycle-card">
              <h2>Durable jobs</h2>
              {record.jobs.map((j) => (
                <div className="cycle-job" key={j.id}>
                  <strong>
                    {agentName(j.lane)} · attempt {j.attempts}
                  </strong>
                  <span>
                    {j.doneAt
                      ? "Completed"
                      : j.leaseUntil
                        ? "Claimed"
                        : "Queued"}
                  </span>
                  {j.lastError && <code>{j.lastError}</code>}
                </div>
              ))}
            </section>
          </div>
          <section className="cycle-card">
            <h2>Recorded proofs</h2>
            {record.proofs.map((p) => (
              <div className="cycle-job" key={p.id}>
                <strong>
                  {p.kind} · {p.status}
                </strong>
                <span>{p.model ?? "Execution record"}</span>
                {p.requestHash && (
                  <Link href={`/verify?hash=${p.requestHash}`}>
                    Inspect recorded inference →
                  </Link>
                )}
              </div>
            ))}
            {!record.proofs.length && (
              <p className="app-muted">No proof recorded yet.</p>
            )}
          </section>
        </>
      )}
    </AppShell>
  );
}
