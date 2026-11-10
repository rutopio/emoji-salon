export type Locale = "en" | "zh-TW" | "ja";

export const locales = [
  { code: "en", prefix: "", label: "English", htmlLang: "en" },
  { code: "zh-TW", prefix: "/zh_tw", label: "繁體中文", htmlLang: "zh-Hant" },
  { code: "ja", prefix: "/ja", label: "日本語", htmlLang: "ja" },
] as const;

export function localeForPath(pathname: string): Locale {
  if (pathname === "/zh_tw" || pathname.startsWith("/zh_tw/")) return "zh-TW";
  if (pathname === "/ja" || pathname.startsWith("/ja/")) return "ja";
  return "en";
}

export function stripLocale(pathname: string): string {
  const locale = localeForPath(pathname);
  const prefix = locales.find((item) => item.code === locale)?.prefix ?? "";
  return pathname.slice(prefix.length) || "/";
}

export function withLocale(pathname: string, locale: Locale): string {
  const bare = stripLocale(pathname);
  const prefix = locales.find((item) => item.code === locale)?.prefix ?? "";
  return bare === "/" ? prefix || "/" : `${prefix}${bare}`;
}
