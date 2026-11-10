/**
 * Cloudflare Pages middleware: rewrite the static OG/Twitter image meta tags to
 * point at the on-demand /og image for the current share URL. Crawlers don't
 * run JS, so the per-share preview must be injected into the served HTML here.
 *
 * Only HTML document responses for the app shell are rewritten; the /og
 * function and static assets pass through untouched.
 */

import { SITE_URL } from "../src/lib/constants";
import { localeForPath, stripLocale } from "../src/lib/locale";
import { type Page, pageMeta, pagePath } from "../src/lib/page-meta";
import { OG_HEIGHT, OG_WIDTH } from "../src/lib/render-og-image";

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

  // Canonical-host redirect. Any *.pages.dev host (<project>.pages.dev and every
  // <hash>.<project>.pages.dev preview URL) is 301'd to the custom domain, path +
  // query preserved, so the pages.dev origin never gets indexed or linked.
  if (url.hostname.endsWith(".pages.dev")) {
    const target = new URL(
      url.pathname + url.search,
      "https://emojisalon.chingru.com"
    );
    return Response.redirect(target.toString(), 301);
  }

  // Don't touch the image function or anything that isn't the HTML shell.
  if (url.pathname.startsWith("/og")) return next();

  const response = await next();
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  const locale = localeForPath(url.pathname);
  const barePath = stripLocale(url.pathname).replace(/\/$/, "") || "/";
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

  // The share state lives in the page query (?emoji=...&palette=...). A bare URL
  // has no emoji and keeps the static default image from index.html.
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
