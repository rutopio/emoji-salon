/// <reference types="vite/client" />
import { PageTransition } from "@rutopio/ui/page-transition";
import { ScreenSize } from "@rutopio/ui/screen-size";
import { Toaster } from "@rutopio/ui/sonner";
import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  useLocation,
} from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { NotFound } from "@/components/not-found";
import { ThemeProvider } from "@/components/theme-provider";

const TanStackDevtools = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/react-devtools").then((m) => ({
        default: m.TanStackDevtools,
      }))
    )
  : () => null;

const ReactQueryDevtoolsPanel = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/react-query-devtools").then((m) => ({
        default: m.ReactQueryDevtoolsPanel,
      }))
    )
  : () => null;

const TanStackRouterDevtoolsPanel = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/react-router-devtools").then((m) => ({
        default: m.TanStackRouterDevtoolsPanel,
      }))
    )
  : () => null;

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: RootComponent,
  notFoundComponent: NotFound,
});

function RootComponent() {
  return (
    <>
      <HeadContent />
      <ThemeProvider>
        <AnimatedOutlet />
        <Toaster position="top-center" />
        {import.meta.env.DEV && <ScreenSize />}
        <Suspense>
          <TanStackDevtools
            plugins={[
              {
                name: "TanStack Query",
                render: <ReactQueryDevtoolsPanel />,
              },
              {
                name: "TanStack Router",
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        </Suspense>
      </ThemeProvider>
    </>
  );
}

function AnimatedOutlet() {
  const pathname = useLocation({ select: (location) => location.pathname });
  return (
    <PageTransition key={pathname}>
      <Outlet />
    </PageTransition>
  );
}
