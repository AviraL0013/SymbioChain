"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { ViewerSnapshot, ViewerStatus } from "@symbiochain/shared";

type Swarm = {
  data: ViewerSnapshot | null;
  status: ViewerStatus | null;
  streaming: boolean;
  error: string | null;
  loading: boolean;
  refresh: () => void;
};
const Context = createContext<Swarm | null>(null);

export function SwarmProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ViewerSnapshot | null>(null);
  const [status, setStatus] = useState<ViewerStatus | null>(null);
  const [streaming, setStreaming] = useState(false);
  const cursor = useRef("0");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);
  const refresh = useCallback(() => setRefreshCount((value) => value + 1), []);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const controller = new AbortController();
    async function poll() {
      try {
        const response = await fetch("/api/swarm/snapshot", {
          cache: "no-store",
          signal: AbortSignal.any([
            controller.signal,
            AbortSignal.timeout(20_000),
          ]),
        });
        if (!response.ok)
          throw new Error(
            "The backend connection is unavailable. Retrying automatically.",
          );
        const snapshot = ViewerSnapshot.parse(await response.json());
        void fetch("/api/swarm/status", {
          cache: "no-store",
          signal: AbortSignal.any([
            controller.signal,
            AbortSignal.timeout(20_000),
          ]),
        })
          .then(async (r) => (r.ok ? ViewerStatus.parse(await r.json()) : null))
          .catch(() => null)
          .then((result) => {
            if (active) setStatus(result);
          });
        if (active) {
          cursor.current = snapshot.cursor;
          setData(snapshot);
          setError(null);
        }
      } catch {
        if (active)
          setError(
            "The backend connection is unavailable. Retrying automatically.",
          );
      } finally {
        if (active) {
          setLoading(false);
          timer = setTimeout(poll, document.hidden ? 60_000 : 10_000);
        }
      }
    }
    void poll();
    const onVisible = () => {
      if (!document.hidden) refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      active = false;
      controller.abort();
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refreshCount, refresh]);

  const initialized = !!data;
  useEffect(() => {
    if (!initialized) return;
    const source = new EventSource(`/api/swarm/events?after=${cursor.current}`);
    let timer: ReturnType<typeof setTimeout> | undefined;
    source.addEventListener("ready", () => setStreaming(true));
    source.onerror = () => setStreaming(false);
    source.addEventListener("unavailable", () => setStreaming(false));
    source.addEventListener("change", () => {
      clearTimeout(timer);
      timer = setTimeout(refresh, 500);
    });
    return () => {
      source.close();
      clearTimeout(timer);
      setStreaming(false);
    };
  }, [initialized, refresh]);

  return (
    <Context.Provider
      value={{ data, status, streaming, error, loading, refresh }}
    >
      {children}
    </Context.Provider>
  );
}

export function useSwarm() {
  const value = useContext(Context);
  if (!value) throw new Error("SwarmProvider is required");
  return value;
}

export function ConnectionNotice() {
  const { data, error, loading, refresh, streaming } = useSwarm();
  return (
    <div className="sc-demo-notice" role="status">
      <div className="sc-demo-label">
        <strong>
          {error
            ? data
              ? "Connection lost · stale data"
              : "Disconnected"
            : loading
              ? "Connecting"
              : "PAPER backend"}
        </strong>
        <span className="sc-demo-separator" />
        <span>
          {error ??
            (data
              ? "Recorded simulation. No on-chain funds or NFTs."
              : "Waiting for the backend snapshot.")}
        </span>
        {data && !error && (
          <span>
            {streaming ? "Event stream connected" : "Polling every 10 seconds"}
          </span>
        )}
      </div>
      <button type="button" className="sc-text-button" onClick={refresh}>
        Refresh
      </button>
    </div>
  );
}
