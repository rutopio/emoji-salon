import { useMountEffect } from "@rutopio/ui/use-mount-effect";
import { Window } from "happy-dom";
import * as React from "react";
import * as jsx from "react/jsx-runtime";
import { deferred, loadSource } from "./load-source.mjs";

function Probe({ useValue, onRender }) {
  onRender(useValue());
  return null;
}

export async function editorHarness(extraGlobals = {}, extraImports = {}) {
  const window = new Window({ url: "https://emojisalon.chingru.com/" });
  Object.assign(globalThis, {
    window,
    document: window.document,
    IS_REACT_ACT_ENVIRONMENT: true,
  });
  const { createRoot } = await import("react-dom/client");
  const timers = new Map();
  let timerId = 0;
  const requests = new Map();
  const navigations = [];
  const errors = [];
  const location = { pathname: "/", search: { emoji: "a" } };
  const navigate = (options) => {
    navigations.push(options);
    return Promise.resolve();
  };
  const utils = {
    fetchEmojiData: (emoji) => {
      const pending = deferred();
      requests.set(emoji, pending);
      return pending.promise;
    },
    emojiToUnicode: (emoji) => emoji,
    unicodeToEmoji: (emoji) => emoji,
    getEmojiLabel: (emoji) => emoji.toUpperCase(),
    getOriginalPaletteData: (data) => ({
      originalPaletteIndex: data.c.map((_, i) => i),
      originalPaletteColors: data.c,
    }),
    getOverrideStyleString: (colors, original) =>
      colors
        .map((color, i) => (color === original[i] ? "" : `${i}_${color}`))
        .filter(Boolean)
        .join("-"),
    parsePaletteString: (_, colors) => colors,
    getRandomColor: () => "#123456",
    getRandomEmojiWithLabel: () => ({ emoji: "random", label: "Random" }),
    triggerDownload() {},
  };
  const globals = {
    window,
    document: window.document,
    localStorage: window.localStorage,
    navigator: window.navigator,
    setTimeout: (callback, delay) => {
      const id = ++timerId;
      timers.set(id, { callback, delay });
      return id;
    },
    clearTimeout: (id) => timers.delete(id),
    ...extraGlobals,
  };
  const { EmojiProvider, useEmoji } = await loadSource(
    new URL("../../src/contexts/emoji-context.tsx", import.meta.url),
    {
      globals,
      imports: {
        react: React,
        "react/jsx-runtime": jsx,
        "@rutopio/ui/use-mount-effect": {
          useMountEffect,
        },
        "@tanstack/react-router": {
          useLocation: () => location,
          useNavigate: () => navigate,
        },
        sonner: { toast: { error: (text) => errors.push(text), success() {} } },
        "@/lib/constants": {
          CANVAS_BASE_SIZE: 256,
          CANVAS_IMAGE_PADDING: 50,
          CANVAS_SCALE_FACTOR: 10,
        },
        "@/lib/emoji-utils": utils,
        "@/lib/share-utils": { downloadSVG() {} },
        "@/lib/translations": { currentT: (text) => text },
        ...extraImports,
      },
    }
  );
  let value;
  const root = createRoot(window.document.createElement("div"));
  const render = () =>
    root.render(
      React.createElement(
        EmojiProvider,
        null,
        React.createElement(Probe, {
          useValue: useEmoji,
          onRender: (next) => {
            value = next;
          },
        })
      )
    );
  await React.act(render);
  const flushTimers = async (delay) => {
    await React.act(async () => {
      for (const [id, timer] of [...timers])
        if (timer.delay === delay) {
          timers.delete(id);
          timer.callback();
        }
    });
  };
  const resolve = async (
    emoji,
    data = { d: [`path-${emoji}`], f: ["#000000"], c: ["#000000"] }
  ) => {
    await React.act(async () => requests.get(emoji).resolve(data));
  };
  return {
    get value() {
      return value;
    },
    requests,
    navigations,
    errors,
    timers,
    location,
    utils,
    resolve,
    flushTimers,
    act: React.act,
    rerender: () => React.act(render),
    async close() {
      await React.act(() => root.unmount());
      await window.happyDOM.abort();
    },
  };
}
