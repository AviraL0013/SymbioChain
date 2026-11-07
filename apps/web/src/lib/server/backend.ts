import "server-only";
import {
  ViewerProof,
  ViewerSnapshot,
  ViewerStatus,
  ViewerCycles,
  ViewerCycle,
  ViewerEvents,
  TestnetReport,
  BusinessStatus,
  FundingSummary,
  OperatingStatus,
  RuntimeStatus,
  MainnetSnapshot,
  MainnetWallet,
  MainnetTransaction,
} from "@symbiochain/shared";
import { z } from "zod";

export class BackendError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

function configuration() {
  const token = process.env.BACKEND_READ_TOKEN;
  let origin: URL;
  try {
    origin = new URL(process.env.BACKEND_URL ?? "");
  } catch {
    throw new BackendError(503, "The dashboard connection is not configured.");
  }
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname);
  if (
    !token ||
    /[\r\n]/.test(token) ||
    origin.username ||
    origin.password ||
    origin.search ||
    origin.hash ||
    origin.pathname !== "/" ||
    (origin.protocol !== "https:" && !(local && origin.protocol === "http:"))
  ) {
    throw new BackendError(503, "The dashboard connection is not configured.");
  }
  return { origin, token };
}

export async function readBackend<T>(
  path: string,
  schema: z.ZodType<T>,
  init: RequestInit = {},
  credential?: string,
): Promise<T> {
  const { origin, token } = configuration();
  try {
    const response = await fetch(new URL(path, origin), {
      ...init,
      headers: {
        ...Object.fromEntries(new Headers(init.headers)),
        authorization: `Bearer ${credential ?? token}`,
        accept: "application/json",
      },
      cache: "no-store",
      redirect: "error",
      signal: init.signal ?? AbortSignal.timeout(15_000),
    });
    if (response.status === 404)
      throw new BackendError(
        404,
        "No recorded verified inference matches this hash.",
      );
    if (!response.ok && init.method === "POST")
      throw new BackendError(
        [400, 403, 409, 429].includes(response.status) ? response.status : 503,
        response.status === 409
          ? "The backend rejected this operation because its state changed. Refresh before retrying."
          : response.status === 400
            ? "The backend rejected the operation fields. Check the values and refresh."
            : "The operation was not confirmed. Refresh before retrying; do not submit a different reference.",
      );
    if (!response.ok)
      throw new BackendError(503, "The backend is temporarily unavailable.");
    if (Number(response.headers.get("content-length") ?? 0) > 2_000_000)
      throw new BackendError(
        502,
        "The backend response exceeds the supported limit.",
      );
    const reader = response.body?.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    if (reader) {
      try {
        while (true) {
          const result = await reader.read();
          if (result.done) break;
          size += result.value.length;
          if (size > 2_000_000) {
            await reader.cancel();
            throw new BackendError(
              502,
              "The backend response exceeds the supported limit.",
            );
          }
          chunks.push(result.value);
        }
      } finally {
        reader.releaseLock();
      }
    }
    const parsed = schema.safeParse(
      JSON.parse(Buffer.concat(chunks).toString("utf8")),
    );
    if (!parsed.success)
      throw new BackendError(
        502,
        "The backend returned an unsupported viewer response.",
      );
    return parsed.data;
  } catch (error) {
    if (error instanceof BackendError) throw error;
    throw new BackendError(503, "The backend is temporarily unavailable.");
  }
}

export const getViewerSnapshot = () =>
  readBackend("/api/viewer/snapshot", ViewerSnapshot);
export const getRuntimeStatus = () =>
  readBackend("/api/runtime", RuntimeStatus);
export const getMainnetSnapshot = () =>
  readBackend("/api/mainnet/snapshot", MainnetSnapshot, {
    signal: AbortSignal.timeout(25_000),
  });
export function getMainnetWallet(accountId: string) {
  if (
    !/^[a-z0-9]+(?:[._-][a-z0-9]+)*$/.test(accountId) ||
    accountId.length < 2 ||
    accountId.length > 64
  )
    throw new BackendError(400, "Enter a valid NEAR account ID.");
  return readBackend(
    `/api/mainnet/wallet?accountId=${encodeURIComponent(accountId)}`,
    MainnetWallet,
  );
}
export function getMainnetTransaction(hash: string) {
  if (!/^[1-9A-HJ-NP-Za-km-z]{43,44}$/.test(hash))
    throw new BackendError(400, "Enter a valid NEAR transaction hash.");
  return readBackend(
    `/api/mainnet/transaction?hash=${hash}`,
    MainnetTransaction,
  );
}
export function getViewerProof(input: string) {
  const hash = input.replace(/^0x/i, "").toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(hash))
    throw new BackendError(400, "Enter a 64-character hexadecimal hash.");
  return readBackend(`/api/viewer/proof?hash=${hash}`, ViewerProof);
}

export const getViewerStatus = () =>
  readBackend("/api/viewer/status", ViewerStatus);
export const getBusinessFunding = () =>
  readBackend("/api/business/funding", FundingSummary);
export const getBusinessStatus = () =>
  readBackend("/api/business/status", BusinessStatus);
export const getOperatingStatus = () =>
  readBackend(
    "/api/operations/status",
    OperatingStatus.refine(
      (value) => value.mode === "PAPER",
      "The public dashboard is PAPER only",
    ),
  );
export const getTestnetReport = () =>
  readBackend("/api/viewer/testnet", TestnetReport);
export function getViewerCycles(cursor?: string) {
  if (cursor && !z.uuid().safeParse(cursor).success)
    throw new BackendError(400, "Invalid cycle cursor.");
  return readBackend(
    `/api/viewer/cycles${cursor ? `?cursor=${cursor}` : ""}`,
    ViewerCycles,
  );
}
export function getViewerCycle(id: string) {
  if (!z.uuid().safeParse(id).success)
    throw new BackendError(400, "Invalid cycle identifier.");
  return readBackend(`/api/viewer/cycles/${id}`, ViewerCycle);
}
export function getViewerEvents(after: string) {
  if (!/^\d{1,19}$/.test(after) || BigInt(after) > 9223372036854775807n)
    throw new BackendError(400, "Invalid event cursor.");
  return readBackend(`/api/viewer/events?after=${after}`, ViewerEvents);
}

export async function viewerResponse(operation: () => Promise<unknown>) {
  const headers = {
    "cache-control": "private, no-store",
    "x-content-type-options": "nosniff",
  };
  try {
    const value = await operation();
    if (value instanceof Response) {
      for (const [key, header] of Object.entries(headers))
        value.headers.set(key, header);
      return value;
    }
    return Response.json(value, { headers });
  } catch (error) {
    const known = error instanceof BackendError;
    return Response.json(
      {
        error: known
          ? error.message
          : "The dashboard connection is unavailable.",
      },
      { status: known ? error.status : 503, headers },
    );
  }
}
