"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { RuntimeStatus, MainnetSnapshot } from "@symbiochain/shared";
type Runtime = ReturnType<typeof RuntimeStatus.parse>;
type Snapshot = ReturnType<typeof MainnetSnapshot.parse>;
const Context = createContext<{
  runtime: Runtime | null;
  mainnet: Snapshot | null;
  error: string | null;
  loading: boolean;
  refresh: () => void;
} | null>(null);
export function DeploymentProvider({ children }: { children: ReactNode }) {
  const [runtime, setRuntime] = useState<Runtime | null>(null),
    [mainnet, setMainnet] = useState<Snapshot | null>(null),
    [error, setError] = useState<string | null>(null),
    [loading, setLoading] = useState(true),
    [generation, setGeneration] = useState(0);
  const refresh = useCallback(() => setGeneration((g) => g + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    async function poll() {
      try {
        const options = {
          cache: "no-store" as const,
          signal: AbortSignal.any([
            controller.signal,
            AbortSignal.timeout(28_000),
          ]),
        };
        const response = await fetch("/api/swarm/runtime", options);
        if (!response.ok) throw Error();
        const next = RuntimeStatus.parse(await response.json());
        if (controller.signal.aborted) return;
        setRuntime(next);
        if (next.mode === "LIVE") {
          const r = await fetch("/api/swarm/mainnet", options);
          if (!r.ok) throw Error();
          const snapshot = MainnetSnapshot.parse(await r.json());
          if (!controller.signal.aborted) setMainnet(snapshot);
        } else setMainnet(null);
        if (!controller.signal.aborted) setError(null);
      } catch {
        if (!controller.signal.aborted)
          setError(
            "Mainnet connection unavailable. Retained observations are stale; no execution is inferred.",
          );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          timer = setTimeout(poll, document.hidden ? 60_000 : 20_000);
        }
      }
    }
    void poll();
    const visible = () => {
      if (!document.hidden) refresh();
    };
    document.addEventListener("visibilitychange", visible);
    return () => {
      controller.abort();
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [generation, refresh]);
  return (
    <Context.Provider value={{ runtime, mainnet, error, loading, refresh }}>
      {children}
    </Context.Provider>
  );
}
export function useDeployment() {
  const context = useContext(Context);
  if (!context) throw Error("DeploymentProvider required");
  return context;
}
