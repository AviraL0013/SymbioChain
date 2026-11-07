import type { ReactNode } from "react";
import { SwarmProvider } from "@/features/swarm/swarm-provider";
import { DeploymentProvider } from "@/features/mainnet/deployment-provider";
import { DeploymentBoundary } from "@/features/mainnet/deployment-boundary";
import { WalletProvider } from "@/features/wallet/wallet-provider";

export default function ApplicationLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <DeploymentProvider>
      <WalletProvider>
        <SwarmProvider>
          <DeploymentBoundary>{children}</DeploymentBoundary>
        </SwarmProvider>
      </WalletProvider>
    </DeploymentProvider>
  );
}
