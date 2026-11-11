import { ThemeToggle as BaseThemeToggle } from "@rutopio/ui/theme-toggle";
import type { ComponentProps } from "react";
import { useT } from "@/lib/translations";

export function ThemeToggle(props: ComponentProps<typeof BaseThemeToggle>) {
  const t = useT();
  return (
    <BaseThemeToggle
      toLightLabel={t("Switch to light mode")}
      toDarkLabel={t("Switch to dark mode")}
      {...props}
    />
  );
}
