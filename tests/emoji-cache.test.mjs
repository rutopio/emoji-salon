import assert from "node:assert/strict";
import { test } from "node:test";
import { QueryClient } from "@tanstack/react-query";
import { deferred, loadSource } from "./helpers/load-source.mjs";

test("emoji fetches coalesce, retry failures, and preserve original-ID priority", async () => {
  const first = deferred();
  const calls = [];
  let response = () => first.promise;
  const data = { d: ["path"], f: ["#000000"], c: ["#000000"] };
  const utils = await loadSource(
    new URL("../src/lib/emoji-utils.ts", import.meta.url),
    {
      globals: {
        fetch: (path) => {
          calls.push(path);
          return response(path);
        },
        console: { warn() {} },
      },
      imports: {
        "@/data/emoji-names.json": { default: {} },
        "@/lib/constants": { DEFAULT_EMOJIS: [] },
      },
    }
  );
  const one = utils.fetchEmojiData("😀"),
    two = utils.fetchEmojiData("😀");
  assert.equal(calls.length, 1);
  first.resolve(Response.json(data));
  assert.equal(await one, await two);
  await utils.fetchEmojiData("😀");
  assert.equal(calls.length, 1);
  response = async () => new Response("Missing", { status: 404 });
  assert.equal(await utils.fetchEmojiData("🐈"), null);
  response = async () => Response.json(data);
  assert.deepEqual(await utils.fetchEmojiData("🐈"), data);
  const original = utils.emojiToUnicode("👁️‍🗨️");
  await utils.fetchEmojiData("👁️‍🗨️");
  assert.equal(calls.at(-1), `/data/emoji/${original}.json`);
  assert.equal(calls.length, 4);
});

test("showcase queries treat a missing result as a retryable failure rather than permanent null data", async () => {
  let options;
  let attempts = 0;
  const { useEmojiSVG } = await loadSource(
    new URL("../src/hooks/use-emoji-svg.ts", import.meta.url),
    {
      imports: {
        "@tanstack/react-query": {
          useQuery: (value) => {
            options = value;
            return { data: undefined, isPending: false };
          },
        },
        "@/lib/emoji-utils": {
          unicodeToEmoji: () => "😀",
          getEmojiLabel: () => "Smile",
          fetchEmojiData: async () =>
            ++attempts === 1 ? null : { d: [], f: [], c: [] },
          getOriginalPaletteData() {},
          parsePaletteString() {},
        },
      },
    }
  );
  useEmojiSVG("u1f600");
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  try {
    await assert.rejects(client.fetchQuery(options), /Emoji data unavailable/);
    assert.equal(client.getQueryState(options.queryKey).status, "error");
    assert.ok(await client.fetchQuery(options));
    assert.equal(attempts, 2);
    await client.fetchQuery(options);
    assert.equal(attempts, 2);
  } finally {
    client.clear();
  }
});
