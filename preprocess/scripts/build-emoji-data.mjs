#!/usr/bin/env node
/**
 * @fileoverview Single, reproducible preprocessing step for EmojiSalon.
 *
 * Turns the jdecked/twemoji SVG assets into one JSON file per emoji, plus an
 * index. No fonts, no Glyphs App, no network beyond cloning the pinned source.
 *
 * Source of truth: jdecked/twemoji (community-maintained Twemoji, Unicode 17).
 * The upstream repo is shallow-cloned at a pinned tag so the output is
 * deterministic and anyone can reproduce it with `pnpm preprocess`.
 *
 * Output (served as static assets, fetched on demand by the app + OG worker):
 *   public/data/emoji/u<code>.json  -> { d, f, c }
 *   public/data/index.json          -> { version, emojis: [...] }
 *
 * Per-emoji JSON shape:
 *   d: string[]  path data, one entry per drawn element (paths/circles/ellipses)
 *   f: string[]  normalized fill color for each d[i] (same length as d)
 *   c: string[]  distinct editable colors, in first-seen order within f
 *
 * Palette scheme (C): a color's "index" is its position in c. Share URLs encode
 * overrides as "<index>_<hex>", e.g. "0_55acee". This is self-contained per
 * emoji: no global color table is needed to recolor an emoji.
 */

import { execSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PREPROCESS_DIR = resolve(__dirname, "..");
const REPO_ROOT = resolve(PREPROCESS_DIR, "..");

/** Pinned upstream version. Bump this (and re-run) to update emoji. */
const TWEMOJI_TAG = "v17.0.3";
const TWEMOJI_REPO = "https://github.com/jdecked/twemoji.git";
const TWEMOJI_DIR = join(PREPROCESS_DIR, "twemoji");
const SVG_DIR = join(TWEMOJI_DIR, "assets", "svg");

const OUT_DIR = join(REPO_ROOT, "public", "data");
const EMOJI_OUT_DIR = join(OUT_DIR, "emoji");
/** Raw SVGs copied here so the picker can show twemoji thumbnails self-hosted. */
const SVG_OUT_DIR = join(REPO_ROOT, "public", "twemoji");

/** Skin-tone modifier code points; their files reuse the base emoji's paths. */
const SKIN_TONE_MODIFIERS = ["1f3fb", "1f3fc", "1f3fd", "1f3fe", "1f3ff"];

/**
 * Ensure the upstream SVG source exists at the pinned tag. Clones it shallowly
 * if missing; leaves an existing clone untouched (delete it to force a refresh).
 */
function ensureSource() {
  if (existsSync(SVG_DIR)) {
    console.log(`Using existing source: ${TWEMOJI_DIR}`);
    return;
  }
  console.log(`Cloning ${TWEMOJI_REPO} @ ${TWEMOJI_TAG} ...`);
  rmSync(TWEMOJI_DIR, { recursive: true, force: true });
  execSync(
    `git clone --depth 1 --branch ${TWEMOJI_TAG} ${TWEMOJI_REPO} "${TWEMOJI_DIR}"`,
    { stdio: "inherit" }
  );
}

/** Convert an SVG <circle> to equivalent path data. */
function circleToPath(attrs) {
  const cx = Number(attrs.cx ?? 0);
  const cy = Number(attrs.cy ?? 0);
  const r = Number(attrs.r ?? 0);
  return `M ${cx - r},${cy} A ${r},${r} 0 1,0 ${cx + r},${cy} A ${r},${r} 0 1,0 ${cx - r},${cy} Z`;
}

/** Convert an SVG <ellipse> to equivalent path data. */
function ellipseToPath(attrs) {
  const cx = Number(attrs.cx ?? 0);
  const cy = Number(attrs.cy ?? 0);
  const rx = Number(attrs.rx ?? 0);
  const ry = Number(attrs.ry ?? 0);
  return `M ${cx - rx},${cy} A ${rx},${ry} 0 0,0 ${cx + rx},${cy} A ${rx},${ry} 0 0,0 ${cx - rx},${cy} Z`;
}

/** Parse the attributes of a single SVG element tag into a plain object. */
function parseAttrs(tag) {
  const attrs = {};
  for (const m of tag.matchAll(/([\w:-]+)\s*=\s*"([^"]*)"/g)) {
    attrs[m[1]] = m[2];
  }
  return attrs;
}

/**
 * Normalize a color to lowercase 6-digit hex. Mirrors the app's normalizeColor:
 * null/none -> #000000, expand 3-digit (#fff -> #ffffff), lowercase.
 */
function normalizeColor(color) {
  if (!color || color === "none") return "#000000";
  const short = color.match(/^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/);
  if (short) {
    return `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}`.toLowerCase();
  }
  return color.toLowerCase();
}

