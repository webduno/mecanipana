import Link from "next/link";
import type { ReactNode } from "react";
import { HeaderToolbar } from "@/components/header-toolbar";

export type AppWindowShellProps = {
  children: React.ReactNode;
  /**
   * `landing`: solo «Mecanipana» a la izquierda (como portada).
   * `page`: «Mecanipana» + título de pantalla.
   */
  variant?: "landing" | "page";
  /** Obligatorio si `variant === "page"`. */
  title?: string;
  titleIcon?: ReactNode;
  /** Botones extra en el titlebar (después de Mi Info). */
  headerActionsExtra?: ReactNode;
  /** Columna derecha solo en landing + `lg`. */
  aside?: ReactNode;
};

export function AppWindowShell({
  children,
  variant = "page",
  title,
  titleIcon,
  headerActionsExtra,
  aside,
}: AppWindowShellProps) {
  const isLanding = variant === "landing";

  const header = isLanding ? (
    <header className="win98-titlebar flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-none pr-1.5 sm:pr-2">
      <Link
        href="/"
        className="flex min-w-0 flex-1 items-center gap-2 truncate font-bold text-white underline decoration-white underline-offset-2"
      >
        <img
          src="/mecanipanalogo.png"
          alt=""
          width={22}
          height={22}
          className="h-[1.35rem] w-[1.35rem] shrink-0 object-contain"
          aria-hidden
        />
        Mecanipana
      </Link>
      <HeaderToolbar extra={headerActionsExtra} />
    </header>
  ) : (
    <header className="win98-titlebar flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 pr-1.5 sm:pr-2">
      <div className="flex min-w-0 flex-1 items-center gap-x-3 gap-y-1">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-bold text-white underline decoration-white underline-offset-2"
        >
          <img
            src="/mecanipanalogo.png"
            alt=""
            width={22}
            height={22}
            className="h-[1.35rem] w-[1.35rem] shrink-0 object-contain"
            aria-hidden
          />
          Mecanipana
        </Link>
        <span className="flex min-w-0 flex-1 items-center gap-2">
          {titleIcon ? <span className="shrink-0">{titleIcon}</span> : null}
          <span className="min-w-0 truncate">{title ?? ""}</span>
        </span>
      </div>
      <HeaderToolbar extra={headerActionsExtra} />
    </header>
  );

  const body = (
    <div className="win98-body flex flex-col gap-4">{children}</div>
  );

  if (isLanding && aside) {
    return (
      <div className="flex min-h-full flex-1 flex-col p-3 sm:p-6 lg:p-8">
        <div className="win98-window mx-auto flex w-full max-w-lg flex-col lg:max-w-4xl lg:flex-row lg:gap-0">
          <div className="flex min-w-0 flex-1 flex-col">
            {header}
            {body}
          </div>
          {aside}
        </div>
      </div>
    );
  }

  if (isLanding) {
    return (
      <div className="flex min-h-full flex-1 flex-col p-3 sm:p-6 lg:p-8">
        <div className="win98-window mx-auto flex w-full max-w-lg flex-col lg:max-w-4xl">
          {header}
          {body}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col p-3 sm:p-6 lg:p-8">
      <div className="win98-window mx-auto flex w-full max-w-lg flex-col lg:max-w-2xl">
        {header}
        {body}
      </div>
    </div>
  );
}
