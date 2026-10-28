"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Pause, Play, RotateCcw } from "lucide-react";
import { AppShell } from "@/features/application/app-shell";
import { EyeArt, BrainArt, HandArt } from "@/features/landing/artwork";
import { agentInfo } from "@/features/dashboard/demo-data";

const artwork = { EYE: EyeArt, BRAIN: BrainArt, HAND: HandArt };
const steps = [
  {
    from: "EYE",
    to: "BRAIN",
    amount: "0.02",
    title: "Request a risk assessment",
    detail:
      "The scout passes a candidate route to BRAIN for policy and cost checks.",
    path: "M 220 140 L 450 140",
  },
  {
    from: "BRAIN",
    to: "HAND",
    amount: "0.01",
    title: "Pass an approved decision",
    detail:
      "BRAIN passes a sample approved route to HAND. No real approval or signature is created.",
    path: "M 550 140 L 780 140",
  },
  {
    from: "HAND",
    to: "EYE",
    amount: "0.04",
    title: "Fund the next cycle",
    detail:
      "Sample proceeds return to the loop, illustrating how another scan could be funded.",
    path: "M 833 205 C 833 325 167 325 167 205",
  },
] as const;
const responsibilities = {
  EYE: [
    "Watch cross-chain order flow",
    "Identify candidate routes",
    "Request a risk assessment",
  ],
  BRAIN: [
    "Check agent policy",
    "Compare fees and compute cost",
    "Assess execution risk in a TEE",
  ],
  HAND: [
    "Prepare a signing request",
    "Coordinate cross-chain execution",
    "Report settlement to the swarm",
  ],
};

export function TopologyPage() {
  const [selected, setSelected] = useState<0 | 1 | 2>(0);
  const [running, setRunning] = useState(false);
  const [cycle, setCycle] = useState(0);
  const [low, setLow] = useState(false);
  const [events, setEvents] = useState<number[]>([]);
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      setCycle((c) => c + 1);
      setEvents((e) => [e.length ? e[0]! + 1 : 0, ...e].slice(0, 6));
    }, 2400);
    return () => clearInterval(timer);
  }, [running]);
  const phase = cycle % 3;
  const step = steps[phase]!;
  const agent = agentInfo[selected];
  const Art = artwork[agent.name];
  const reset = () => {
    setRunning(false);
    setCycle(0);
    setEvents([]);
    setLow(false);
    setSelected(0);
  };
  return (
    <AppShell
      title="Swarm topology"
      description="Three agents. One shared treasury."
      notice="Illustrative agent activity. No transfers are made."
      action={
        <button className="sc-text-button" onClick={reset}>
          <RotateCcw size={15} />
          Reset demo
        </button>
      }
    >
      <div className="topology-layout">
        <section className="topology-map" aria-labelledby="map-heading">
          <div className="app-section-heading">
            <h2 id="map-heading">The agent loop</h2>
            <label className="app-select">
              <span className="sr-only">Funding preview</span>
              <select
                value={low ? "low" : "funded"}
                onChange={(e) => {
                  setLow(e.target.value === "low");
                  setRunning(false);
                }}
              >
                <option value="funded">All agents funded</option>
                <option value="low">BRAIN unfunded</option>
              </select>
            </label>
          </div>
          <div className={`topology-diagram${running ? " is-playing" : ""}`}>
            <svg
              className="topology-connections"
              viewBox="0 0 1000 360"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <marker
                  id="loop-arrow"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 1 1 L 8 5 L 1 9" fill="none" stroke="#8c958b" />
                </marker>
              </defs>
              {steps.map((s, i) => (
                <path
                  key={s.from}
                  d={s.path}
                  className={running && phase === i ? "is-active" : ""}
                  markerEnd="url(#loop-arrow)"
                />
              ))}
              {running && (
                <circle
                  key={cycle}
                  className="topology-payment-dot"
                  r="6"
                  fill="#08bd30"
                >
                  <animateMotion path={step.path} dur="2.4s" fill="freeze" />
                </circle>
              )}
            </svg>
            <div className="topology-nodes">
              {agentInfo.map((a, i) => {
                const NodeArt = artwork[a.name];
                return (
                  <button
                    key={a.name}
                    className={`topology-node${selected === i ? " is-selected" : ""}${low && i === 1 ? " is-unfunded" : ""}`}
                    aria-pressed={selected === i}
                    onClick={() => setSelected(i as 0 | 1 | 2)}
                  >
                    <span className={`topology-node-art sc-${a.color}`}>
                      <NodeArt />
                    </span>
                    <strong>{a.name}</strong>
                    <span>
                      {low && i === 1 ? "0.00" : a.fundedBalance} NEAR
                    </span>
                  </button>
                );
              })}
            </div>
            <span className="topology-return-label">
              Reinvest in the next cycle
            </span>
          </div>
          <div className="topology-playbar">
            <div>
              <i className={low ? "is-empty" : ""} />
              <span>
                {low
                  ? "BRAIN needs funding"
                  : running
                    ? `${step.from} → ${step.to} · ${step.amount} NEAR (sample)`
                    : "Ready to preview the loop"}
              </span>
            </div>
            <button
              className="sc-button sc-button-dark"
              disabled={low}
              onClick={() => setRunning((r) => !r)}
            >
              {running ? <Pause size={15} /> : <Play size={15} />}{" "}
              {running ? "Pause" : "Play demo"}
            </button>
          </div>
        </section>
        <aside
          className={`topology-inspector sc-${agent.color}`}
          aria-label="Selected agent details"
        >
          <div className="topology-inspector-top">
            <span>{String(selected + 1).padStart(2, "0")} / 03</span>
            <span>{agent.name}</span>
          </div>
          <Art className="topology-inspector-art" />
          <h2>{agent.role.replace("The ", "")}</h2>
          <p>{agent.detail}</p>
          <ul>
            {responsibilities[agent.name].map((r) => (
              <li key={r}>
                <ArrowRight size={14} />
                {r}
              </li>
            ))}
          </ul>
          <div className="topology-balance">
            <span>Sample balance</span>
            <strong>
              {low && selected === 1 ? "0.00" : agent.fundedBalance}
              <small> NEAR</small>
            </strong>
          </div>
        </aside>
      </div>
      <div className="topology-bottom">
        <section>
          <div className="app-section-heading">
            <h2>Transfer activity</h2>
            <span className="app-muted">Sample transfers</span>
          </div>
          {events.length ? (
            <ol className="topology-events">
              {events.map((n) => {
                const s = steps[n % 3]!;
                return (
                  <li key={n}>
                    <span>
                      {s.from}
                      <ArrowRight size={14} />
                      {s.to}
                    </span>
                    <p>{s.title}</p>
                    <strong>
                      {s.amount}
                      <small> NEAR</small>
                    </strong>
                  </li>
                );
              })}
            </ol>
          ) : (
            <div className="app-empty-inline">
              <ArrowRight size={25} />
              <p>Play the demo to follow a transfer through the loop.</p>
            </div>
          )}
        </section>
        <section className="topology-explanation">
          <span className="app-muted">
            {running ? `Step ${phase + 1} of 3` : "How the loop works"}
          </span>
          <h2>{step.title}</h2>
          <p>{step.detail}</p>
          <Link href="/dashboard">
            View treasury <ArrowUpRight size={17} />
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
