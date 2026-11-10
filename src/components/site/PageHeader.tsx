import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  intro,
  image,
  imageAlt,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  image?: string;
  imageAlt?: string;
  children?: ReactNode;
}) {
  if (image) {
    return (
      <section className="relative overflow-hidden bg-ink text-ink-foreground border-b border-ink-border md:min-h-[430px] lg:min-h-[475px] flex items-end">
        {/* Desktop/Tablet full-bleed background visual (right-anchored for clean left typography) */}
        <img
          src={image}
          alt={imageAlt ?? title}
          width={1376}
          height={768}
          fetchPriority="high"
          className="hidden md:block absolute inset-y-0 right-0 h-full w-full object-cover object-[92%_12%] lg:w-[72%] xl:w-[68%]"
        />
        {/* Left fade into solid dark panel + soft vertical readability scrim */}
        <div
          className="hidden md:block absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, var(--color-ink) 0%, oklch(0.12 0.005 260 / 0.96) 33%, oklch(0.12 0.005 260 / 0.72) 52%, oklch(0.12 0.005 260 / 0.14) 80%, transparent 100%)",
          }}
        />
        <div className="hidden md:block absolute inset-0 bg-gradient-to-b from-ink/70 via-transparent to-ink/50 pointer-events-none" />

        <div className="container-page relative z-10 pt-24 pb-8 sm:pt-28 sm:pb-10 md:pt-32 md:pb-14 lg:pt-36 lg:pb-16">
          <div className="max-w-md lg:max-w-xl xl:max-w-2xl">
            <p className="eyebrow flex items-center gap-2">
              <span>PAGE</span>
              <span className="text-ink-muted">/</span>
              <span className="text-ink-foreground/85">{eyebrow}</span>
            </p>
            <h1 className="display-lg mt-3 text-ink-foreground">{title}</h1>
            {intro && (
              <p className="mt-5 border-t border-ink-border/70 pt-5 text-sm sm:text-base leading-relaxed text-zinc-300">
                {intro}
              </p>
            )}
            {children && <div className="mt-6">{children}</div>}
          </div>

          {/* Mobile clean 16:9 framed hero photo below copy so text never covers subject */}
          <div className="mt-6 overflow-hidden rounded-xl border border-ink-border/70 shadow-lg md:hidden">
            <img
              src={image}
              alt={imageAlt ?? title}
              width={1376}
              height={768}
              fetchPriority="high"
              className="w-full aspect-[16/9] object-cover object-center"
            />
          </div>
        </div>
      </section>
    );
  }

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
