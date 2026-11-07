"use client";
import type { ReactNode } from "react";
import { useDeployment } from "./deployment-provider";
import { MainnetPage } from "./mainnet-page";
export function DeploymentBoundary({ children }: { children: ReactNode }) {
  const { runtime, error, refresh } = useDeployment();
  if (!runtime)
    return (
      <main className="sc-main">
        <h1>Connecting to SymbioChain</h1>
        <p role="status">
          {error ?? "Checking the deployed network and execution controls…"}
        </p>
        <button className="sc-button" onClick={refresh}>
          Retry connection
        </button>
      </main>
    );
  if (runtime.mode === "LIVE") return <MainnetPage />;
  return children;
}
