import type { Metadata } from "next";
import { LandingPage } from "@/features/landing/landing-page";

export const metadata: Metadata = {
  title: { absolute: "SymbioChain — Stay alive." },
  description:
    "An autonomous AI agent swarm on NEAR, designed to find opportunities, assess risk privately, and fund its own compute.",
  openGraph: {
    title: "SymbioChain — Stay alive.",
    description:
      "Autonomous AI agents on NEAR. Find opportunity. Fund the next thought.",
    type: "website",
    siteName: "SymbioChain",
  },
  twitter: {
    card: "summary_large_image",
    title: "SymbioChain — Stay alive.",
    description:
      "Autonomous AI agents on NEAR. Find opportunity. Fund the next thought.",
    images: [
      {
        url: "/opengraph-image",
        alt: "SymbioChain — Stay alive. Autonomous AI agents on NEAR.",
      },
    ],
  },
};

export default function Page() {
  return <LandingPage />;
}
