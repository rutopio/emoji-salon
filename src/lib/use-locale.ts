import { useLocation } from "@tanstack/react-router";
import { localeForPath } from "./locale";

export function useLocale() {
  const pathname = useLocation({ select: (location) => location.pathname });
  return localeForPath(pathname);
}
