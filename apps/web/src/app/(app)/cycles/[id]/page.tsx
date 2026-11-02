import { CyclePage } from "@/features/cycles/cycles-page";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <CyclePage id={(await params).id} />;
}
