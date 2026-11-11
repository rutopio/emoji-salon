import { SectionHeading } from "@rutopio/base-component/section-heading";
import { copySectionLink } from "@rutopio/base-component/section-navigation";
import { toast } from "sonner";
import { useT } from "@/lib/translations";

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

  const handleCopySectionLink = () => {
    void copySectionLink(
      id,
      () => toast.success(t("Section link copied.")),
      () => toast.error(t("Could not copy the section link."))
    );
  };

  return (
    <SectionHeading
      id={id}
      level={level}
      linkTitle={t("Copy link to this section")}
      onLinkClick={handleCopySectionLink}
    >
      {children}
    </SectionHeading>
  );
}
