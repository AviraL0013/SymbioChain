import type { Metadata } from "next";
import { VerifyPage } from "@/features/verify/verify-page";

export const metadata: Metadata = {
  title: "TEE proofs",
  description:
    "Look up recorded NEAR AI verification evidence with explicit proof scope.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ hash?: string | string[] }>;
}) {
  const query = await searchParams;
  const initialHash =
    typeof query.hash === "string" ? query.hash.slice(0, 128) : "";
  return <VerifyPage key={initialHash} initialHash={initialHash} />;
}
