"use client";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useDeployment } from "./deployment-provider";
import { MainnetPage } from "./mainnet-page";
import { RibbonMark } from "@/features/landing/brand";
import "@/features/application/workspace.css";
export function DeploymentBoundary({ children }: { children: ReactNode }) {
  const { runtime, error, refresh } = useDeployment();
  const path = usePathname();
  if (!runtime)
    return (
      <div className="mission-control">
        <main className="sc-connection-screen">
          <div className="sc-connection-card">
            <RibbonMark />
            <span className="sc-connection-brand">SymbioChain</span>
            <h1>
              {error ? "Connection unavailable" : "Opening your workspace"}
            </h1>
            <p role="status">
              {error ?? "Checking the deployed network and execution controls…"}
            </p>
            <button type="button" className="sc-button" onClick={refresh}>
              Retry connection
            </button>
          </div>
        </main>
      </div>
    );
  // The recorded testnet report has its own strict schema and network labels.
  // It never consumes the PAPER treasury feed or enables financial mutations.
  if (runtime.mode === "LIVE" && path !== "/testnet" && path !== "/evidence")
    return <MainnetPage />;
  return children;
}
