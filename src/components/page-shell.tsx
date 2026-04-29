import type { ReactNode } from "react";
import {
  AppWindowShell,
  type AppWindowShellProps,
} from "@/components/app-window-shell";

export type PageShellProps = {
  title: string;
  titleIcon?: ReactNode;
  children: ReactNode;
  headerActionsExtra?: AppWindowShellProps["headerActionsExtra"];
};

/** Pantalla interior: mismo header que la landing + título de página + `HeaderToolbar`. */
export function PageShell({
  title,
  titleIcon,
  children,
  headerActionsExtra,
}: PageShellProps) {
  return (
    <AppWindowShell
      variant="page"
      title={title}
      titleIcon={titleIcon}
      headerActionsExtra={headerActionsExtra}
    >
      {children}
    </AppWindowShell>
  );
}
