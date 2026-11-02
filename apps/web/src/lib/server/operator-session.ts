import "server-only";
import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { BackendError } from "./backend";
const lifetime = 30 * 60;
const cookieName = () =>
  process.env.NODE_ENV === "production"
    ? "__Host-symbio-operator"
    : "symbio-operator";
function config() {
  const gate = process.env.OPERATOR_ACCESS_TOKEN,
    admin = process.env.BACKEND_ADMIN_TOKEN;
  if (
    !gate ||
    gate.length < 32 ||
    !admin ||
    admin.length < 32 ||
    gate === admin ||
    gate === process.env.BACKEND_READ_TOKEN ||
    admin === process.env.BACKEND_READ_TOKEN
  )
    throw new BackendError(503, "Operator access is not configured.");
  return { gate, admin };
}
const equal = (a: string, b: string) =>
  timingSafeEqual(
    createHash("sha256").update(a).digest(),
    createHash("sha256").update(b).digest(),
  );
const sign = (value: string, secret: string) =>
  createHmac("sha256", secret)
    .update(`symbio-operator-v1:${value}`)
    .digest("base64url");
export function requireSameOrigin(request: Request) {
  // Next's standalone/dev URL can use an internal hostname. Compare the
  // browser Origin with the actual HTTP authority, never a forwarded host.
  const target = new URL(request.url);
  const host = request.headers.get("host");
  if (host) {
    let authority: URL;
    try {
      authority = new URL(`${target.protocol}//${host}`);
    } catch {
      throw new BackendError(403, "Invalid request authority.");
    }
    if (
      authority.username ||
      authority.password ||
      authority.pathname !== "/" ||
      authority.search ||
      authority.hash
    )
      throw new BackendError(403, "Invalid request authority.");
    target.host = authority.host;
  }
  const origin = request.headers.get("origin"),
    site = request.headers.get("sec-fetch-site");
  if (
    origin !== target.origin ||
    (site && site !== "same-origin" && site !== "none")
  )
    throw new BackendError(
      403,
      "This operation requires a same-origin request.",
    );
}
export async function operatorBody(request: Request) {
  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/json")
  )
    throw new BackendError(415, "JSON is required.");
  if (Number(request.headers.get("content-length") ?? 0) > 16384)
    throw new BackendError(413, "Request exceeds the supported limit.");
  const reader = request.body?.getReader();
  if (!reader) throw new BackendError(400, "A request body is required.");
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const result = await reader.read();
      if (result.done) break;
      length += result.value.length;
      if (length > 16384) {
        await reader.cancel();
        throw new BackendError(413, "Request exceeds the supported limit.");
      }
      chunks.push(result.value);
    }
    try {
      return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
    } catch {
      throw new BackendError(400, "Invalid JSON.");
    }
  } finally {
    reader.releaseLock();
  }
}
export function issueOperatorSession(
  access: string,
  now = Math.floor(Date.now() / 1000),
) {
  const { gate } = config();
  if (access.length > 256 || !equal(access, gate))
    throw new BackendError(401, "Invalid operator access code.");
  const payload = Buffer.from(
    JSON.stringify({
      expires: now + lifetime,
      nonce: randomBytes(16).toString("hex"),
    }),
  ).toString("base64url");
  return `${payload}.${sign(payload, gate)}`;
}
export function requireOperator(
  request: Request,
  now = Math.floor(Date.now() / 1000),
) {
  const { gate, admin } = config();
  const entries = (request.headers.get("cookie") ?? "")
    .split(";")
    .map((p) => p.trim())
    .filter((p) => p.startsWith(cookieName() + "="));
  if (entries.length !== 1)
    throw new BackendError(401, "Unlock Operator Control to continue.");
  const value = entries[0]!.slice(cookieName().length + 1);
  const parts = value.split(".");
  if (
    value.length > 512 ||
    parts.length !== 2 ||
    !equal(parts[1]!, sign(parts[0]!, gate))
  )
    throw new BackendError(401, "Operator session is invalid or expired.");
  try {
    const payload = JSON.parse(Buffer.from(parts[0]!, "base64url").toString());
    if (
      !Number.isInteger(payload.expires) ||
      payload.expires <= now ||
      payload.expires > now + lifetime ||
      !/^[a-f0-9]{32}$/.test(payload.nonce)
    )
      throw Error();
  } catch {
    throw new BackendError(401, "Operator session is invalid or expired.");
  }
  return admin;
}
export function operatorCookie(value: string, clear = false) {
  return `${cookieName()}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${clear ? 0 : lifetime}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}
export function sessionStatus(request: Request) {
  try {
    config();
  } catch {
    return { configured: false, authenticated: false };
  }
  try {
    requireOperator(request);
    return { configured: true, authenticated: true };
  } catch {
    return { configured: true, authenticated: false };
  }
}
