"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import {
  OperatorAction,
  OperatorState,
  ViewerCycle,
  ViewerCycles,
} from "@symbiochain/shared";
import { AppShell } from "@/features/application/app-shell";
import { useSwarm } from "@/features/swarm/swarm-provider";
import { agentName, formatAtoms, workerStatus } from "@/features/swarm/format";
import "./operator.css";
import { ManualTopups } from "./manual-topups";

type ActionResult = { ok?: boolean; cycleId?: string; error?: string };
type CostDraft = {
  compute: string;
  gas: string;
  hosting: string;
  other: string;
  receipt: string;
  approvedBy: string;
  method: string;
  references: string;
};
const emptyCosts: CostDraft = {
  compute: "",
  gas: "",
  hosting: "",
  other: "0",
  receipt: "",
  approvedBy: "",
  method: "",
  references: "",
};
function toAtoms(value: string, decimals: number) {
  const match = /^(\d{1,60})(?:\.(\d{1,24}))?$/.exec(value.trim());
  if (
    !match ||
    decimals < 0 ||
    decimals > 24 ||
    (match[2]?.length ?? 0) > decimals
  )
    throw Error(
      `Enter an exact amount with at most ${decimals} decimal places.`,
    );
  return (
    BigInt(match[1]!) * 10n ** BigInt(decimals) +
    BigInt((match[2] ?? "").padEnd(decimals, "0") || "0")
  ).toString();
}
async function json<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    cache: "no-store",
    credentials: "same-origin",
    signal: AbortSignal.timeout(55_000),
    ...init,
  });
  const data = await response.json();
  if (!response.ok)
    throw Object.assign(
      Error(
        typeof data.error === "string"
          ? data.error
          : "The operation was not confirmed. Refresh before retrying.",
      ),
      { status: response.status },
    );
  return data as T;
}
export function OperatorPage() {
  const { data, refresh, error: connectionError } = useSwarm();
  const [configured, setConfigured] = useState<boolean | null>(null),
    [authenticated, setAuthenticated] = useState(false),
    [accessCode, setAccessCode] = useState("");
  const [state, setState] = useState<OperatorState | null>(null),
    [pending, setPending] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [cycles, setCycles] = useState<ViewerCycles | null>(null),
    [selectedId, setSelectedId] = useState(""),
    [selected, setSelected] = useState<ViewerCycle | null>(null);
  const [funding, setFunding] = useState("20"),
    [trade, setTrade] = useState("5");
  const [fundAttempt, setFundAttempt] = useState<OperatorAction | null>(null),
    [cycleAttempt, setCycleAttempt] = useState<OperatorAction | null>(null);
  const [policyText, setPolicyText] = useState(""),
    policyDirty = useRef(false);
  const [costs, setCosts] = useState<CostDraft>(emptyCosts),
    [costAcknowledged, setCostAcknowledged] = useState(false);
  const [crashRole, setCrashRole] = useState<"SCOUT" | "BRAIN" | "HAND">(
      "SCOUT",
    ),
    [crashAcknowledged, setCrashAcknowledged] = useState(false);
  const applyState = useCallback((input: unknown) => {
    const result = OperatorState.parse(input);
    setState(result);
    if (!policyDirty.current) {
      const p = result.policy;
      setPolicyText(
        JSON.stringify(
          {
            expectedRevision: p.revision,
            maxTradeAtoms: p.maxTradeAtoms,
            maxDailySpendAtoms: p.maxDailySpendAtoms,
            minReserveAtoms: p.minReserveAtoms,
            minNetProfitAtoms: p.minNetProfitAtoms,
            maxSlippageBps: p.maxSlippageBps,
            allowedAssets: p.allowedAssets,
            allowedChains: p.allowedChains,
            allowedRecipients: p.allowedRecipients,
          },
          null,
          2,
        ),
      );
    }
  }, []);
  const loadState = useCallback(
    async () => applyState(await json("/api/operator/state")),
    [applyState],
  );
  const failed = useCallback((e: unknown) => {
    if (e && typeof e === "object" && "status" in e && e.status === 401) {
      setAuthenticated(false);
      setState(null);
    }
    setError(
      e instanceof Error
        ? e.message
        : "The request was not confirmed. Refresh before retrying.",
    );
  }, []);
  useEffect(() => {
    let active = true;
    void json<{ configured: boolean; authenticated: boolean }>(
      "/api/operator/session",
    )
      .then((s) => {
        if (active) {
          setConfigured(s.configured);
          setAuthenticated(s.authenticated);
        }
      })
      .catch((e) => {
        if (active) failed(e);
      });
    return () => {
      active = false;
    };
  }, [failed]);
  useEffect(() => {
    if (!authenticated) return;
    let active = true;
    void json("/api/operator/state")
      .then((input) => {
        if (active) applyState(input);
      })
      .catch((e) => {
        if (active) failed(e);
      });
    void json("/api/swarm/cycles")
      .then((r) => {
        if (active) setCycles(ViewerCycles.parse(r));
      })
      .catch((e) => {
        if (active) failed(e);
      });
    return () => {
      active = false;
    };
  }, [authenticated, data?.cursor, applyState, failed]);
  useEffect(() => {
    if (!authenticated || !selectedId) return;
    let active = true;
    void json(`/api/swarm/cycles/${selectedId}`)
      .then((r) => {
        if (active) setSelected(ViewerCycle.parse(r));
      })
      .catch((e) => {
        if (active) failed(e);
      });
    return () => {
      active = false;
    };
  }, [authenticated, selectedId, data?.cursor, failed]);
  async function login(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      await json("/api/operator/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ accessCode }),
      });
      setAuthenticated(true);
    } catch (e) {
      failed(e);
    } finally {
      setAccessCode("");
      setPending(false);
    }
  }
  async function logout() {
    setPending(true);
    try {
      await json("/api/operator/session", { method: "DELETE" });
      setAuthenticated(false);
      setState(null);
      setSelected(null);
      setNotice("Operator session closed.");
    } catch (e) {
      failed(e);
    } finally {
      setPending(false);
    }
  }
  async function act(
    action: OperatorAction,
    message = "Operation acknowledged.",
  ) {
    const parsed = OperatorAction.safeParse(action);
    if (!parsed.success) {
      setError(
        "Check the operation fields. Amounts must be exact, nonnegative values.",
      );
      return null;
    }
    setPending(true);
    setError("");
    setNotice("");
    try {
      const result = await json<ActionResult>("/api/operator/action", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      setNotice(message);
      if (result.cycleId) {
        setSelectedId(result.cycleId);
        setSelected(null);
      }
      await loadState();
      refresh();
      return result;
    } catch (e) {
      failed(e);
      return null;
    } finally {
      setPending(false);
    }
  }
  async function fund(event: FormEvent) {
    event.preventDefault();
    try {
      const action = fundAttempt ?? {
        action: "fund" as const,
        amountAtoms: toAtoms(funding, data?.treasury.decimals ?? 6),
        reference: `frontend-fund:${crypto.randomUUID()}`,
      };
      setFundAttempt(action);
      if (
        await act(action, "Simulated funding recorded. No wallet funds moved.")
      )
        setFundAttempt(null);
    } catch (e) {
      failed(e);
    }
  }
  async function create(event: FormEvent) {
    event.preventDefault();
    if (!state) return;
    try {
      const p = state.policy;
      if (
        p.allowedAssets.length < 2 ||
        p.allowedChains.length < 2 ||
        !p.allowedRecipients[0]
      )
        throw Error(
          "This PAPER policy needs two assets, two chains and a recipient.",
        );
      const action = cycleAttempt ?? {
        action: "create-cycle" as const,
        idempotencyKey: `frontend-cycle:${crypto.randomUUID()}`,
        proposal: {
          strategy: "round-trip" as const,
          originChain: p.allowedChains[0]!,
          destinationChain: p.allowedChains[1]!,
          originAsset: p.allowedAssets[0]!,
          intermediateAsset: p.allowedAssets[1]!,
          amountAtoms: toAtoms(trade, data?.treasury.decimals ?? 6),
          recipient: p.allowedRecipients[0]!,
          refundTo: p.allowedRecipients[0]!,
          slippageBps: p.maxSlippageBps,
          expiresAt: new Date(Date.now() + 30 * 60_000).toISOString(),
        },
      };
      setCycleAttempt(action);
      if (
        await act(action, "PAPER cycle created. Follow its durable jobs below.")
      )
        setCycleAttempt(null);
    } catch (e) {
      failed(e);
    }
  }
  async function updatePolicy(event: FormEvent) {
    event.preventDefault();
    try {
      const parsed = OperatorAction.safeParse({
        action: "policy",
        policy: JSON.parse(policyText),
      });
      if (!parsed.success)
        throw Error(
          "Check the policy JSON, atomic amount strings and expected revision.",
        );
      if (await act(parsed.data, "Policy revision updated.")) {
        policyDirty.current = false;
        await loadState();
      }
    } catch (e) {
      failed(e);
    }
  }
  function prefillCosts() {
    if (
      !selected ||
      data?.treasury.asset !== "USDC" ||
      data.treasury.decimals !== 6
    )
      return;
    setCosts({
      compute: formatAtoms(selected.economics.inferenceCostUsdMicros, 6),
      gas: "0.001",
      hosting: "0.001",
      other: "0",
      receipt: "0.0001",
      approvedBy: "paper-operator",
      method:
        "Explicitly simulated USDC valuation, including native NEAR gas, hosting and a receipt budget.",
      references: "PAPER demonstration valuation; no real provider invoice.",
    });
    setCostAcknowledged(false);
  }
  async function approve(event: FormEvent) {
    event.preventDefault();
    if (!selected || !costAcknowledged) return;
    try {
      const e = selected.economics;
      if (!e.settlementDigest || !e.nativeFeeEvidenceDigest)
        throw Error("Wait for reconciliation before approving costs.");
      const decimals = selected.baseDecimals;
      await act(
        {
          action: "approve-cost",
          cycleId: selected.cycle.id,
          acknowledged: true,
          approval: {
            settlementDigest: e.settlementDigest,
            inferenceCostUsdMicros: e.inferenceCostUsdMicros,
            computeBaseAtoms: toAtoms(costs.compute, decimals),
            nativeGasBaseAtoms: toAtoms(costs.gas, decimals),
            hostingBaseAtoms: toAtoms(costs.hosting, decimals),
            otherBaseAtoms: toAtoms(costs.other, decimals),
            receiptBudgetBaseAtoms: toAtoms(costs.receipt, decimals),
            approvedBy: costs.approvedBy,
            sourceEvidence: {
              nativeFeeEvidenceDigest: e.nativeFeeEvidenceDigest,
              valuationMethod: costs.method,
              references: costs.references
                .split("\n")
                .map((x) => x.trim())
                .filter(Boolean),
              includesNearGasAndHosting: true,
            },
          },
        },
        "Settlement-bound simulated cost approval recorded. The worker can finalize the receipt.",
      );
    } catch (e) {
      failed(e);
    }
  }
  const blocked = pending || !!connectionError || !state;
  const canCrash =
    state?.capabilities.crashDemoEnabled &&
    selected?.cycle.id === selectedId &&
    data?.workers.find((w) => w.role === crashRole)?.paused &&
    selected.jobs.some(
      (j) => j.lane === crashRole && !j.doneAt && !j.leaseUntil,
    );
  const canApprove =
    selected?.cycle.id === selectedId &&
    selected?.economics.status === "AWAITING_COST_APPROVAL" &&
    selected.cycle.state === "RECONCILED";
  const unit = data?.treasury.asset ?? "USDC";
  return (
    <AppShell
      title="Operator Control"
      description="Manage the PAPER swarm, inspect recovery and approve recorded costs."
      notice="Administrative actions require operator access. This interface cannot enable LIVE trading."
      action={
        authenticated ? (
          <button
            className="sc-button"
            disabled={pending}
            onClick={() => void logout()}
          >
            Lock session
          </button>
        ) : undefined
      }
    >
      {error && (
        <p className="operator-notice is-error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="operator-notice" role="status">
          {notice}
        </p>
      )}
      {!authenticated ? (
        <section className="operator-card operator-login">
          <h2>Unlock the controls</h2>
          <p>
            A separate operator access code opens a 30-minute session. Backend
            credentials stay on the server.
          </p>
          {configured === false ? (
            <p className="operator-notice">
              Operator access is not configured for this deployment. Ask the
              project owner to complete the deployment setup.
            </p>
          ) : (
            <form onSubmit={login}>
              <label>
                Operator access code
                <input
                  type="password"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  autoComplete="current-password"
                  required
                  disabled={pending || configured === null}
                />
              </label>
              <button
                className="sc-button sc-button-dark"
                disabled={pending || configured === null}
              >
                {pending ? "Connecting…" : "Unlock Operator Control"}
              </button>
            </form>
          )}
        </section>
      ) : (
        <>
          <ManualTopups />
          <section className="operator-card">
            <div className="operator-heading">
              <div>
                <p className="app-muted">SPENDING CONTROL</p>
                <h2>
                  {state?.policy.paused ? "Treasury paused" : "PAPER treasury"}
                </h2>
              </div>
              <button
                type="button"
                className="sc-button sc-button-dark"
                disabled={blocked}
                onClick={() =>
                  void act({
                    action: "treasury",
                    control: state?.policy.paused ? "resume" : "pause",
                  })
                }
              >
                {state?.policy.paused ? "Resume treasury" : "Pause treasury"}
              </button>
            </div>
            <p>
              Pausing prevents new spending. Committed jobs can still reconcile.
              No on-chain owner action is performed here.
            </p>
            <div className="operator-agents">
              {(["SCOUT", "BRAIN", "HAND"] as const).map((role) => {
                const worker = data?.workers.find((w) => w.role === role);
                return (
                  <article key={role}>
                    <strong>{agentName(role)}</strong>
                    <span>{workerStatus(worker, data?.capturedAt)}</span>
                    <button
                      type="button"
                      className="sc-button"
                      disabled={blocked}
                      onClick={() =>
                        void act({
                          action: "agent",
                          role,
                          control: worker?.paused ? "resume" : "pause",
                        })
                      }
                    >
                      {worker?.paused ? "Resume" : "Pause"} {agentName(role)}
                    </button>
                  </article>
                );
              })}
            </div>
          </section>
          <div className="operator-grid">
            <section className="operator-card">
              <h2>Simulated capital</h2>
              <p>Credit the PAPER ledger. This does not deposit real money.</p>
              <form onSubmit={fund}>
                <label>
                  Funding amount ({unit})
                  <input
                    inputMode="decimal"
                    value={funding}
                    onChange={(e) => setFunding(e.target.value)}
                    disabled={blocked || !!fundAttempt}
                    required
                  />
                </label>
                <button className="sc-button sc-button-dark" disabled={blocked}>
                  {fundAttempt
                    ? "Retry same funding request"
                    : "Add simulated funds"}
                </button>
              </form>
            </section>
            <section className="operator-card">
              <h2>Create a PAPER cycle</h2>
              <p>
                Uses the first two assets/chains and first recipient in the
                approved policy. Inspect that policy before starting.
              </p>
              <form onSubmit={create}>
                <label>
                  Cycle amount ({unit})
                  <input
                    inputMode="decimal"
                    value={trade}
                    onChange={(e) => setTrade(e.target.value)}
                    disabled={blocked || !!cycleAttempt}
                    required
                  />
                </label>
                <button
                  className="sc-button sc-button-dark"
                  disabled={blocked || state?.policy.paused}
                >
                  {cycleAttempt
                    ? "Retry same cycle request"
                    : "Create PAPER cycle"}
                </button>
              </form>
            </section>
          </div>
          <section className="operator-card">
            <h2>Inspect a cycle</h2>
            <label>
              Recorded cycle
              <select
                value={selectedId}
                onChange={(e) => {
                  setSelectedId(e.target.value);
                  setSelected(null);
                  setCostAcknowledged(false);
                }}
                disabled={pending}
              >
                <option value="">Select a cycle</option>
                {selectedId &&
                  !cycles?.cycles.some((c) => c.id === selectedId) && (
                    <option value={selectedId}>{selectedId}</option>
                  )}
                {cycles?.cycles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id.slice(0, 8)} · {c.state}
                  </option>
                ))}
              </select>
            </label>
            {selected && selected.cycle.id === selectedId && (
              <>
                <p className="operator-cycle-state">
                  State: <strong>{selected.cycle.state}</strong> ·{" "}
                  <Link href={`/cycles/${selectedId}`}>
                    Full cycle inspection →
                  </Link>
                </p>
                <div className="operator-jobs">
                  {selected.jobs.map((j) => (
                    <span key={j.id}>
                      {agentName(j.lane)} · attempt {j.attempts} ·{" "}
                      {j.doneAt ? "completed" : (j.lastError ?? "pending")}
                    </span>
                  ))}
                </div>
                <a
                  className="sc-text-button"
                  href={`/api/operator/evidence?id=${selectedId}`}
                >
                  Download private evidence
                </a>
              </>
            )}
          </section>
          <div className="operator-grid">
            <section className="operator-card">
              <h2>Recovery demonstration</h2>
              <p>
                Pause a lane and select a cycle with an unclaimed job. Arm one
                crash, then resume that lane. The host restarts the colocated
                worker and the same durable job is reclaimed.
              </p>
              {!state?.capabilities.crashDemoEnabled && (
                <p className="operator-notice">
                  Crash controls are disabled on this backend.
                </p>
              )}
              <label>
                Target lane
                <select
                  value={crashRole}
                  onChange={(e) => {
                    setCrashRole(e.target.value as typeof crashRole);
                    setCrashAcknowledged(false);
                  }}
                  disabled={blocked}
                >
                  <option value="SCOUT">EYE (Scout)</option>
                  <option value="BRAIN">BRAIN</option>
                  <option value="HAND">HAND</option>
                </select>
              </label>
              <label className="operator-checkbox">
                <input
                  type="checkbox"
                  checked={crashAcknowledged}
                  onChange={(e) => setCrashAcknowledged(e.target.checked)}
                  disabled={blocked || !canCrash}
                />
                I understand this restarts the PAPER worker process and
                temporarily interrupts telemetry.
              </label>
              <div className="operator-actions">
                <button
                  type="button"
                  className="sc-button sc-button-dark"
                  disabled={blocked || !canCrash || !crashAcknowledged}
                  onClick={() =>
                    void act(
                      {
                        action: "arm-crash",
                        cycleId: selectedId,
                        role: crashRole,
                        acknowledged: true,
                      },
                      "One crash armed. Resume the selected lane to trigger recovery.",
                    )
                  }
                >
                  Arm one worker crash
                </button>
                <button
                  type="button"
                  className="sc-button"
                  disabled={blocked || !state?.capabilities.crashDemoEnabled}
                  onClick={() =>
                    void act(
                      { action: "cancel-crash" },
                      "Pending crash canceled.",
                    )
                  }
                >
                  Cancel crash
                </button>
              </div>
            </section>
            <section className="operator-card">
              <h2>Cost approval</h2>
              <p>
                Approvals are immutable and bind this exact settlement, native
                fee evidence and inference total. All entered valuations here
                are simulated.
              </p>
              {!canApprove ? (
                <p className="operator-notice">
                  Select a RECONCILED cycle awaiting cost approval.
                </p>
              ) : (
                <form onSubmit={approve}>
                  {data?.treasury.asset === "USDC" &&
                    data.treasury.decimals === 6 && (
                      <button
                        type="button"
                        className="sc-text-button"
                        disabled={blocked}
                        onClick={prefillCosts}
                      >
                        Use explicitly simulated valuation
                      </button>
                    )}
                  {(
                    [
                      ["compute", "Compute"],
                      ["gas", "Native gas"],
                      ["hosting", "Hosting"],
                      ["other", "Other"],
                      ["receipt", "Receipt gas budget"],
                    ] as const
                  ).map(([key, label]) => (
                    <label key={key}>
                      {label} ({unit})
                      <input
                        inputMode="decimal"
                        required
                        value={costs[key]}
                        onChange={(e) =>
                          setCosts({ ...costs, [key]: e.target.value })
                        }
                        disabled={blocked}
                      />
                    </label>
                  ))}
                  <label>
                    Approved by
                    <input
                      value={costs.approvedBy}
                      onChange={(e) =>
                        setCosts({ ...costs, approvedBy: e.target.value })
                      }
                      required
                      disabled={blocked}
                    />
                  </label>
                  <label>
                    Valuation method
                    <textarea
                      value={costs.method}
                      onChange={(e) =>
                        setCosts({ ...costs, method: e.target.value })
                      }
                      required
                      disabled={blocked}
                    />
                  </label>
                  <label>
                    Evidence references (one per line)
                    <textarea
                      value={costs.references}
                      onChange={(e) =>
                        setCosts({ ...costs, references: e.target.value })
                      }
                      required
                      disabled={blocked}
                    />
                  </label>
                  <label className="operator-checkbox">
                    <input
                      type="checkbox"
                      checked={costAcknowledged}
                      onChange={(e) => setCostAcknowledged(e.target.checked)}
                      disabled={blocked}
                    />
                    I reviewed the settlement and complete simulated costs,
                    including NEAR gas, hosting and receipt gas.
                  </label>
                  <button
                    className="sc-button sc-button-dark"
                    disabled={blocked || !costAcknowledged}
                  >
                    Approve bound cost basis
                  </button>
                </form>
              )}
            </section>
          </div>
          <section className="operator-card">
            <h2>Policy revision {state?.policy.revision ?? "—"}</h2>
            <p>
              Amounts below are integer atomic strings. Changes require the
              current revision; concurrent edits are rejected by the backend.
            </p>
            <form onSubmit={updatePolicy}>
              <label>
                Limits and allowlists
                <textarea
                  className="operator-policy"
                  value={policyText}
                  onChange={(e) => {
                    policyDirty.current = true;
                    setPolicyText(e.target.value);
                  }}
                  spellCheck={false}
                  disabled={blocked}
                />
              </label>
              <button className="sc-button sc-button-dark" disabled={blocked}>
                Save policy revision
              </button>
            </form>
          </section>
        </>
      )}
    </AppShell>
  );
}
