import React from "react";
import { Link } from "@tanstack/react-router";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string | undefined;
  actionHref?: string | undefined;
  onAction?: (() => void) | undefined;
  className?: string | undefined;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  actionHref,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-border/80 bg-card/40 my-6",
        className,
      )}
    >
      <div className="h-14 w-14 rounded-2xl bg-secondary/80 flex items-center justify-center text-muted-foreground mb-4 border border-border">
        <Icon className="h-7 w-7 text-primary/80" />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-foreground mb-1 tracking-tight">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && actionHref && (
        <Link
          to={actionHref}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs sm:text-sm hover:opacity-95 shadow-md shadow-primary/20 transition-all"
        >
          {actionText}
        </Link>
      )}
      {actionText && onAction && !actionHref && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs sm:text-sm hover:opacity-95 shadow-md shadow-primary/20 transition-all"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
