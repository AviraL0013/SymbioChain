import type { Metadata } from "next";
import { NftsPage } from "@/features/nfts/nfts-page";

export const metadata: Metadata = {
  title: "Proof of Metabolism",
  description: "SymbioChain frontend preview. Clearly labelled sample data.",
};

export default function Page() {
  return <NftsPage />;
}
