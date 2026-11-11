import { initWasm, Resvg } from "@resvg/resvg-wasm";
import resvgWasm from "@resvg/resvg-wasm/index_bg.wasm";

import type { EmojiPathData } from "../src/lib/emoji-path-data";
import { OG_WIDTH, renderOgSvg } from "../src/lib/render-og-image";

const EMOJI_ID_RE = /^u[0-9a-f_]+$/;

// Share initialization across requests; failed attempts remain retryable.
let wasmReady: Promise<void> | null = null;
function ensureWasm(): Promise<void> {
  if (!wasmReady) {
    wasmReady = initWasm(resvgWasm as WebAssembly.Module).catch((error) => {
      wasmReady = null;
      throw error;
    });
  }
  return wasmReady;
}

/** Only accept well-formed emoji ids to keep the asset fetch path safe. */
function isValidEmojiId(id: string): boolean {
  return EMOJI_ID_RE.test(id);
}

export const onRequestGet: PagesFunction = async ({ request }) => {
  const url = new URL(request.url);
  const emoji = url.searchParams.get("emoji");
  const override = url.searchParams.get("palette") ?? undefined;

  if (!emoji || !isValidEmojiId(emoji)) {
    return new Response("Missing or invalid emoji", { status: 400 });
  }

  // Missing assets may return the HTML SPA shell with status 200; require JSON.
  const dataRes = await fetch(`${url.origin}/data/emoji/${emoji}.json`);
  const contentType = dataRes.headers.get("content-type") || "";
  if (!dataRes.ok || !contentType.includes("application/json")) {
    return new Response("Unknown emoji", { status: 404 });
  }
  const [data] = await Promise.all([
    dataRes.json() as Promise<EmojiPathData>,
    ensureWasm(),
  ]);

  const svg = renderOgSvg({ data, override });

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: OG_WIDTH },
  });
  const png = resvg.render().asPng();

  return new Response(png.buffer as ArrayBuffer, {
    headers: {
      "content-type": "image/png",
      "cache-control": "public, max-age=86400, s-maxage=2592000, immutable",
    },
  });
};
