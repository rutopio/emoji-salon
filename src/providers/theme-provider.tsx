import { ThemeProvider as NextThemesProvider } from "next-themes";

import type { ComponentProps } from "react";

function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      storageKey="emojisalon-theme"
      defaultTheme="light"
      enableColorScheme
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

export { ThemeProvider };
