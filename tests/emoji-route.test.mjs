import assert from "node:assert/strict";
import { test } from "node:test";
import { loadSource } from "./helpers/load-source.mjs";

test("editor routes normalize stored or random selections without mutating preloads", async () => {
  const storage = new Map([
    ["emojisalon:emoji", "stored"],
    ["emojisalon:palette", "colors"],
  ]);
  const localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  };
  const { prepareEmojiRoute: prepare } = await loadSource(
    new URL("../src/lib/prepare-emoji-route.ts", import.meta.url),
    {
      globals: { window: {}, localStorage },
      imports: {
        "@tanstack/react-router": {
          redirect: (options) => ({ redirect: options }),
        },
        "./emoji-query": {
          emojiQueryOptions: (emoji) => ({ queryKey: ["emoji", emoji] }),
        },
        "./emoji-utils": {
          unicodeToEmoji: (value) => (value === "invalid" ? null : value),
          emojiToUnicode: (value) => value,
          getEmojiLabel: (value) => value,
          getRandomEmojiWithLabel: () => ({ emoji: "random", label: "Random" }),
        },
      },
    }
  );
  let fetches = 0;
  let fail = false;
  let controller = new AbortController();
  const run = (search, preload = false) =>
    prepare({
      search,
      preload,
      location: { pathname: "/ja/" },
      abortController: controller,
      context: {
        queryClient: {
          fetchQuery: async () => {
            fetches++;
            if (fail) throw new Error("Offline");
            return {};
          },
        },
      },
    });
  await run({ emoji: "url" }, true);
  assert.equal(storage.get("emojisalon:emoji"), "stored");
  assert.equal(fetches, 0);
  await assert.rejects(
    () => run({}),
    (error) =>
      error.redirect.to === "/ja" &&
      error.redirect.search.emoji === "stored" &&
      error.redirect.search.palette === "colors"
  );
  await run({ emoji: "url", palette: "new-colors" });
  assert.equal(storage.get("emojisalon:emoji"), "url");
  assert.equal(storage.get("emojisalon:palette"), "new-colors");
  await run({ emoji: "url" });
  assert.equal(storage.has("emojisalon:palette"), false);
  fail = true;
  await run({ emoji: "missing" });
  assert.equal(storage.get("emojisalon:emoji"), "url");
  fail = false;
  controller.abort();
  await run({ emoji: "superseded" });
  assert.equal(storage.get("emojisalon:emoji"), "url");
  controller = new AbortController();
  localStorage.getItem = () => {
    throw new Error("Blocked");
  };
  localStorage.setItem = () => {
    throw new Error("Blocked");
  };
  await assert.rejects(
    () => run({ emoji: "invalid" }),
    (error) => error.redirect.search.emoji === "random"
  );
  await run({ emoji: "url" });
});
