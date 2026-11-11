import { translations } from "@/locales/translations";
import type { Locale } from "./locale";

export function translate(locale: Locale, english: string): string {
  return locale === "en" ? english : (translations[locale][english] ?? english);
}

export function currentT(english: string): string {
  return translate(
    typeof window === "undefined"
      ? "en"
      : window.location.pathname.startsWith("/zh_tw")
        ? "zh-TW"
        : window.location.pathname.startsWith("/ja")
          ? "ja"
          : "en",
    english
  );
}
