import assert from "node:assert/strict";
import { test } from "node:test";
import { editorHarness } from "./helpers/editor.mjs";
import { deferred } from "./helpers/load-source.mjs";

test("share preview waits for decoding and ignores an older preview or changed palette", async () => {
  const renders = [];
  const app = await editorHarness(
    {},
    {
      "@/lib/rasterize-svg": {
        rasterizeSvg() {
          const pending = deferred();
          renders.push(pending);
          return pending.promise;
        },
        canvasToPng() {},
      },
    }
  );
  try {
    await app.flushTimers(0);
    await app.resolve("a");
    let first, second;
    await app.act(() => {
      first = app.value.handleShare();
      second = app.value.handleShare();
    });
    assert.equal(app.value.shareDialogOpen, false);
    await app.act(async () => {
      renders[1].resolve({ toDataURL: () => "new" });
      await second;
    });
    assert.equal(app.value.resultImageSrc, "new");
    assert.equal(app.value.shareDialogOpen, true);
    await app.act(async () => {
      renders[0].resolve({ toDataURL: () => "old" });
      await first;
    });
    assert.equal(app.value.resultImageSrc, "new");
    await app.act(() => app.value.setShareDialogOpen(false));
    let stale;
    await app.act(() => {
      stale = app.value.handleShare();
      app.value.handleColorChange(0, "#ffffff");
    });
    await app.act(async () => {
      renders[2].resolve({ toDataURL: () => "stale" });
      await stale;
    });
    assert.equal(app.value.shareDialogOpen, false);
    let failed;
    await app.act(() => {
      failed = app.value.handleShare();
    });
    await app.act(async () => {
      renders[3].reject(new Error("Decode failed"));
      await failed;
    });
    assert.equal(app.value.shareDialogOpen, false);
    assert.equal(app.errors.length, 1);
    let closed;
    await app.act(() => {
      closed = app.value.handleShare();
      app.value.setShareDialogOpen(false);
    });
    await app.act(async () => {
      renders[4].resolve({ toDataURL: () => "closed" });
      await closed;
    });
    assert.equal(app.value.shareDialogOpen, false);
  } finally {
    await app.close();
  }
});
