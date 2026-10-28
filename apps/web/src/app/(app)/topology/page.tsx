import type { Metadata } from "next";
import { TopologyPage } from "@/features/topology/topology-page";

export const metadata: Metadata = {
  title: "Swarm topology",
  description: "SymbioChain frontend preview. Clearly labelled sample data.",
};

export default function Page() {
  return <TopologyPage />;
}
