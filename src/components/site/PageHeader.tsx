import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children?: ReactNode;
}) {
  return (
    <section className="bg-ink pb-10 pt-28 text-ink-foreground lg:pb-14 lg:pt-36 border-b border-ink-border">
      <div className="container-page">
        <p className="eyebrow flex items-center gap-2">
          <span>PAGE</span>
          <span className="text-ink-muted">/</span>
          <span className="text-ink-muted">{eyebrow}</span>
        </p>
        <h1 className="display-lg mt-3 text-ink-foreground">{title}</h1>
        {(intro || children) && (
          <div className="mt-6 grid gap-6 border-t border-ink-border/60 pt-6 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            {intro ? (
              <p className="text-sm sm:text-base leading-relaxed text-ink-muted max-w-xl">
                {intro}
              </p>
            ) : (
              <div />
            )}
            {children && <div className="lg:justify-self-end w-full lg:w-auto">{children}</div>}
          </div>
        )}
      </div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-end">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="display-md mt-1.5 text-foreground">{title}</h2>
        {description && (
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-xl">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Chapter({ n, label, dark }: { n: string; label: string; dark?: boolean }) {
  return (
    <p
      className={`chapter flex items-center gap-2 ${dark ? "text-ink-muted" : "text-muted-foreground"}`}
    >
      <span className="text-primary font-bold">{n}</span>
      <span>/</span>
      <span>{label}</span>
    </p>
  );
}
