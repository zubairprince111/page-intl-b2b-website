import { Skeleton } from "./skeleton";

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border/50 bg-card p-4 space-y-3 overflow-hidden shadow-sm animate-pulse"
        >
          <Skeleton className="h-48 w-full rounded-lg bg-secondary/60" />
          <div className="flex items-center justify-between pt-1">
            <Skeleton className="h-4 w-20 bg-secondary/80" />
            <Skeleton className="h-4 w-12 bg-secondary/80" />
          </div>
          <Skeleton className="h-5 w-4/5 bg-secondary" />
          <Skeleton className="h-4 w-3/5 bg-secondary/60" />
          <div className="pt-2 flex items-center justify-between">
            <Skeleton className="h-6 w-24 bg-primary/20" />
            <Skeleton className="h-8 w-20 rounded-md bg-secondary" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="container-page py-12 space-y-8 animate-pulse">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-36" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-4">
          <Skeleton className="h-[440px] w-full rounded-2xl bg-secondary/70" />
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg bg-secondary/50" />
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 rounded bg-primary/20" />
            <Skeleton className="h-8 w-4/5" />
            <Skeleton className="h-5 w-3/5" />
          </div>

          <Skeleton className="h-10 w-44 rounded-lg bg-primary/10" />

          <div className="space-y-3 pt-4 border-t border-border">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          <div className="space-y-3 pt-4">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-[#232323] border border-white/[0.06] rounded-xl overflow-hidden divide-y divide-white/[0.04] animate-pulse">
      <div className="p-4 bg-white/[0.02] flex items-center justify-between">
        <Skeleton className="h-5 w-36 bg-white/[0.08]" />
        <Skeleton className="h-5 w-20 bg-white/[0.08]" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg bg-white/[0.06] shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3 bg-white/[0.08]" />
            <Skeleton className="h-3 w-1/2 bg-white/[0.04]" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full bg-white/[0.06]" />
          <Skeleton className="h-8 w-16 rounded bg-white/[0.06]" />
        </div>
      ))}
    </div>
  );
}

export function AccountCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border/60 bg-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <Skeleton className="h-4 w-32 bg-secondary" />
            <Skeleton className="h-5 w-20 rounded-full bg-secondary" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-2/3 bg-secondary/80" />
            <Skeleton className="h-4 w-1/3 bg-secondary/60" />
          </div>
          <div className="pt-2 flex justify-between items-center">
            <Skeleton className="h-4 w-24 bg-secondary" />
            <Skeleton className="h-8 w-24 rounded bg-primary/20" />
          </div>
        </div>
      ))}
    </div>
  );
}
