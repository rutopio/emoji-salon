import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/page-meta";
import { ShowcasePage } from "@/routes/showcase/index";

export const Route = createFileRoute("/zh_tw/showcase/")({
  component: ShowcasePage,
  head: () => pageHead("zh-TW", "showcase"),
});
