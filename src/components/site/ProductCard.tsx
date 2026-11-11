import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Plus, Wrench, Zap, ZoomIn } from "lucide-react";
import { type Product } from "@/lib/data";
import { useCart } from "@/lib/cart";
import { normalizeProductGalleryImages } from "@/lib/image-zoom";
import { ProductImageZoomModal } from "@/components/site/ProductImageZoomModal";

export function ProductCard({ p, onQuote }: { p: Product; onQuote?: (p: Product) => void }) {
  const { add, lines } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const out = p.stock === "Out of stock";
  const inCart = lines.some((l) => l.slug === p.slug);
  const galleryImages = useMemo(
    () => normalizeProductGalleryImages({ image: p.image, images: p.images }),
    [p.image, p.images],
  );

  const handleQuoteClick = (e: React.MouseEvent) => {
    if (onQuote) {
      e.preventDefault();
      onQuote(p);
    }
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add(p.slug);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <>
      <article className="group flex flex-col w-full min-w-0 rounded-xl sm:rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-card shadow-2xs transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden">
        {/* Product Image Stage - Edge-to-Edge Cover */}
        <div className="relative aspect-square w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800/80">
          <Link to="/shop/$slug" params={{ slug: p.slug }} className="block h-full w-full">
            <img
              src={p.image}
              alt={p.name}
              loading="lazy"
              width={816}
              height={816}
              className="h-full w-full object-cover object-center transition-transform duration-300 ease-out group-hover:scale-105"
            />
          </Link>

          {/* Minimalist Icon Tag (EV or Machinery) - More Transparent & Faded */}
          {p.mobility?.includes("EV") ? (
            <span
              className="absolute top-2 left-2 z-10 grid h-5.5 w-5.5 sm:h-6 sm:w-6 place-items-center rounded-full bg-emerald-500/[0.04] border border-emerald-500/15 text-emerald-600/40 dark:text-emerald-400/40 opacity-25 hover:opacity-80 backdrop-blur-xs transition-all duration-200"
              title="EV Platform Compatible"
              aria-label="EV Platform Compatible"
            >
              <Zap className="h-2.5 w-2.5 sm:h-3 sm:w-3 stroke-[1.75] fill-none text-emerald-600/50 dark:text-emerald-400/50" />
            </span>
          ) : p.isEquipment ? (
            <span
              className="absolute top-2 left-2 z-10 grid h-5.5 w-5.5 sm:h-6 sm:w-6 place-items-center rounded-full bg-zinc-900/[0.03] border border-zinc-900/10 text-zinc-600/35 dark:text-zinc-400/35 opacity-25 hover:opacity-80 backdrop-blur-xs transition-all duration-200"
              title="Commercial Machinery"
              aria-label="Commercial Machinery"
            >
              <Wrench className="h-2.5 w-2.5 sm:h-3 sm:w-3 stroke-[1.75]" />
            </span>
          ) : null}

          {/* Quick Image Zoom View Trigger */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setZoomOpen(true);
            }}
            title="Zoom product image"
            aria-label={`Zoom view for ${p.name}`}
            className="absolute top-2 right-2 z-10 grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-full bg-white/85 dark:bg-zinc-900/85 hover:bg-white dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:text-primary border border-zinc-200/80 dark:border-zinc-700/80 shadow-xs backdrop-blur-sm opacity-85 group-hover:opacity-100 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <ZoomIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </div>

        {/* Product Content Details - Clean & Minimalist */}
        <div className="flex flex-1 flex-col p-2.5 sm:p-4 min-w-0">
          {/* Product Title */}
          <Link
            to="/shop/$slug"
            params={{ slug: p.slug }}
            className="line-clamp-2 text-xs sm:text-sm font-semibold text-foreground leading-snug hover:text-primary transition-colors min-h-[2rem] sm:min-h-[2.5rem] break-words"
          >
            {p.name}
          </Link>

          {/* Bottom Stock Indicator */}
          <div className="mt-auto pt-2 sm:pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80">
            <div className="flex items-center text-xs mb-1.5 sm:mb-2">
              <span
                className={`text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  out ? "text-destructive" : "text-emerald-600"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                    out ? "bg-destructive" : "bg-emerald-500"
                  }`}
                />
                <span>{p.stock}</span>
              </span>
            </div>

            {/* Action Buttons: Direct Quote & Plus-Only Add to Cart Button */}
            <div className="flex items-center gap-1.5 sm:gap-2 w-full min-w-0">
              {onQuote ? (
                <button
                  type="button"
                  onClick={handleQuoteClick}
                  className="h-8 sm:h-9 flex-1 px-1.5 sm:px-3 text-[10px] sm:text-xs font-bold tracking-wider uppercase rounded-lg sm:rounded-xl flex items-center justify-center bg-primary text-white hover:bg-primary/90 transition-all active:scale-95 cursor-pointer whitespace-nowrap min-w-0 shadow-xs"
                >
                  <span>Get Quote</span>
                </button>
              ) : (
                <Link
                  to="/shop/$slug"
                  params={{ slug: p.slug }}
                  className="h-8 sm:h-9 flex-1 px-1.5 sm:px-3 text-[10px] sm:text-xs font-bold tracking-wider uppercase rounded-lg sm:rounded-xl flex items-center justify-center bg-primary text-white hover:bg-primary/90 transition-all active:scale-95 whitespace-nowrap min-w-0 shadow-xs"
                >
                  <span>Get Quote</span>
                </Link>
              )}

              <div className="relative shrink-0">
                {justAdded && (
                  <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 z-30 whitespace-nowrap rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-bold text-white shadow-lg ring-2 ring-white dark:ring-zinc-950 animate-in fade-in zoom-in-75 slide-in-from-bottom-2 duration-150">
                    +1 Added!
                  </span>
                )}
                <button
                  type="button"
                  disabled={out}
                  onClick={handleAdd}
                  className={`grid h-8 w-8 sm:h-9 sm:w-9 shrink-0 place-items-center rounded-lg sm:rounded-xl border transition-all cursor-pointer shadow-xs active:scale-90 ${
                    inCart
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold"
                      : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-2xs"
                  }`}
                  title={inCart ? "In your cart (tap to add another)" : "Add to Cart"}
                  aria-label={inCart ? "In your cart (tap to add another)" : "Add to Cart"}
                >
                  {inCart ? (
                    <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600" />
                  ) : (
                    <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>

      {zoomOpen && (
        <ProductImageZoomModal
          open={zoomOpen}
          onOpenChange={setZoomOpen}
          productName={p.name}
          brand={p.brand}
          sku={p.sku}
          productSlug={p.slug}
          images={galleryImages}
        />
      )}
    </>
  );
}
