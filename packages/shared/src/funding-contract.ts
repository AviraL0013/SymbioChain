import { z } from "zod";
const nearHash = z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{43,44}$/);
export const FundingSummary = z
  .object({
    contractVersion: z.literal(1),
    mode: z.literal("PAPER"),
    nftFundingImplemented: z.literal(true),
    nftFundingEnabled: z.literal(false),
    computePurchaseImplemented: z.literal(false),
    computePurchaseBlocker: z.literal("NO_PUBLIC_NEAR_AI_PURCHASE_PROTOCOL"),
    completedDistributions: z.literal(0),
    spentInputAtoms: z.literal("0"),
    distributedNearYocto: z.literal("0"),
    allocatedNearYocto: z.literal("0"),
    operations: z
      .array(
        z
          .object({
            reference: z.string(),
            reservationReference: z.string(),
            state: z.string(),
            updatedAt: z.iso.datetime(),
            error: z.string().nullable(),
            withdrawalTxHash: nearHash.nullable(),
            distributionTxHash: nearHash.nullable(),
          })
          .strict(),
      )
      .max(0),
  })
  .strict();
