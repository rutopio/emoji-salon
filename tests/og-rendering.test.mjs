import assert from "node:assert/strict";
import { test } from "node:test";
import { deferred, loadSource } from "./helpers/load-source.mjs";

test("OG parsing and WASM initialization overlap, but invalid assets skip initialization", async () => {
  const data = deferred();
  const wasm = deferred();
  const calls = [];
  let valid = false;
  const { onRequestGet } = await loadSource(
    new URL("../functions/og.ts", import.meta.url),
    {
      globals: {
        fetch: async () => ({
          ok: valid,
          headers: new Headers({ "content-type": "application/json" }),
          json: () => {
            calls.push("json");
            return data.promise;
          },
        }),
      },
      imports: {
        "@resvg/resvg-wasm": {
          initWasm: () => {
            calls.push("wasm");
            return wasm.promise;
          },
          Resvg: class {
            render() {
              return { asPng: () => new Uint8Array([1, 2]) };
            }
          },
        },
        "@resvg/resvg-wasm/index_bg.wasm": { default: {} },
        "../src/lib/render-og-image": {
          OG_WIDTH: 1200,
          renderOgSvg: () => {
            calls.push("render");
            return "<svg/>";
          },
        },
      },
    }
  );
  const run = (query) =>
    onRequestGet({
      request: new Request(`https://emojisalon.chingru.com/og?${query}`),
    });
  assert.equal((await run("emoji=invalid")).status, 400);
  assert.equal((await run("emoji=u1f600")).status, 404);
  assert.deepEqual(calls, []);
  valid = true;
  const loading = run("emoji=u1f600");
  await new Promise(setImmediate);
  assert.deepEqual(calls, ["json", "wasm"]);
  data.resolve({ d: [], f: [], c: [] });
  await new Promise(setImmediate);
  assert.ok(!calls.includes("render"));
  wasm.resolve();
  const response = await loading;
  assert.equal(response.headers.get("content-type"), "image/png");
  assert.deepEqual([...new Uint8Array(await response.arrayBuffer())], [1, 2]);
});
