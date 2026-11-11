#!/usr/bin/env node
// Asset fields follow src/lib/emoji-path-data.ts.

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

const SVG_ATTRIBUTE_RE = /([\w:-]+)\s*=\s*"([^"]*)"/g;
const SHORT_HEX_COLOR_RE = /^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/;
const SVG_OPEN_TAG_RE = /^[\s\S]*?<svg[^>]*>/;
const SVG_CLOSE_TAG_RE = /<\/svg>\s*$/;
const SVG_ELEMENT_RE = /<(\/?)(g|path|circle|ellipse)\b([^>]*?)(\/?)>/g;
const SVG_EXTENSION_RE = /\.svg$/;
const HYPHEN_RE = /-/g;

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");

const TWEMOJI_TAG = "v17.0.3";
const TWEMOJI_REPO = "https://github.com/jdecked/twemoji.git";
const TWEMOJI_DIR = join(REPO_ROOT, "assets", "vendor", "twemoji");
const SVG_DIR = join(TWEMOJI_DIR, "assets", "svg");

const OUT_DIR = join(REPO_ROOT, "public", "data");
const EMOJI_OUT_DIR = join(OUT_DIR, "emoji");
const SVG_OUT_DIR = join(REPO_ROOT, "public", "twemoji");

const SKIN_TONE_MODIFIERS = ["1f3fb", "1f3fc", "1f3fd", "1f3fe", "1f3ff"];

// Existing clones are reused; remove the cache when changing the upstream tag.
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

function circleToPath(attrs) {
  const cx = Number(attrs.cx ?? 0);
  const cy = Number(attrs.cy ?? 0);
  const r = Number(attrs.r ?? 0);
  return `M ${cx - r},${cy} A ${r},${r} 0 1,0 ${cx + r},${cy} A ${r},${r} 0 1,0 ${cx - r},${cy} Z`;
}

function ellipseToPath(attrs) {
  const cx = Number(attrs.cx ?? 0);
  const cy = Number(attrs.cy ?? 0);
  const rx = Number(attrs.rx ?? 0);
  const ry = Number(attrs.ry ?? 0);
  return `M ${cx - rx},${cy} A ${rx},${ry} 0 0,0 ${cx + rx},${cy} A ${rx},${ry} 0 0,0 ${cx - rx},${cy} Z`;
}

function parseAttrs(tag) {
  const attrs = {};
  for (const m of tag.matchAll(SVG_ATTRIBUTE_RE)) {
    attrs[m[1]] = m[2];
  }
  return attrs;
}

function normalizeColor(color) {
  if (!color || color === "none") return "#000000";
  const short = color.match(SHORT_HEX_COLOR_RE);
  if (short) {
    return `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}`.toLowerCase();
  }
  return color.toLowerCase();
}

// Twemoji uses paths, circles and ellipses; groups supply inherited fills.
function parseSvg(svg) {
  const d = [];
  const f = [];

  const inner = svg.replace(SVG_OPEN_TAG_RE, "").replace(SVG_CLOSE_TAG_RE, "");

  const tagRe = SVG_ELEMENT_RE;
  const groupFills = [];
  for (const m of inner.matchAll(tagRe)) {
    const [, closing, name, rawAttrs, selfClose] = m;

    if (name === "g") {
      if (closing) {
        groupFills.pop();
      } else {
        const { fill } = parseAttrs(rawAttrs);
        groupFills.push(fill);
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

// Preserve first-seen order: share URLs address these palette indices.
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
  return `u${filename.replace(SVG_EXTENSION_RE, "").replace(HYPHEN_RE, "_")}`;
}

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
  // Preserve upstream filenames; variation selectors do not map directly to asset names.
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
    copyFileSync(join(SVG_DIR, filename), join(SVG_OUT_DIR, filename));

    const stem = filename.replace(SVG_EXTENSION_RE, "");
    chars[stemToChar(stem)] = stem;
    emojis.push(unicode);
  }

  emojis.sort();
  writeFileSync(
    join(OUT_DIR, "index.json"),
    JSON.stringify({ version: TWEMOJI_TAG, emojis, chars })
  );
  // Bundle the map to avoid briefly showing OS emoji before thumbnails load.
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
