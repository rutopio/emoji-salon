import { NotFound as NotFoundPage } from "@rutopio/ui/not-found";
import { Link, useLocation } from "@tanstack/react-router";
import PageLayout from "@/layout";
import { localeForPath, withLocale } from "@/lib/locale";

export function NotFound() {
  const pathname = useLocation({ select: (location) => location.pathname });
  const lang = localeForPath(pathname);
  return (
    <PageLayout>
      <NotFoundPage homeLink={<Link to={withLocale("/", lang)} />} />
    </PageLayout>
  );
}
