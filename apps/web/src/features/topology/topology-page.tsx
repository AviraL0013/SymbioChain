"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { AppShell } from "@/features/application/app-shell";
import { EyeArt, BrainArt, HandArt } from "@/features/landing/artwork";
import { useSwarm } from "@/features/swarm/swarm-provider";
import {
  agentInfo,
  agentName,
  timestamp,
  workerStatus,
} from "@/features/swarm/format";

const artwork = { SCOUT: EyeArt, BRAIN: BrainArt, HAND: HandArt };
const responsibilities = {
  SCOUT: [
    "Record a candidate quote",
    "Check route expiry",
    "Enqueue policy assessment",
  ],
  BRAIN: [
    "Evaluate policy constraints",
    "Record simulated inference and cost",
    "Authorize the next durable job",
  ],
  HAND: [
    "Reserve available treasury",
    "Reconcile simulated settlement",
    "Finalize cost-gated execution receipts",
  ],
};

export function TopologyPage() {
  const { data, error, refresh } = useSwarm();
  const [selected, setSelected] = useState(0);
  const agent = agentInfo[selected]!;
  const Art = artwork[agent.role];
  const worker = data?.workers.find((item) => item.role === agent.role);
  const recent = data?.decisions.find((item) => item.agent === agent.role);
  return (
    <AppShell
      title="Swarm topology"
      description="Three durable worker lanes. One shared treasury."
      notice="Worker state comes from backend heartbeats. The diagram shows the workflow; it does not represent payments between agents."
      action={
        <button className="sc-text-button" onClick={refresh}>
          Refresh telemetry
        </button>
      }
    >
      <div className="topology-layout">
        <section className="topology-map" aria-labelledby="map-heading">
          <div className="app-section-heading">
            <h2 id="map-heading">The agent loop</h2>
            <span className="app-muted">PAPER execution</span>
          </div>
          <div className="topology-diagram">
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
              {[
                "M 220 140 L 450 140",
                "M 550 140 L 780 140",
                "M 833 205 C 833 325 167 325 167 205",
              ].map((path, index) => (
                <path
                  key={path}
                  d={path}
                  className={selected === index ? "is-active" : ""}
                  markerEnd="url(#loop-arrow)"
                />
              ))}
            </svg>
            <div className="topology-nodes">
              {agentInfo.map((item, index) => {
                const NodeArt = artwork[item.role];
                const lane = data?.workers.find(
                  (row) => row.role === item.role,
                );
                return (
                  <button
                    key={item.role}
                    className={`topology-node${selected === index ? " is-selected" : ""}`}
                    aria-pressed={selected === index}
                    onClick={() => setSelected(index)}
                  >
                    <span className={`topology-node-art sc-${item.color}`}>
                      <NodeArt />
                    </span>
                    <strong>{item.name}</strong>
                    <span>
                      {error
                        ? "Connection lost"
                        : workerStatus(lane, data?.capturedAt)}
                    </span>
                  </button>
                );
              })}
            </div>
            <span className="topology-return-label">
              Reconcile settlement and finalize the cycle
            </span>
          </div>
          <div className="topology-playbar">
            <div>
              <i className={error || data?.paused ? "is-empty" : ""} />
              <span>
                {error
                  ? "Connection lost; displayed records may be stale"
                  : data?.paused
                    ? "Treasury policy is paused"
                    : data
                      ? "Latest backend snapshot loaded"
                      : "Waiting for backend telemetry"}
              </span>
            </div>
            <Link className="sc-text-button" href="/dashboard">
              View treasury <ArrowRight size={15} />
            </Link>
          </div>
        </section>
        <aside
          className={`topology-inspector sc-${agent.color}`}
          aria-label="Selected agent details"
        >
          <div className="topology-inspector-top">
            <span>{String(selected + 1).padStart(2, "0")} / 03</span>
            <span>
              {agent.name} · {agent.role}
            </span>
          </div>
          <Art className="topology-inspector-art" />
          <h2>{agent.title.replace("The ", "")}</h2>
          <p>{agent.detail}</p>
          <ul>
            {responsibilities[agent.role].map((item) => (
              <li key={item}>
                <ArrowRight size={14} />
                {item}
              </li>
            ))}
          </ul>
          <div className="topology-balance">
            <span>Last heartbeat · UTC</span>
            <strong>
              {worker?.heartbeat ? timestamp(worker.heartbeat) : "Not recorded"}
            </strong>
          </div>
          <p>
            {recent
              ? `Last action: ${recent.action}`
              : "No recorded decisions for this worker."}
          </p>
        </aside>
      </div>
      <div className="topology-bottom">
        <section className="topology-events">
          <div className="app-section-heading">
            <h2>Recorded agent activity</h2>
            <span className="app-muted">Latest decisions</span>
          </div>
          {data?.decisions.length ? (
            <ol>
              {data.decisions.slice(0, 6).map((item) => (
                <li key={item.id}>
                  <span>
                    {agentName(item.agent)}
                    <ArrowRight size={14} />
                    {item.action}
                  </span>
                  <p>Cycle {item.cycleId.slice(0, 8)}</p>
                  <strong>
                    {timestamp(item.timestamp)}
                    <small> UTC</small>
                  </strong>
                </li>
              ))}
            </ol>
          ) : (
            <div className="app-empty-inline">
              <ArrowRight size={25} />
              <p>
                {data
                  ? "No decisions recorded yet."
                  : "Activity will appear when the backend connects."}
              </p>
            </div>
          )}
        </section>
        <section className="topology-explanation">
          <span className="app-muted">Durable coordination</span>
          <h2>A recorded workflow.</h2>
          <p>
            Workers advance persisted jobs with leases and fencing. Heartbeats
            show availability; they do not prove an agent is earning money or
            running a live AI model.
          </p>
          <a
            href="https://symbiochain-core.onrender.com/dashboard"
            target="_blank"
            rel="noreferrer"
          >
            Authenticated recovery controls <ArrowUpRight size={17} />
          </a>
        </section>
      </div>
    </AppShell>
  );
}
