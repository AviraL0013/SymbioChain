import "server-only";
import { ViewerProof, ViewerSnapshot } from "@symbiochain/shared";
import type { z } from "zod";

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

async function read<T>(path: string, schema: z.ZodType<T>): Promise<T> {
  const { origin, token } = configuration();
  try {
    const response = await fetch(new URL(path, origin), {
      headers: { authorization: `Bearer ${token}`, accept: "application/json" },
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(15_000),
    });
    if (response.status === 404)
      throw new BackendError(
        404,
        "No recorded verified inference matches this hash.",
      );
    if (!response.ok)
      throw new BackendError(
        503,
        "The PAPER backend is temporarily unavailable.",
      );
    const parsed = schema.safeParse(await response.json());
    if (!parsed.success)
      throw new BackendError(
        502,
        "The backend returned an unsupported viewer response.",
      );
    return parsed.data;
  } catch (error) {
    if (error instanceof BackendError) throw error;
    throw new BackendError(
      503,
      "The PAPER backend is temporarily unavailable.",
    );
  }
}

export const getViewerSnapshot = () =>
  read("/api/viewer/snapshot", ViewerSnapshot);
export function getViewerProof(input: string) {
  const hash = input.replace(/^0x/i, "").toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(hash))
    throw new BackendError(400, "Enter a 64-character hexadecimal hash.");
  return read(`/api/viewer/proof?hash=${hash}`, ViewerProof);
}

export async function viewerResponse(operation: () => Promise<unknown>) {
  const headers = {
    "cache-control": "private, no-store",
    "x-content-type-options": "nosniff",
  };
  try {
    return Response.json(await operation(), { headers });
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
