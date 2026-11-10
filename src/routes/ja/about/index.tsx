import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/page-meta";
import { AboutPage } from "@/routes/about/index";

export const Route = createFileRoute("/ja/about/")({
  component: AboutPage,
  head: () => pageHead("ja", "about"),
});
