// Crawlers need per-share previews before the SPA runs.

import { SITE_URL } from "../src/lib/constants";
import { localeForPath, stripLocale } from "../src/lib/locale";
import { type Page, pageMeta, pagePath } from "../src/lib/page-meta";
import { OG_HEIGHT, OG_WIDTH } from "../src/lib/render-og-image";

const TRAILING_SLASH_RE = /\/$/;

class MetaContentRewriter {
  constructor(private readonly content: string) {}
  element(el: Element) {
    el.setAttribute("content", this.content);
  }
}

class AttributeRewriter {
  constructor(
    private readonly attribute: string,
    private readonly value: string
  ) {}
  element(el: Element) {
    el.setAttribute(this.attribute, this.value);
  }
}

class TitleRewriter {
  constructor(private readonly title: string) {}
  element(el: Element) {
    el.setInnerContent(this.title);
  }
}

class JsonRewriter {
  constructor(private readonly json: string) {}
  element(el: Element) {
    el.setInnerContent(this.json, { html: true });
  }
}

export const onRequest: PagesFunction = async ({ request, next }) => {
  const url = new URL(request.url);

  // Keep Pages preview hosts out of search results.
  if (url.hostname.endsWith(".pages.dev")) {
    return Response.redirect(
      `https://emojisalon.chingru.com${url.pathname}${url.search}`,
      301
    );
  }

  if (url.pathname.startsWith("/og")) return next();

  const response = await next();
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  const locale = localeForPath(url.pathname);
  const barePath =
    stripLocale(url.pathname).replace(TRAILING_SLASH_RE, "") || "/";
  const page: Page | null =
    barePath === "/"
      ? "create"
      : barePath === "/showcase"
        ? "showcase"
        : barePath === "/about"
          ? "about"
          : null;
  if (!page) return response;
  const { title, description } = pageMeta[locale][page];
  const canonical = `${SITE_URL}${pagePath(locale, page)}`;
  const rewrite = new HTMLRewriter()
    .on(
      "html",
      new AttributeRewriter("lang", locale === "zh-TW" ? "zh-Hant" : locale)
    )
    .on("title", new TitleRewriter(title))
    .on('link[rel="canonical"]', new AttributeRewriter("href", canonical))
    .on('meta[name="description"]', new MetaContentRewriter(description))
    .on('meta[property="og:title"]', new MetaContentRewriter(title))
    .on('meta[property="og:description"]', new MetaContentRewriter(description))
    .on(
      'meta[property="og:image:alt"]',
      new MetaContentRewriter(
        locale === "zh-TW"
          ? "一個表情符號與其改色版本，由 EmojiSalon 製作。"
          : locale === "ja"
            ? "EmojiSalon で作った絵文字と、色を変えた絵文字。"
            : "An emoji and its recolored version, made with EmojiSalon."
      )
    )
    .on(
      'meta[property="og:locale"]',
      new MetaContentRewriter(
        locale === "zh-TW" ? "zh_TW" : locale === "ja" ? "ja_JP" : "en_US"
      )
    )
    .on('meta[property="og:url"]', new MetaContentRewriter(canonical))
    .on('meta[name="twitter:title"]', new MetaContentRewriter(title))
    .on(
      'meta[name="twitter:description"]',
      new MetaContentRewriter(description)
    )
    .on(
      'script[type="application/ld+json"]',
      new JsonRewriter(
        JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "EmojiSalon",
          url: `${SITE_URL}/`,
          description,
          inLanguage: locale === "zh-TW" ? "zh-TW" : locale,
          applicationCategory: "DesignApplication",
          operatingSystem: "Web",
          browserRequirements: "Requires JavaScript.",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          author: {
            "@type": "Person",
            name: "ChingRu",
            url: "https://chingru.com",
          },
        })
      )
    );

  for (const code of ["en", "zh-TW", "ja"] as const) {
    rewrite.on(
      `link[rel="alternate"][hreflang="${code}"]`,
      new AttributeRewriter("href", `${SITE_URL}${pagePath(code, page)}`)
    );
  }
  rewrite.on(
    'link[rel="alternate"][hreflang="x-default"]',
    new AttributeRewriter("href", `${SITE_URL}${pagePath("en", page)}`)
  );

  // Bare URLs keep the default cover; emoji share links need dynamic previews.
  const emoji = url.searchParams.get("emoji");
  if (!emoji || page !== "create") return rewrite.transform(response);

  const palette = url.searchParams.get("palette");
  const ogQuery = new URLSearchParams({ emoji });
  if (palette) ogQuery.set("palette", palette);
  const imageUrl = `${url.origin}/og?${ogQuery.toString()}`;

  const pageQuery = new URLSearchParams({ emoji });
  if (palette) pageQuery.set("palette", palette);
  const pageUrl = `${canonical}?${pageQuery.toString()}`;

  return rewrite
    .on('meta[property="og:image"]', new MetaContentRewriter(imageUrl))
    .on('meta[name="twitter:image"]', new MetaContentRewriter(imageUrl))
    .on(
      'meta[property="og:image:width"]',
      new MetaContentRewriter(String(OG_WIDTH))
    )
    .on(
      'meta[property="og:image:height"]',
      new MetaContentRewriter(String(OG_HEIGHT))
    )
    .on('meta[property="og:url"]', new MetaContentRewriter(pageUrl))
    .transform(response);
};
