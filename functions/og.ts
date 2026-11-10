/**
 * Cloudflare Pages Function: on-demand Open Graph image.
 *
 *   GET /og?emoji=u1f600&palette=0_55acee
 *
 * Fetches the shared emoji's preprocessed data from the static assets, builds a
 * 1200x630 SVG (original emoji on the left, customized on the right) with the
 * app's pure renderer, then rasterizes it to PNG with resvg-wasm. Cached at the
 * edge so repeated shares are cheap. The worker bundles no emoji data itself.
 */

import { initWasm, Resvg } from "@resvg/resvg-wasm";
// The .wasm is imported as a module so Wrangler bundles it with the function.
import resvgWasm from "@resvg/resvg-wasm/index_bg.wasm";

import type { EmojiData } from "../src/lib/render-emoji-svg";
import { OG_WIDTH, renderOgSvg } from "../src/lib/render-og-image";

// initWasm must run once per isolate; guard with a shared promise.
let wasmReady: Promise<void> | null = null;
function ensureWasm(): Promise<void> {
  if (!wasmReady) {
    wasmReady = initWasm(resvgWasm as WebAssembly.Module);
  }
  return wasmReady;
}

/** Only accept well-formed emoji ids to keep the asset fetch path safe. */
function isValidEmojiId(id: string): boolean {
  return /^u[0-9a-f_]+$/.test(id);
}

export const onRequestGet: PagesFunction = async ({ request }) => {
  const url = new URL(request.url);
  const emoji = url.searchParams.get("emoji");
  const override = url.searchParams.get("palette") ?? undefined;

  if (!emoji || !isValidEmojiId(emoji)) {
    return new Response("Missing or invalid emoji", { status: 400 });
  }

  // Fetch the per-emoji data served as a static asset on the same origin. A
  // missing asset falls back to the SPA shell (text/html, 200), so require JSON.
  const dataUrl = new URL(`/data/emoji/${emoji}.json`, url.origin);
  const dataRes = await fetch(dataUrl.toString());
  const contentType = dataRes.headers.get("content-type") || "";
  if (!dataRes.ok || !contentType.includes("application/json")) {
    return new Response("Unknown emoji", { status: 404 });
  }
  const data = (await dataRes.json()) as EmojiData;

  const svg = renderOgSvg({ data, override });

  await ensureWasm();
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: OG_WIDTH },
  });
  const png = resvg.render().asPng();

  return new Response(png.buffer as ArrayBuffer, {
    headers: {
      "content-type": "image/png",
      // Cache aggressively at the edge; the image is a pure function of the query.
      "cache-control": "public, max-age=86400, s-maxage=2592000, immutable",
    },
  });
};
