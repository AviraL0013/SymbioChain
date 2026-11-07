import type { Metadata } from "next";
import { DashboardPage } from "@/features/dashboard/dashboard-page";

export const metadata: Metadata = {
  title: "Mission Control",
  description:
    "Real NEAR mainnet balances, deployment evidence and execution controls.",
};

export default function Page() {
  return <DashboardPage />;
}
