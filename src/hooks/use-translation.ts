import { translate } from "@/lib/translations";
import { useLocale } from "./use-locale";

export function useT() {
  const locale = useLocale();
  return (english: string) => translate(locale, english);
}
