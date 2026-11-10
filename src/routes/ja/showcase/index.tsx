import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/page-meta";
import { ShowcasePage } from "@/routes/showcase/index";

export const Route = createFileRoute("/ja/showcase/")({
  component: ShowcasePage,
  head: () => pageHead("ja", "showcase"),
});
