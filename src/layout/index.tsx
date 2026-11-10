import type { ReactNode } from "react";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";

interface PageLayoutProps {
  children: ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-full">
      <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col px-3 min-[360px]:px-6">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:outline-2 focus:outline-ring"
        >
          Skip to main content
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
      </div>
    </div>
  );
}
