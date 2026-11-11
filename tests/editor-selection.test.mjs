import assert from "node:assert/strict";
import { test } from "node:test";
import { editorHarness } from "./helpers/editor.mjs";

test("only the latest successful selection replaces the complete emoji snapshot", async () => {
  const app = await editorHarness();
  try {
    await app.flushTimers(0);
    await app.resolve("a");
    await app.act(() => app.value.handleEmojiSelect("b", "Bee"));
    assert.equal(app.value.currentEmoji, "a");
    assert.equal(app.value.currentEmojiLabel, "A");
    await app.act(() => app.value.handleEmojiSelect("c", "See"));
    await app.resolve("c");
    await app.resolve("b");
    assert.equal(app.value.currentEmoji, "c");
    assert.equal(app.value.currentEmojiLabel, "See");
    assert.equal(app.value.pathArray[0], "path-c");
    await app.act(() => app.value.handleEmojiSelect("missing", "Missing"));
    await app.resolve("missing", null);
    assert.equal(app.value.currentEmoji, "c");
    assert.equal(app.value.currentEmojiLabel, "See");
    assert.equal(app.errors.length, 1);
  } finally {
    await app.close();
  }
});

test("selection, reset, random colors, route changes and unmount invalidate delayed URL writes", async () => {
  const app = await editorHarness();
  try {
    await app.flushTimers(0);
    await app.resolve("a");
    const edit = () => app.act(() => app.value.handleColorChange(0, "#abcdef"));
    await edit();
    await app.act(() => app.value.handleEmojiSelect("b", "Bee"));
    await app.resolve("b");
    await app.flushTimers(500);
    assert.equal(app.navigations.at(-1).search.emoji, "b");
    await edit();
    await app.act(() => app.value.handleReset());
    await app.flushTimers(500);
    assert.equal(app.navigations.at(-1).search.palette, undefined);
    await edit();
    await app.act(() => app.value.handleRandomColors());
    await app.flushTimers(500);
    assert.equal(app.navigations.at(-1).search.palette, "0_#123456");
    await edit();
    const count = app.navigations.length;
    app.location.pathname = "/about";
    await app.rerender();
    await app.flushTimers(500);
    assert.equal(app.navigations.length, count);
  } finally {
    await app.close();
  }
  assert.equal(app.timers.size, 0);
});

test("blocked localStorage does not interrupt a successful selection", async () => {
  const app = await editorHarness({
    localStorage: {
      getItem() {
        throw new Error("Blocked");
      },
      setItem() {
        throw new Error("Blocked");
      },
      removeItem() {
        throw new Error("Blocked");
      },
    },
  });
  try {
    app.location.search = {};
    await app.rerender();
    await app.flushTimers(0);
    // The mount closure reads the initial URL. Storage writes must still be safe.
    await app.resolve("a");
    assert.equal(app.value.currentEmoji, "a");
    await app.act(() => app.value.handleReset());
  } finally {
    await app.close();
  }
});
