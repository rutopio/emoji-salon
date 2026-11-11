import { AttributionFooter } from "@rutopio/ui/footer";
import { GITHUB_REPO_URL } from "@/lib/constants";

export default function Footer() {
  return (
    <AttributionFooter
      repository={{ href: GITHUB_REPO_URL, label: "rutopio/emoji-salon" }}
      author={{ href: "https://chingru.com", label: "Created by ChingRu" }}
      partner={{ href: "https://justfont.com", label: "justfont" }}
    />
  );
}
