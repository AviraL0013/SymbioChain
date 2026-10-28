import type { DecisionLog, SwarmHealth } from "@symbiochain/shared";
import {
  DEMO_EPOCH,
  demoDecisions,
  demoEvents,
  type Scenario,
} from "./demo-data";

export interface DemoState {
  scenario: Scenario;
  elapsed: number;
  sequence: number;
  paused: boolean;
  recoveryUntil: number | null;
  decisions: DecisionLog[];
  notice: { id: number; text: string } | null;
}
export type DemoAction =
  | { type: "tick" }
  | { type: "scenario"; scenario: Scenario }
  | { type: "pause" }
  | { type: "event" }
  | { type: "recover" }
  | { type: "dismiss" }
  | { type: "reset" };
export const initialDemoState: DemoState = {
  scenario: "funded",
  elapsed: 0,
  sequence: 0,
  paused: false,
  recoveryUntil: null,
  decisions: demoDecisions,
  notice: null,
};

function addEvent(state: DemoState): DemoState {
  const event = demoEvents[state.sequence % demoEvents.length]!;
  return {
    ...state,
    sequence: state.sequence + 1,
    decisions: [
      {
        ...event,
        id: `demo-event-${state.sequence}`,
        timestamp: DEMO_EPOCH + state.elapsed * 1000,
      },
      ...state.decisions,
    ].slice(0, 30),
  };
}

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case "tick": {
      const next = { ...state, elapsed: state.elapsed + 1 };
      if (state.recoveryUntil !== null && next.elapsed >= state.recoveryUntil) {
        return {
          ...next,
          recoveryUntil: null,
          sequence: next.sequence + 1,
          notice: {
            id: next.elapsed,
            text: "Recovery demo complete. EYE is back online.",
          },
          decisions: [
            {
              id: `demo-recovered-${next.sequence}`,
              timestamp: DEMO_EPOCH + next.elapsed * 1000,
              agent: "SYSTEM" as const,
              action: "The scout is back.",
              details:
                "Simulated recovery finished. EYE resumes watching for candidate opportunities.",
            },
            ...next.decisions,
          ].slice(0, 30),
        };
      }
      if (
        !next.paused &&
        next.scenario !== "offline" &&
        next.scenario !== "exhausted" &&
        next.recoveryUntil === null &&
        next.elapsed % 12 === 0
      )
        return addEvent(next);
      return next;
    }
    case "scenario":
      return {
        ...state,
        scenario: action.scenario,
        recoveryUntil: null,
        paused: false,
        decisions: action.scenario === "offline" ? [] : [...demoDecisions],
        notice: null,
      };
    case "pause":
      return { ...state, paused: !state.paused };
    case "event":
      return state.scenario === "offline" ||
        state.scenario === "exhausted" ||
        state.paused ||
        state.recoveryUntil !== null
        ? state
        : addEvent(state);
    case "recover":
      if (
        state.scenario === "offline" ||
        state.scenario === "exhausted" ||
        state.recoveryUntil !== null
      )
        return state;
      return {
        ...state,
        recoveryUntil: state.elapsed + 10,
        notice: {
          id: state.elapsed,
          text: "Demo scout paused. Autonomous recovery is being simulated.",
        },
        decisions: [
          {
            id: `demo-pause-${state.sequence}`,
            timestamp: DEMO_EPOCH + state.elapsed * 1000,
            agent: "SYSTEM" as const,
            action: "Scout paused. Recovery started.",
            details:
              "Preview simulation: EYE pauses for ten seconds while the other agents remain available. No backend agent is stopped.",
          },
          ...state.decisions,
        ].slice(0, 30),
      };
    case "dismiss":
      return { ...state, notice: null };
    case "reset":
      return initialDemoState;
  }
}

export function previewHealth(
  scenario: Scenario,
  elapsed: number,
): SwarmHealth | null {
  if (scenario === "offline") return null;
  const balance =
    scenario === "funded" ? "24.5" : scenario === "low" ? "1.8" : "0";
  return {
    nearBalance: balance,
    computeCostPerHour: "0.5",
    survivalHours: Number(balance) / 0.5,
    status:
      scenario === "funded"
        ? "ALIVE"
        : scenario === "low"
          ? "STARVING"
          : "DEAD",
    lastPulseTimestamp: DEMO_EPOCH + Math.floor(elapsed / 3) * 3000,
  };
}
