import assert from "node:assert/strict";
import { test } from "node:test";
import { loadSource } from "./helpers/load-source.mjs";

test("overlapping raster exports own their pixels and reject decode or encoding failures", async () => {
  const images = [];
  const canvases = [];
  const { rasterizeSvg, canvasToPng } = await loadSource(
    new URL("../src/lib/rasterize-svg.ts", import.meta.url),
    {
      globals: {
        Image: class {
          constructor() {
            images.push(this);
          }
        },
        document: {
          createElement: () => {
            const canvas = {
              draws: [],
              background: false,
              getContext: () => ({
                scale() {},
                fillRect() {
                  canvas.background = true;
                },
                drawImage(image) {
                  canvas.draws.push(image.src);
                },
              }),
              toBlob: (callback) => callback(null),
            };
            canvases.push(canvas);
            return canvas;
          },
        },
      },
      imports: {
        "./constants": {
          CANVAS_BASE_SIZE: 256,
          CANVAS_IMAGE_PADDING: 50,
          CANVAS_SCALE_FACTOR: 10,
        },
      },
    }
  );
  let finished = false;
  const first = rasterizeSvg("<svg id='first'/>", "jpg").then((result) => {
    finished = true;
    return result;
  });
  const second = rasterizeSvg("<svg id='second'/>");
  await new Promise(setImmediate);
  assert.equal(finished, false);
  images[1].onload();
  const png = await second;
  assert.equal(png, canvases[1]);
  assert.equal(png.background, false);
  assert.equal(png.draws.length, 1);
  assert.match(decodeURIComponent(png.draws[0]), /second/);
  images[0].onload();
  const jpg = await first;
  assert.equal(jpg.background, true);
  assert.equal(jpg.width, 2610);
  assert.equal(jpg.draws.length, 1);
  assert.match(decodeURIComponent(jpg.draws[0]), /first/);
  assert.equal(images[0].onload, null);
  const failure = rasterizeSvg("broken");
  images[2].onerror();
  await assert.rejects(failure, /decode SVG/);
  await assert.rejects(canvasToPng(png), /encode PNG/);
});
