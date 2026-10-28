import type { Metadata } from "next";
import { DashboardPage } from "@/features/dashboard/dashboard-page";

export const metadata: Metadata = {
  title: "Mission Control",
  description:
    "The SymbioChain swarm at a glance. Frontend preview with clearly labelled sample data.",
};

export default function Page() {
  return <DashboardPage />;
}
