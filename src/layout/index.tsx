import { SiteLayout } from "@rutopio/ui/site-layout";
import type { ReactNode } from "react";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { useT } from "@/lib/translations";

interface PageLayoutProps {
  children: ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  const t = useT();
  return (
    <div className="h-full">
      <SiteLayout>
        <a
          href="#main-content"
          className="focus:bg-background focus:outline-ring sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:px-3 focus:py-2 focus:outline-2"
        >
          {t("Skip to main content")}
        </a>
        <Navbar />
        <main
          id="main-content"
          tabIndex={-1}
          className="flex min-w-0 flex-1 justify-center"
        >
          {children}
        </main>
        <Footer />
      </SiteLayout>
    </div>
  );
}
