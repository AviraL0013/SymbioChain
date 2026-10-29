import type { ReactNode } from "react";
import { SwarmProvider } from "@/features/swarm/swarm-provider";

export default function ApplicationLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <SwarmProvider>{children}</SwarmProvider>;
}
