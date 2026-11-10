import { DrawerTitle as BaseDrawerTitle } from "@rutopio/base-component/drawer";
import type { ComponentProps } from "react";

export {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerSwipeHandle,
  DrawerTrigger,
} from "@rutopio/base-component/drawer";

export function DrawerTitle({
  className,
  ...props
}: ComponentProps<typeof BaseDrawerTitle>) {
  return (
    <BaseDrawerTitle
      className={["cn-font-heading", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}
