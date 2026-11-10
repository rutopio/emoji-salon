import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@/styles.css";
import { localeForPath, locales } from "@/lib/locale";

import { getRouter } from "./router";

const { router, queryClient } = (() => {
  const r = getRouter();
  return { router: r, queryClient: r.options.context.queryClient };
})();

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Track the initial load and SPA navigations; gtag config disables automatic page views.
function syncDocumentLanguage(pathname: string) {
  const code = localeForPath(pathname);
  document.documentElement.lang =
    locales.find((locale) => locale.code === code)?.htmlLang ?? "en";
}
syncDocumentLanguage(window.location.pathname);
router.subscribe("onResolved", ({ fromLocation, toLocation }) => {
  syncDocumentLanguage(toLocation.pathname);
  window.gtag?.("event", "page_view", {
    page_path: toLocation.pathname,
    page_location: window.location.href,
    page_referrer: fromLocation
      ? new URL(fromLocation.href, window.location.origin).href
      : document.referrer,
  });
});

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element #root not found");
// The server keeps these tags for crawlers. TanStack Router owns their client
// versions, so remove the static copies before HeadContent mounts.
for (const node of document.querySelectorAll("[data-static-meta]")) {
  node.remove();
}
createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);
