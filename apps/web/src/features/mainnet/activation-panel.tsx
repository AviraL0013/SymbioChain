"use client";
import { useEffect, useState } from "react";
import { MainnetActivation } from "@symbiochain/shared";
import { formatAtoms, timestamp } from "@/features/swarm/format";
import { formatNear } from "./format";
import "@/features/cycles/cycles.css";
export function ActivationPanel() {
  const [data, setData] = useState<MainnetActivation | null>(null),
    [error, setError] = useState(false),
    [generation, setGeneration] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let pending = false;
    const refresh = async () => {
      if (pending) return;
      pending = true;
      try {
        const r = await fetch("/api/swarm/mainnet/activation", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!r.ok) throw Error();
        const next = MainnetActivation.parse(await r.json());
        if (!controller.signal.aborted) {
          setData(next);
          setError(false);
        }
      } catch {
        if (!controller.signal.aborted) setError(true);
      } finally {
        pending = false;
      }
    };
    void refresh();
    const poll = setInterval(() => void refresh(), 20000);
    return () => {
      controller.abort();
      clearInterval(poll);
    };
  }, [generation]);
  return (
    <section className="cycle-card" aria-labelledby="bounded-activation">
      <h2 id="bounded-activation">Bounded mainnet activation</h2>
      <p>
        Owner permissions, contract limits and configured worker monitors are
        separate from approval to execute AI or trade.
      </p>
      {error && (
        <p role="alert" className="app-field-error">
          Activation status unavailable.{" "}
          {data
            ? "Retained observations are stale."
            : "No activation is inferred."}
        </p>
      )}
      {!data && !error && <p role="status">Reading mainnet activation…</p>}
      {data && (
        <>
          <p>
            Observed {timestamp(data.capturedAt)}
            {error ? " · STALE" : ""}.
          </p>
          <dl className="cycle-metrics evidence-metrics">
            <div>
              <dt>Owner activation</dt>
              <dd>{data.ownerActivation}</dd>
            </div>
            <div>
              <dt>On-chain worker permissions</dt>
              <dd>{data.enabledWorkerCount} / 3 enabled</dd>
            </div>
            <div>
              <dt>Trade authorization limit</dt>
              <dd>{formatAtoms(data.limits.onChainMaxTradeAtoms, 6)} USDC</dd>
            </div>
            <div>
              <dt>Native treasury reserve</dt>
              <dd>{formatNear(data.limits.nativeReserveYocto, 3)} NEAR</dd>
            </div>
            <div>
              <dt>MPC signing deposit limit</dt>
              <dd>{data.limits.mpcSigningDepositLimitYocto} yoctoNEAR</dd>
            </div>
            <div>
              <dt>Daily authorization limit</dt>
              <dd>{formatAtoms(data.limits.onChainMaxDailyAtoms, 6)} USDC</dd>
            </div>
            <div>
              <dt>Matches configured limits</dt>
              <dd>
                {data.limits.matches ? "YES" : "AWAITING OWNER ACTIVATION"}
              </dd>
            </div>
            <div>
              <dt>Treasury signing keys configured</dt>
              <dd>{data.configuration.treasurySigningKeys} / 3</dd>
            </div>
            <div>
              <dt>Separate Intents keys configured</dt>
              <dd>{data.configuration.dedicatedIntentsKeys} / 2</dd>
            </div>
            <div>
              <dt>Brain / Hand Intents registration</dt>
              <dd>
                {data.intentsRegistration.brain} /{" "}
                {data.intentsRegistration.hand}
              </dd>
            </div>
            <div>
              <dt>EVM RPC configured</dt>
              <dd>{data.configuration.evmRpcConfigured ? "YES" : "NO"}</dd>
            </div>
            <div>
              <dt>NFT receiver</dt>
              <dd>{data.configuration.nftReceiver || "UNSET"}</dd>
            </div>
            <div>
              <dt>Worker monitors</dt>
              <dd>
                {data.monitorOnlyWorkers
                  ? `${data.monitors.filter((m) => m.fresh).length} / 3 fresh heartbeats · MONITOR ONLY`
                  : "OFF"}
              </dd>
            </div>
            <div>
              <dt>Automated execution engine</dt>
              <dd>{data.executionEnabled ? "ENABLED" : "DISARMED"}</dd>
            </div>
          </dl>
          <p>
            <strong>{data.tee.message}</strong>
          </p>
          <p>
            The limits above cover authorized cross-chain transfers in USDC
            units. They are not a universal NEAR spending cap and do not
            constrain every owner or Intents action. Configuration counts show
            presence; Intents registration is checked on-chain.
          </p>
          <p>
            Monitor heartbeats prove monitoring only. Paid AI, automated
            trading, external revenue and automatic credit purchasing are not
            demonstrated by activation.
          </p>
          <p>
            Confirmed owner-activation receipts:{" "}
            {data.proof.transactions.length} / {data.proof.requiredTransactions}{" "}
            · {data.proof.status}.
          </p>
          <p>
            Verified network fees: {formatNear(data.proof.totalFeeYocto, 6)}{" "}
            NEAR. New storage collateral:{" "}
            {formatNear(data.proof.newStorageYocto, 6)} NEAR. Owner gas
            allocation from existing treasury funds:{" "}
            {formatNear(data.proof.ownerGasReserveReallocatedYocto, 3)} NEAR. No
            treasury top-up or earned revenue is recorded by these calls.
          </p>
          {data.proof.transactions.map((t) => (
            <p key={t.hash}>
              <a href={t.url} target="_blank" rel="noopener noreferrer">
                {t.step} mainnet receipt ↗
              </a>
            </p>
          ))}
        </>
      )}
      <button
        type="button"
        className="sc-text-button"
        onClick={() => setGeneration((n) => n + 1)}
      >
        Refresh activation status
      </button>
    </section>
  );
}
