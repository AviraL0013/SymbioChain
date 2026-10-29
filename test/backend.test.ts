import { afterEach, beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { mock } from "node:test";
import {
  BackendError,
  getViewerSnapshot,
  getViewerProof,
  viewerResponse,
} from "../apps/web/src/lib/server/backend";

const original = {
  url: process.env.BACKEND_URL,
  token: process.env.BACKEND_READ_TOKEN,
};
beforeEach(() => {
  process.env.BACKEND_URL = "https://backend.example";
  process.env.BACKEND_READ_TOKEN = "server-only-test-token";
});
afterEach(() => {
  mock.restoreAll();
  for (const [name, value] of [
    ["BACKEND_URL", original.url],
    ["BACKEND_READ_TOKEN", original.token],
  ]) {
    if (value === undefined) delete process.env[name!];
    else process.env[name!] = value;
  }
});

test("uses only the configured origin with server authorization and no caching or redirects", async () => {
  const transport = mock.method(
    globalThis,
    "fetch",
    async (_url: URL, _options: RequestInit) => new Response("{}"),
  );
  await assert.rejects(
    getViewerSnapshot(),
    (error: unknown) => error instanceof BackendError && error.status === 502,
  );
  const [url, options] = transport.mock.calls[0]!.arguments;
  assert.equal(String(url), "https://backend.example/api/viewer/snapshot");
  assert.equal(options.cache, "no-store");
  assert.equal(options.redirect, "error");
  assert.equal(
    (options.headers as Record<string, string>).authorization,
    "Bearer server-only-test-token",
  );
});

test("rejects unexpected fields and LIVE responses at the server boundary", async () => {
  mock.method(globalThis, "fetch", async () =>
    Response.json({ mode: "LIVE", privateKey: "sensitive" }),
  );
  const response = await viewerResponse(getViewerSnapshot);
  assert.equal(response.status, 502);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.doesNotMatch(
    await response.text(),
    /sensitive|privateKey|server-only-test-token/,
  );
});

test("does not relay upstream errors or tokens", async () => {
  mock.method(
    globalThis,
    "fetch",
    async () => new Response("sensitive provider error", { status: 401 }),
  );
  const response = await viewerResponse(getViewerSnapshot);
  assert.equal(response.status, 503);
  assert.doesNotMatch(
    await response.text(),
    /sensitive|server-only-test-token/,
  );
});

test("refuses missing credentials, remote HTTP, and credentials embedded in the origin", async () => {
  const transport = mock.method(globalThis, "fetch", async () =>
    Response.json({}),
  );
  for (const url of [
    "http://backend.example",
    "https://user:secret@backend.example",
    "https://backend.example/path",
    "https://backend.example?url=anything",
  ]) {
    process.env.BACKEND_URL = url;
    assert.equal((await viewerResponse(getViewerSnapshot)).status, 503);
  }
  process.env.BACKEND_URL = "https://backend.example";
  delete process.env.BACKEND_READ_TOKEN;
  assert.equal((await viewerResponse(getViewerSnapshot)).status, 503);
  assert.equal(transport.mock.callCount(), 0);
});

test("proof lookup validates input before transport and distinguishes no record from invalid proof", async () => {
  const transport = mock.method(
    globalThis,
    "fetch",
    async (_url: URL) => new Response("", { status: 404 }),
  );
  assert.equal(
    (await viewerResponse(() => getViewerProof("https://evil.example"))).status,
    400,
  );
  assert.equal(transport.mock.callCount(), 0);
  const response = await viewerResponse(() =>
    getViewerProof(`0x${"A".repeat(64)}`),
  );
  assert.equal(response.status, 404);
  assert.match(await response.text(), /No recorded verified inference/);
  assert.equal(
    String(transport.mock.calls[0]!.arguments[0]),
    `https://backend.example/api/viewer/proof?hash=${"a".repeat(64)}`,
  );
});
