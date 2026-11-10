import { SectionHeadingAnchor } from "@rutopio/base-component/section-heading-anchor";
import { copySectionLink } from "@rutopio/base-component/section-navigation";
import { toast } from "sonner";
import { useT } from "@/lib/translations";
import { cn } from "@/lib/utils";

interface ArticleHeadingProps {
  id: string;
  children: string;
  level?: 2 | 3;
}

export function ArticleHeading({
  id,
  children,
  level = 2,
}: ArticleHeadingProps) {
  const t = useT();
  const Heading = level === 3 ? "h3" : "h2";

  const handleCopySectionLink = () => {
    void copySectionLink(
      id,
      () => toast.success(t("Section link copied.")),
      () => toast.error(t("Could not copy the section link."))
    );
  };

  return (
    <Heading
      id={id}
      className={cn(
        "group flex items-center text-balance font-bold text-lg text-neutral-950 leading-[1.65] dark:text-neutral-50",
        level === 3 ? "scroll-m-20" : "scroll-mt-14"
      )}
    >
      <SectionHeadingAnchor
        id={id}
        title={t("Copy link to this section")}
        onClick={handleCopySectionLink}
      >
        {children}
      </SectionHeadingAnchor>
      {level === 2 && (
        <span
          aria-hidden="true"
          className="ml-4 h-0.5 min-w-4 flex-1 scale-y-50 bg-border"
        />
      )}
    </Heading>
  );
}
