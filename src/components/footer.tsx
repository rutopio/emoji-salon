import { GITHUB_REPO_URL } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="mt-auto w-full">
      <div className="w-full py-12 text-center font-mono text-muted-foreground text-sm">
        <div className="flex flex-col items-center gap-2">
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="block rounded-sm hover:text-foreground hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-ring"
          >
            rutopio/emoji-salon
          </a>
          <a
            href="https://chingru.com"
            target="_blank"
            rel="noreferrer noopener"
            className="block rounded-sm hover:text-foreground hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-ring"
          >
            Created by ChingRu
          </a>
        </div>
      </div>
    </footer>
  );
}
