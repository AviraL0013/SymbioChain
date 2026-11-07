import { z } from "zod";
import { ManualTopupReport } from "./operating-contract";
const atoms = z.string().regex(/^(0|[1-9]\d{0,76})$/),
  positive = atoms.refine((v) => BigInt(v) > 0n),
  id = z.uuid(),
  hash = z.string().regex(/^[a-f0-9]{64}$/);
export const OperatorCapabilities = z
  .object({
    mode: z.enum(["PAPER", "LIVE", "REPLAY"]),
    admin: z.boolean(),
    crashDemoEnabled: z.boolean(),
    requestedShareBps: z.number().int().min(0).max(10000),
    computePurchaseImplemented: z.literal(false),
  })
  .strict();
export const OperatorPolicy = z
  .object({
    mode: z.literal("PAPER"),
    paused: z.boolean(),
    revision: z.number().int().positive(),
    maxTradeAtoms: atoms,
    maxDailySpendAtoms: atoms,
    minReserveAtoms: atoms,
    minNetProfitAtoms: atoms,
    maxSlippageBps: z.number().int().min(0).max(1000),
    allowedAssets: z.array(z.string().max(200)).max(16),
    allowedChains: z.array(z.string().max(80)).max(8),
    allowedRecipients: z.array(z.string().max(128)).max(16),
    updatedAt: z.iso.datetime(),
  })
  .strict();
export const OperatorState = z
  .object({ capabilities: OperatorCapabilities, policy: OperatorPolicy })
  .strict();
export type OperatorState = z.infer<typeof OperatorState>;
const role = z.enum(["SCOUT", "BRAIN", "HAND"]),
  control = z.enum(["pause", "resume"]);
const proposal = z
  .object({
    strategy: z.literal("round-trip"),
    originChain: z.string().min(3).max(80),
    destinationChain: z.string().min(3).max(80),
    originAsset: z.string().min(1).max(200),
    intermediateAsset: z.string().min(1).max(200),
    amountAtoms: positive,
    recipient: z.string().min(2).max(128),
    refundTo: z.string().min(2).max(128),
    slippageBps: z.number().int().min(0).max(1000),
    expiresAt: z.iso.datetime(),
  })
  .strict();
const approval = z
  .object({
    settlementDigest: hash,
    inferenceCostUsdMicros: atoms,
    computeBaseAtoms: atoms,
    nativeGasBaseAtoms: atoms,
    hostingBaseAtoms: atoms,
    otherBaseAtoms: atoms,
    receiptBudgetBaseAtoms: positive,
    approvedBy: z.string().min(2).max(80),
    sourceEvidence: z
      .object({
        nativeFeeEvidenceDigest: hash,
        valuationMethod: z.string().min(10).max(4000),
        references: z.array(z.string().min(1).max(500)).min(1).max(20),
        includesNearGasAndHosting: z.literal(true),
      })
      .strict(),
  })
  .strict();
const policy = z
  .object({
    expectedRevision: z.number().int().positive(),
    maxTradeAtoms: positive.optional(),
    maxDailySpendAtoms: positive.optional(),
    minReserveAtoms: atoms.optional(),
    minNetProfitAtoms: atoms.optional(),
    maxSlippageBps: z.number().int().min(0).max(1000).optional(),
    allowedAssets: z
      .array(z.string().min(1).max(200))
      .min(1)
      .max(16)
      .optional(),
    allowedChains: z.array(z.string().min(1).max(80)).min(1).max(8).optional(),
    allowedRecipients: z
      .array(z.string().min(2).max(128))
      .min(1)
      .max(16)
      .optional(),
  })
  .strict();
export const OperatorAction = z.discriminatedUnion("action", [
  z
    .object({
      action: z.literal("report-compute-topup"),
      report: ManualTopupReport,
      acknowledged: z.literal(true),
    })
    .strict(),
  z.object({ action: z.literal("treasury"), control }).strict(),
  z.object({ action: z.literal("agent"), role, control }).strict(),
  z
    .object({
      action: z.literal("fund"),
      amountAtoms: positive,
      reference: z.string().min(8).max(128),
    })
    .strict(),
  z
    .object({
      action: z.literal("create-cycle"),
      proposal,
      idempotencyKey: z.string().min(8).max(128),
    })
    .strict(),
  z.object({ action: z.literal("policy"), policy }).strict(),
  z
    .object({
      action: z.literal("approve-cost"),
      cycleId: id,
      approval,
      acknowledged: z.literal(true),
    })
    .strict(),
  z
    .object({
      action: z.literal("arm-crash"),
      cycleId: id,
      role,
      acknowledged: z.literal(true),
    })
    .strict(),
  z.object({ action: z.literal("cancel-crash") }).strict(),
]);
export type OperatorAction = z.infer<typeof OperatorAction>;
