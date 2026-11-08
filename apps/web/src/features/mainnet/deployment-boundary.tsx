"use client";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useDeployment } from "./deployment-provider";
import { MainnetPage } from "./mainnet-page";
export function DeploymentBoundary({ children }: { children: ReactNode }) {
  const { runtime, error, refresh } = useDeployment();
  const path = usePathname();
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
  // The recorded testnet report has its own strict schema and network labels.
  // It never consumes the PAPER treasury feed or enables financial mutations.
  if (runtime.mode === "LIVE" && path !== "/testnet" && path !== "/evidence")
    return <MainnetPage />;
  return children;
}