/**
 * Extract paths + normalized fills from one SVG. jdecked Twemoji files are flat:
 * top-level <path>/<circle>/<ellipse> with a `fill` attribute, occasionally
 * wrapped in a <g fill="..."> that supplies the fill. We walk elements in
 * document order and resolve each fill, falling back to the enclosing group.
 */
function parseSvg(svg) {
  const d = [];
  const f = [];

  // Strip the outer <svg ...> ... </svg> wrapper, keep the inner markup.
  const inner = svg
    .replace(/^[\s\S]*?<svg[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "");

  // Tokenize into element tags, tracking <g fill> context for grouped fills.
  const tagRe = /<(\/?)(g|path|circle|ellipse)\b([^>]*?)(\/?)>/g;
  const groupFills = [];
  for (const m of inner.matchAll(tagRe)) {
    const [, closing, name, rawAttrs, selfClose] = m;

    if (name === "g") {
      if (closing) {
        groupFills.pop();
      } else {
        const { fill } = parseAttrs(rawAttrs);
        groupFills.push(fill);
        // A self-closing <g/> carries no children; pop immediately.
        if (selfClose) groupFills.pop();
      }
      continue;
    }
    if (closing) continue;

    const attrs = parseAttrs(rawAttrs);
    let path;
    if (name === "path") path = attrs.d ?? "";
    else if (name === "circle") path = circleToPath(attrs);
    else path = ellipseToPath(attrs);
    if (!path) continue;

    const inheritedFill = groupFills[groupFills.length - 1];
    const fill = attrs.fill ?? inheritedFill;
    d.push(path);
    f.push(normalizeColor(fill));
  }

  return { d, f };
}

/** Build the distinct-color list (scheme C): first-seen order within f. */
function distinctColors(f) {
  const seen = new Set();
  const c = [];
  for (const color of f) {
    if (!seen.has(color)) {
      seen.add(color);
      c.push(color);
    }
  }
  return c;
}

/** "1f468-200d-1f469.svg" -> "u1f468_200d_1f469". */
function filenameToUnicode(filename) {
  return `u${filename.replace(/\.svg$/, "").replace(/-/g, "_")}`;
}

/** "1f468-200d-1f469" -> the actual emoji character (decode the codepoints). */
function stemToChar(stem) {
  return stem
    .split("-")
    .map((cp) => String.fromCodePoint(Number.parseInt(cp, 16)))
    .join("");
}

function isSkinToneFile(filename) {
  return SKIN_TONE_MODIFIERS.some((mod) => filename.includes(mod));
}

function main() {
  ensureSource();

  rmSync(EMOJI_OUT_DIR, { recursive: true, force: true });
  mkdirSync(EMOJI_OUT_DIR, { recursive: true });
  rmSync(SVG_OUT_DIR, { recursive: true, force: true });
  mkdirSync(SVG_OUT_DIR, { recursive: true });

  const files = readdirSync(SVG_DIR)
    .filter((n) => n.endsWith(".svg"))
    .sort();
  const emojis = [];
  // Maps an emoji character to its twemoji filename stem, so the picker can
  // resolve a thumbnail without re-deriving codepoints (FE0F/ZWJ rules are
  // fiddly; the filename is authoritative).
  const chars = {};
  let skipped = 0;

  for (const filename of files) {
    if (isSkinToneFile(filename)) {
      skipped++;
      continue;
    }
    const svg = readFileSync(join(SVG_DIR, filename), "utf8");
    const { d, f } = parseSvg(svg);
    if (d.length === 0) {
      console.warn(`No drawable paths in ${filename}, skipping`);
      skipped++;
      continue;
    }
    const unicode = filenameToUnicode(filename);
    const c = distinctColors(f);
    writeFileSync(
      join(EMOJI_OUT_DIR, `${unicode}.json`),
      JSON.stringify({ d, f, c })
    );
    // Copy the raw SVG for the picker's self-hosted twemoji thumbnails.
    copyFileSync(join(SVG_DIR, filename), join(SVG_OUT_DIR, filename));

    const stem = filename.replace(/\.svg$/, "");
    chars[stemToChar(stem)] = stem;
    emojis.push(unicode);
  }

  emojis.sort();
  writeFileSync(
    join(OUT_DIR, "index.json"),
    JSON.stringify({ version: TWEMOJI_TAG, emojis, chars })
  );
  // Bundle the small character map with the picker, so its first rendered
  // emoji grid already uses Twemoji instead of briefly showing the OS font.
  writeFileSync(
    join(REPO_ROOT, "src", "data", "twemoji-chars.json"),
    `${JSON.stringify(chars)}\n`
  );

  console.log(`\nSource: jdecked/twemoji ${TWEMOJI_TAG}`);
  console.log(`Emojis: ${emojis.length} | Skipped: ${skipped}`);
  console.log(
    `Output: public/data/emoji/*.json, public/data/index.json, public/twemoji/*.svg, src/data/twemoji-chars.json`
  );
}

main();
