export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Public release identifiers only. Application configuration is never projected. */
export function GET() {
  const revision = process.env.VERCEL_GIT_COMMIT_SHA;
  const deployment = process.env.VERCEL_DEPLOYMENT_ID;
  const environment = process.env.VERCEL_ENV;
  return Response.json(
    {
      contractVersion: 1,
      frontendRevision:
        revision && /^[a-f0-9]{40}$/.test(revision) ? revision : null,
      deploymentId:
        deployment && /^dpl_[a-zA-Z0-9]+$/.test(deployment) ? deployment : null,
      environment: ["production", "preview", "development"].includes(
        environment ?? "",
      )
        ? environment
        : "unknown",
    },
    { headers: { "cache-control": "no-store" } },
  );
}
