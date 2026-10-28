import type { Metadata } from "next";
import { VerifyPage } from "@/features/verify/verify-page";

export const metadata: Metadata = {
  title: "TEE proofs",
  description: "SymbioChain frontend preview. Clearly labelled sample data.",
};

export default function Page() {
  return <VerifyPage />;
}
