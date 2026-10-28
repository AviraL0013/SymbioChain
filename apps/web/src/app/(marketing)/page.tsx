import type { Metadata } from "next";
import { LandingPage } from "@/features/landing/landing-page";

export const metadata: Metadata = {
  title: { absolute: "SymbioChain — Stay alive." },
  description:
    "An autonomous AI agent swarm on NEAR, designed to find opportunities, assess risk privately, and fund its own compute.",
};

export default function Page() {
  return <LandingPage />;
}
