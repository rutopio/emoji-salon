import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import type { EmojiPathData } from "./src/lib/emoji-path-data";
import { renderOgSvg } from "./src/lib/render-og-image.ts";

const EMOJI_ID_RE = /^u[0-9a-f_]+$/;

/**
 * Dev-only: mirror the /og Pages Function so the OG image works under
 * `vite dev` too (Cloudflare Functions only run under wrangler). Reads the
 * per-emoji data from public/data and serves the SVG directly (prod fetches the
 * same asset and rasterizes to PNG via resvg-wasm), sharing the same renderer
 * so dev and prod stay in sync.
 */
function ogImagePlugin(): Plugin {
  const emojiDir = path.resolve(import.meta.dirname, "public/data/emoji");
  return {
    name: "og-image-dev",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url ?? "", "http://localhost");
        if (url.pathname !== "/og") return next();

        const emoji = url.searchParams.get("emoji");
        const override = url.searchParams.get("palette") ?? undefined;
        const file = emoji ? path.join(emojiDir, `${emoji}.json`) : "";
        if (!emoji || !EMOJI_ID_RE.test(emoji) || !existsSync(file)) {
          res.statusCode = 400;
          res.end("Unknown emoji");
          return;
        }
        const data = JSON.parse(readFileSync(file, "utf8")) as EmojiPathData;
        res.setHeader("content-type", "image/svg+xml;charset=utf-8");
        res.end(renderOgSvg({ data, override }));
      });
    },
  };
}

// Preload the self-hosted fonts used on first paint.
const PUBLIC_PRELOAD_FONTS = [
  "/fonts/inter-normal-core.woff2",
  "/fonts/PaperMono%5Bwght%5D.woff2",
];

function fontPreloadPlugin(): Plugin {
  return {
    name: "font-preload",
    transformIndexHtml: {
      order: "post",
      handler(html) {
        const tags = PUBLIC_PRELOAD_FONTS.map(
          (href) =>
            `    <link rel="preload" href="${href}" as="font" type="font/woff2" crossorigin>`
        ).join("\n");
        return html.replace("</head>", `${tags}\n  </head>`);
      },
    },
  };
}

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  plugins: [
    ogImagePlugin(),
    fontPreloadPlugin(),
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    viteReact(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
});
