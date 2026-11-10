import { SITE_URL } from "./constants";
import type { Locale } from "./locale";

export type Page = "create" | "showcase" | "about";

export const pageMeta: Record<
  Locale,
  Record<Page, { title: string; description: string }>
> = {
  en: {
    create: {
      title: "Create | EmojiSalon - Coloring Your Emoji",
      description:
        "Choose any emoji, pick your own colors, and save the result as SVG or PNG.",
    },
    showcase: {
      title: "Showcase | EmojiSalon - Coloring Your Emoji",
      description:
        "Browse emoji color variations made by the community. Download or remix any design.",
    },
    about: {
      title: "About | EmojiSalon - Coloring Your Emoji",
      description:
        "How EmojiSalon works, how recoloring can help tell emoji apart, and how the artwork and code are licensed.",
    },
  },
  "zh-TW": {
    create: {
      title: "創作 | EmojiSalon－替表情符號換上新色彩",
      description: "選擇表情符號，調整喜歡的配色，再將作品儲存為 SVG 或 PNG。",
    },
    showcase: {
      title: "作品展示 | EmojiSalon－替表情符號換上新色彩",
      description: "瀏覽社群創作的表情符號配色，下載或重新編輯喜歡的作品。",
    },
    about: {
      title: "關於 | EmojiSalon－替表情符號換上新色彩",
      description:
        "了解 EmojiSalon 的使用方式、改色如何幫助辨識表情符號，以及圖片與程式碼的授權。",
    },
  },
  ja: {
    create: {
      title: "作成 | EmojiSalon－絵文字の色を変えよう",
      description:
        "絵文字を選び、好きな色に変えて、SVG または PNG で保存できます。",
    },
    showcase: {
      title: "ギャラリー | EmojiSalon－絵文字の色を変えよう",
      description:
        "コミュニティが作った絵文字の配色を見て、ダウンロードや再編集ができます。",
    },
    about: {
      title: "概要 | EmojiSalon－絵文字の色を変えよう",
      description:
        "EmojiSalon の使い方、色変更による絵文字の見分けやすさ、画像とコードのライセンスについて。",
    },
  },
};

export function pagePath(locale: Locale, page: Page): string {
  const prefix = locale === "en" ? "" : locale === "zh-TW" ? "/zh_tw" : "/ja";
  return page === "create" ? prefix || "/" : `${prefix}/${page}`;
}

export function pageHead(locale: Locale, page: Page) {
  const { title, description } = pageMeta[locale][page];
  const path = pagePath(locale, page);
  const url = `${SITE_URL}${path}`;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      {
        property: "og:locale",
        content:
          locale === "zh-TW" ? "zh_TW" : locale === "ja" ? "ja_JP" : "en_US",
      },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [
      { rel: "canonical", href: url },
      ...(["en", "zh-TW", "ja"] as const).map((language) => ({
        rel: "alternate",
        hrefLang: language,
        href: `${SITE_URL}${pagePath(language, page)}`,
      })),
      {
        rel: "alternate",
        hrefLang: "x-default",
        href: `${SITE_URL}${pagePath("en", page)}`,
      },
    ],
  };
}
