import Link from "next/link";
import type { ReactNode } from "react";

export function PageShell({
  title,
  titleIcon,
  children,
}: {
  title: string;
  titleIcon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col p-3 sm:p-6 lg:p-8">
      <div className="win98-window mx-auto flex w-full max-w-lg flex-col lg:max-w-2xl">
        <header className="win98-titlebar shrink-0 flex flex-wrap items-center gap-x-3 gap-y-1">
          <Link
            href="/"
            className="text-white underline decoration-white underline-offset-2 shrink-0"
          >
            ← Inicio
          </Link>
          <span className="flex min-w-0 flex-1 items-center gap-2">
            {titleIcon ? <span className="shrink-0">{titleIcon}</span> : null}
            <span className="min-w-0 truncate">{title}</span>
          </span>
        </header>
        <div className="win98-body flex flex-col gap-4">{children}</div>
      </div>
    </div>
  );
}
